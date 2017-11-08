# BEM Tools

Some handy tools to make developing BEM HTML code in Atom even more faster.
It can convert BEM JSON, HTML, CSS/SCSS and some Pug-like code into each other.

## Installing

`apm install bem-tools`

### Show Usages
Default shortcut: `ctrl+alt+b`.
All the commands are also available with context menu.

#### HTML to CSS/SCSS
![HTML to CSS](https://raw.githubusercontent.com/pvoznyuk/atom-bem-tools/master/demo/html-to-css.gif)

#### Pug-like code to HTML/SCSS
![Pseudocode to HTML/CSS](https://raw.githubusercontent.com/pvoznyuk/atom-bem-tools/master/demo/pug-to-html.gif)

#### Pug-like code to BEMJSON
![Pseudocode to BEMJSON](https://raw.githubusercontent.com/pvoznyuk/atom-bem-tools/master/demo/pug-to-json.gif)

#### HTML to BEMJSON
![HTML to BEM JSON](https://raw.githubusercontent.com/pvoznyuk/atom-bem-tools/master/demo/html-to-json.gif)

#### BEMJSON to HTML/SCSS
![BEMJSON to HTML/SCSS](https://raw.githubusercontent.com/pvoznyuk/atom-bem-tools/master/demo/json-to-html.gif)

## Some pug-like pseudocode cases

<table>
  <tr>
    <th>Pseudocode</th>
    <th>HTML</th>
  </tr>
<tr>  
<td>
<pre>
spaceship
  cabin
    span.pilot--awake
    span.pilot--copilot--asleep
  cargo
</pre>
</td>
<td>
```html
<div class="spaceship">
  <div class="spaceship__cabin">
    <span class="spaceship__pilot spaceship__pilot--awake"></span>
    <span class="spaceship__pilot spaceship__pilot--copilot spaceship__pilot--asleep"></span>
  </div>
  <div class="spaceship__cargo"></div>
</div>  
```
</td>
</tr>
<tr>  
<td>
<pre>
```
spaceship
  a.section*3 CONTENT
```  
</pre>
</td>
<td>
```html
<div class="spaceship">
  <a class="spaceship__section" href="#">CONTENT</a>
  <a class="spaceship__section" href="#">CONTENT</a>
  <a class="spaceship__section" href="#">CONTENT</a>
</div>
```
  </pre>
</td>
</tr>
</table>
 
