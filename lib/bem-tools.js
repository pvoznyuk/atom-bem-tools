'use babel';

import { CompositeDisposable } from 'atom';
import BEMHtml from 'bem-json-to-html';
import BEMCss from 'bemjson-to-scss';
import pretty from 'prettify-html';
import html2bemjson from 'html2bemjson';

const HTML = 'html',
      BEMJSON = 'json',
      CSS = 'css',
      SCSS = 'scss',
      PSEUDO = 'pseudocode';

const selectionTypes = {};
selectionTypes[PSEUDO] =  [HTML, BEMJSON, SCSS, CSS];
selectionTypes[BEMJSON] =  [HTML, SCSS, CSS];
selectionTypes[HTML] =  [SCSS, CSS, BEMJSON];

export default {

  bemToolsView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'bem-tools:toggle': () => this.run(),
      'bem-tools:to_json': () => this.run({to: BEMJSON}),
      'bem-tools:to_css': () => this.run({to: CSS}),
      'bem-tools:to_scss': () => this.run({to: SCSS}),
    }));
  },

  deactivate() {
    this.subscriptions.dispose();
  },

  run(_config = {}) {
    const config = _config;
    const selectedText = this._getSelectedText();
    const selectionType = this._detectSelection(selectedText, config);

    if (selectionType) {
      config.from = selectionType;
      config.to = config.to || selectionTypes[selectionType][0];
      const FROM = config.from.toUpperCase();
      const TO = config.to.toUpperCase();
      const functionName = `_${config.from}To${TO.replace('SCSS', 'CSS')}`;

      if (typeof this[functionName] === 'function') {
        this[functionName](selectedText, Object.assign({insert: true}, config));
      } else {
        this._showErrorNotification(`Cannot convert ${FROM} to ${TO}`);
      }

    } else {
      this._showErrorNotification('Please select a valid code.')
    }

  },

  serialize() {
    return {};
  },

  _detectSelection(selectedText, config) {
    const trimedText = selectedText.trim();
    let firstChar = null;

    if (trimedText) {
      firstChar = trimedText[0];

      if (firstChar === '<') {
        return HTML;
      } else if (firstChar === '{') {
        return BEMJSON;
      } else {
        return PSEUDO;
      }
    }

    return null;
  },

  /**
   * Return selected text for current opened file
   * @private
   *
   * @returns {String}
   */
  _getSelectedText() {
    return atom.workspace.getActiveTextEditor().getSelectedText();
  },

  /**
   * Returns BEM structure object with applied _numbers
   * @private
   *
   * @returns {Object}
   */
  _applyNumbers(structure) {

    const LOOP_LIMIT = 2000;
    let modifiedStructure = structure,
        knit,
        iterator = 0;

    const multipleNode = (obj, index = 0) => {
      if (obj._number > 1) {
        return {
          node: obj,
          index
        };
      } else if (Array.isArray(obj.content)) {
        const result = obj.content.find((item, index) => multipleNode(item, index));
        if (result) {
          const resultIndex = result._parent.content.indexOf(result);
          if (result._number > 1) {
            return {
              node: result,
              index: resultIndex
            }
          } else {
            return multipleNode(result, resultIndex);
          }
        }
      }
      return null;
    }

    while (knit = multipleNode(modifiedStructure)) {
      iterator++;
      if (iterator > LOOP_LIMIT) {
        this._showErrorNotification('Too many nodes! Try to simplify your code.');
        break;
      }
      const nodeCount = knit.node._number;
      knit.node._number = 1;
      if (knit.node._parent && Array.isArray(knit.node._parent.content)) {
        const restNodes = Array.from(new Array(nodeCount), () => knit.node);
        knit.node._parent.content.splice(knit.index, 1, ...restNodes);
      }
    }

    return modifiedStructure;
  },

  /**
   * Returns a node for BEM structure
   * @private
   *
   * @param {String} line to process
   * @param {Object} prevNode - BEM node object for previously processed line
   * @returns {Object}
   */
  _parseLine(line, prevNode) {
    const regex = /([\s]*)([a-zA-Z0-9\*\.-]+)[ ]*([\S ]*)/iu;
    const result = line.match(regex);
    const data = {
      _line: line,
      _tabs: !prevNode || !result[1] ? 0 : result[1].length,
      content: result[3] || [],
    };

    const parts = result[2].split('.');
    let classname;

    if (parts[0] && !parts[1]) {
      // only classname
      data.tag = 'div';
      classname = parts[0];
    } else if (parts[0] && parts[1]) {
      // tag and classname
      data.tag = parts[0];
      classname = parts[1];
    }

    const parts2 = classname.split('*');

    if ( parts2[0]) {
      const mods =  parts2[0].split('--');
      if (mods.length > 1) {
        parts2[0] = mods.shift();
        const modField = !prevNode ? 'mods' : 'elemMods';
        data[modField] = {};

        mods.forEach((item) => {
          data[modField][item] = true;
        });
      }
    }

    data[!prevNode ? 'block' : 'elem'] = parts2[0];
    data._number = ~~parts2[1] || 1;

    return data;
  },

  /**
   * Returns a closest parent for a BEM node based on _tabs param
   * @private
   *
   * @param {Object} node of previous BEM node
   * @param {Integer} tabs for currently processing node
   * @returns {Object}
   */
  _closestParent(node, tabs) {
    if (node._parent === null) {
      return node;
    } else if (node._parent._tabs < tabs) {
      return node._parent;
    } else {
      return this._closestParent(node._parent, tabs);
    }
  },

  _htmlToJSON(string, config) {
    try {
      const json = html2bemjson.convert(string, {
        naming: {
          mod: '--'
        }
      });

      if (json) {
        jsonString = JSON.stringify(this._cleanBEMJSON(json, config), null, '  ');

        if (!config.silent) {
          atom.clipboard.write(jsonString);
          this._showInfoNotification('BEM JSON code has been written to the clipboard.');
        }

        return json;
      }
    } catch( err ) {
      this._showErrorNotification(err.message);
      console.error(err); // eslint-disable-line
    }
    return null;
  },

  _htmlToCSS(string, config) {
    const json = this._htmlToJSON(string, {silent: true});
    if (json) {
      return this._jsonToCSS(json, Object.assign({}, config, {insert: false}));
    }
    return null;
  },

  _htmlToHTML(string, config) {
    return this._htmlToCSS(string, config);
  },

  _pseudocodeToObject(string, config) {

    try {
      const textEditor = atom.workspace.getActiveTextEditor();
      const input = textEditor.getTextInBufferRange(textEditor.getSelectedBufferRange());
      const lines = string.split(/\r?\n/);

      if (lines && lines.length && (lines.length > 1 || lines[0] != '')) {
        let structure = {},
            currentNode;

        lines.forEach((line, index) => {
          const trimmedLine = line.trim();
          let lineData = trimmedLine === '' ? {} : this._parseLine(line, currentNode);

          if (lineData.elem || lineData.block) {
            if (!currentNode) {
              structure = lineData;
              structure._parent = null;
              currentNode = structure;
            } else {
              if (trimmedLine === '') {

              } else if (lineData._tabs > currentNode._tabs) {
                // child
                lineData._parent = currentNode;
                if (Array.isArray(currentNode.content)) {
                  currentNode.content.push(lineData);
                } else {
                  currentNode.content = [lineData];
                }

              } else  if (lineData._tabs < currentNode._tabs) {
                // some parent's sibling
                const closestParent = this._closestParent(currentNode, lineData._tabs);
                if (closestParent) {
                  lineData._parent = closestParent;
                  if (Array.isArray(closestParent.content)) {
                    closestParent.content.push(lineData);
                  } else {
                    closestParent.content = [ lineData ];
                  }
                }

              } else {
                // sibling
                lineData._parent = currentNode._parent;
                if (Array.isArray(currentNode._parent.content)) {
                  currentNode._parent.content.push(lineData);
                } else {
                  currentNode._parent.content = [lineData];
                }

              }
              currentNode = lineData;

            }
          }
        });

        return this._applyNumbers(structure);

      } else {
        this._showErrorNotification('Please select some lines');
      }

    } catch (err) {
      this._showErrorNotification(err.message);
      console.error(err); // eslint-disable-line
    }

    return null;
  },

  _cleanBEMJSON(obj, config) {
    if (typeof obj === 'object') {
      if (Array.isArray(obj)) {
        return obj.map((item) => this._cleanBEMJSON(item, config));
      } else {
        Object.keys(obj).forEach(function(key) {
          if (key[0] === '_') {
            delete obj[key];
          }
        });

        if (obj.mods && obj.elem && !obj.elemMods) {
          obj.elemMods = obj.mods;
        }

        if (Array.isArray(obj.content)) {
          obj.content = this._cleanBEMJSON(obj.content, config);
        }
        return obj;
      }
    } else {
      return obj;
    }
  },

  _pseudocodeToJSON(string, config) {
    let json = this._pseudocodeToObject(string, config);
    json = this._cleanBEMJSON(json, config);
    jsonString = JSON.stringify(json, null, '  ');
    if (config.insert) {
      const textEditor = atom.workspace.getActiveTextEditor();
      textEditor.insertText(jsonString);
    } else if (!config.silent) {
      atom.clipboard.write(jsonString);
      this._showInfoNotification('BEM JSON code has been written to the clipboard.');
    }
    return json;
  },

  _pseudocodeToHTML(string, config) {
    const bemjson = this._pseudocodeToObject(string, config);

    if (bemjson) {
      const html = this._jsonToHTML(bemjson, config);
    }
  },

  _pseudocodeToCSS(string, config) {
    const json = this._pseudocodeToJSON(string, {silent: true});
    return this._jsonToCSS(json, config);
  },

  _jsonToBEMJSON(structure, config) {
    if (typeof structure === 'string') {
      try {
        const parsedStructure = eval(`(${structure})`);
        return this._cleanBEMJSON(parsedStructure);
      } catch (err) {
        this._showErrorNotification('Cannot convert these lines to a JS Object.');
        return null;
      }
    } else if (typeof structure === 'object') {
      return structure;
    }

    return null;
  },

  _jsonToHTML(string, config) {
    const structure = this._jsonToBEMJSON(string);

    if (typeof structure === 'object') {
      const outputHtml = pretty(new BEMHtml({
        modificatorSeparator: '--',
        addDefautTagAttributes: true
      }).toHtml(structure));
      if (outputHtml) {
        const textEditor = atom.workspace.getActiveTextEditor();
        textEditor.insertText(outputHtml);
        const CssOutput = new BEMCss({modificatorSeparator: '--', compileTo: 'scss'}).toCSS(structure);

        if (CssOutput) {
          atom.clipboard.write(CssOutput);
          this._showInfoNotification('SCSS code has been written to the clipboard.');
        }
        return outputHtml
      } else {
        this._showErrorNotification('Please select some valid lines.');
      }
    }

    return null;
  },

  _jsonToCSS(string, config) {
    const json = this._jsonToBEMJSON(string);

    if (json) {
      const css = new BEMCss({
        modificatorSeparator: '--',
        tab: '  ',
        compileTo: config.to || 'scss'
      }).toCSS(json);

      if (css) {
        if (!config.silent) {
          atom.clipboard.write(css);
          this._showInfoNotification( config.to.toUpperCase() + ' code has been written to the clipboard.');
        }
        return css;
      }
    }

    this._showErrorNotification('Cannot convert this code to ' + config.to.toUpperCase());
    return null;
  },

  /**
    * Show info notification
    * @private
    *
    * @param {String} message — notification text
    */
  _showInfoNotification(message) {
    if (this._isShowInfoNotification()) {
      atom.notifications.addInfo(message);
    }
  },

  /**
    * Show error notification
    * @private
    *
    * @param {String} message notification text
  */
  _showErrorNotification(message) {
    if (this._isShowErrorNotification()) {
      atom.notifications.addError(message);
    }
  },

  /**
   * Check if error notifications should be shown
   * @private
   *
   * @returns {Boolean}
   */
  _isShowErrorNotification() {
    return atom.config.get('atomhtmltobemscss.showNotifications') && atom.notifications && atom.notifications.addError;
  },

   /**
   * Check if info notifications should be shown
   * @private
   *
   * @returns {Boolean}
   */
  _isShowInfoNotification() {
    return true;
    // atom.config.get('htmltobem.showNotifications') && atom.notifications && atom.notifications.addInfo;
  },


};
