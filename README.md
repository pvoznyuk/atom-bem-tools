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

<div>
  <div style="display: inline-block; vertical-align: top;  width: 46%; margin-right: 2%;">
    Pseudocode
  </div>
  <div style="display: inline-block; vertical-align: top; width: 46%; margin-right: 2%;">
    HTML
  </div>
</div>

<div>
  <div style="display: inline-block; vertical-align: top;  width: 46%; margin-right: 2%;">
<hr/>  
<pre>
spaceship
  cabin
    span.pilot--awake
    span.pilot--copilot--asleep
  cargo
</pre>
  </div>
  <div style="display: inline-block; vertical-align: top; width: 46%; margin-right: 2%;">
<hr/>  
<pre lang="html">
&lt;div class=&quot;spaceship&quot;&gt;
  &lt;div class=&quot;spaceship__cabin&quot;&gt;
    &lt;span class=&quot;spaceship__pilot spaceship__pilot--awake&quot;&gt;&lt;/span&gt;
    &lt;span class=&quot;spaceship__pilot spaceship__pilot--copilot spaceship__pilot--asleep&quot;&gt;&lt;/span&gt;
  &lt;/div&gt;
  &lt;div class=&quot;spaceship__cargo&quot;&gt;&lt;/div&gt;
&lt;/div&gt;  
</pre>
  </div>
</div>

<div>
  <div style="display: inline-block; vertical-align: top;  width: 46%; margin-right: 2%;">
<hr/>  
<pre>
spaceship
  a.section*3 CONTENT
</pre>
  </div>
  <div style="display: inline-block; vertical-align: top; width: 46%; margin-right: 2%;">
<hr/>  
<pre lang="html">
&lt;div class=&quot;spaceship&quot;&gt;
  &lt;a class=&quot;spaceship__section&quot; href=&quot;#&quot;&gt;CONTENT&lt;/a&gt;
  &lt;a class=&quot;spaceship__section&quot; href=&quot;#&quot;&gt;CONTENT&lt;/a&gt;
  &lt;a class=&quot;spaceship__section&quot; href=&quot;#&quot;&gt;CONTENT&lt;/a&gt;
&lt;/div&gt; 
</pre>
    
  </div>
</div>
