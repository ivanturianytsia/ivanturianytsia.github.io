/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/css-loader/index.js!./node_modules/sass-loader/lib/loader.js!./src/scss/main.scss":
/*!***********************************************************************************************!*\
  !*** ./node_modules/css-loader!./node_modules/sass-loader/lib/loader.js!./src/scss/main.scss ***!
  \***********************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("exports = module.exports = __webpack_require__(/*! ../../node_modules/css-loader/lib/css-base.js */ \"./node_modules/css-loader/lib/css-base.js\")(false);\n// imports\n\n\n// module\nexports.push([module.i, \":root {\\n  --color-grey-dark-1: #333;\\n  --color-grey-dark-2: #777;\\n  --color-grey-dark-3: #999;\\n  --color-grey-light-1: #f9f9f9;\\n  --color-grey-light-2: #f2f2f2;\\n  --color-grey-light-3: #eee;\\n  --color-grey-light-4: #ccc;\\n  --color-oriole: #ff7913;\\n  --color-rasp: #d72d5c;\\n  --color-citrus: #ffb025;\\n  --color-primary: #336b87;\\n  --color-primary-light: #90afc5;\\n  --color-secondary-dark: #2a3132;\\n  --color-secondary: #763626;\\n  --shadow-small: 0 1rem 2rem rgba(0, 0, 0, 0.06);\\n  --shadow-big: 0 2rem 6rem rgba(0, 0, 0, 0.3); }\\n\\n*,\\n*::after,\\n*::before {\\n  margin: 0;\\n  padding: 0;\\n  box-sizing: inherit; }\\n\\nhtml {\\n  box-sizing: border-box;\\n  font-size: 62.5%;\\n  font-family: \\\"Lato\\\", sans-serif; }\\n\\nbody {\\n  background: linear-gradient(to top right, var(--color-primary), var(--color-primary-light)) no-repeat;\\n  min-height: 100vh;\\n  color: var(--color-grey-dark-1); }\\n\\n.heading-1 {\\n  font-size: 3rem; }\\n\\n.heading-2 {\\n  font-size: 3rem;\\n  font-weight: 300;\\n  padding-bottom: 3rem;\\n  text-align: center; }\\n\\n.heading-3 {\\n  font-size: 1.5rem;\\n  font-weight: 400;\\n  padding-bottom: 0.5rem;\\n  text-transform: uppercase; }\\n\\n.paragraph {\\n  font-size: 1.6rem;\\n  font-weight: 400; }\\n\\n.list {\\n  list-style: none;\\n  text-align: left; }\\n  .list__item {\\n    font-size: 1.1em; }\\n    .list__item:not(:last-child) {\\n      padding-bottom: 1rem; }\\n  .list__bullet {\\n    margin-right: 1rem;\\n    color: var(--color-citrus); }\\n\\n.container {\\n  width: 90rem;\\n  margin: 10rem auto 0;\\n  box-shadow: var(--shadow-big); }\\n  @media only screen and (max-width: 56.25em) {\\n    .container {\\n      width: 100%;\\n      margin: 0; } }\\n  @media only screen and (max-width: 37.5em) {\\n    .container {\\n      margin: 10rem auto 0; } }\\n\\n@keyframes floatUp {\\n  0% {\\n    opacity: 0;\\n    transform: translateY(5rem); }\\n  100% {\\n    opacity: 1;\\n    transform: translate(0); } }\\n\\n.header {\\n  display: flex;\\n  align-items: center;\\n  align-content: space-between;\\n  padding-bottom: 2rem;\\n  background-color: var(--color-grey-light-2); }\\n  @media only screen and (max-width: 37.5em) {\\n    .header {\\n      flex-direction: column;\\n      align-items: center; } }\\n  .header__title {\\n    display: block;\\n    text-align: center;\\n    margin: auto;\\n    padding: 5rem 0;\\n    animation: floatUp 2s; }\\n    .header__title--name {\\n      display: block; }\\n    .header__title--job {\\n      display: block;\\n      color: transparent;\\n      -webkit-background-clip: text;\\n      background-clip: text;\\n      background-image: linear-gradient(to right, var(--color-rasp), var(--color-oriole)); }\\n  .header__img-box {\\n    height: 30rem;\\n    width: 30rem;\\n    overflow: hidden;\\n    flex: 0 0 30rem;\\n    border-radius: 50%;\\n    transform: scale(0.8);\\n    box-shadow: var(--shadow-small); }\\n    @media only screen and (max-width: 37.5em) {\\n      .header__img-box {\\n        order: -1;\\n        margin-top: -5rem;\\n        transform: scale(0.9); } }\\n  .header__img {\\n    width: 100%; }\\n\\nsection {\\n  position: relative;\\n  padding: 5rem 0;\\n  font-size: 1.6rem;\\n  background-color: var(--color-grey-light-2);\\n  width: 100%; }\\n\\n.section-skills {\\n  position: relative;\\n  padding-top: 10rem;\\n  padding-bottom: 10rem;\\n  overflow: hidden; }\\n\\n.skills {\\n  z-index: 5;\\n  padding: 0 5rem;\\n  display: grid;\\n  grid-template-columns: repeat(auto-fit, minmax(17rem, 1fr));\\n  grid-row-gap: 1rem;\\n  grid-column-gap: 1rem; }\\n  .skills__box {\\n    z-index: 10;\\n    padding: 2rem 2rem;\\n    display: flex;\\n    flex-direction: column;\\n    justify-content: start;\\n    box-sizing: content-box;\\n    background-color: rgba(249, 249, 249, 0.9);\\n    box-shadow: var(--shadow-small); }\\n  .skills__heading {\\n    color: var(--color-oriole);\\n    margin-bottom: 1rem; }\\n  .skills__icon {\\n    margin-right: 0.7rem;\\n    color: var(--color-grey-dark-1); }\\n  .skills__title {\\n    z-index: 10; }\\n  .skills__svg {\\n    position: absolute;\\n    top: 0;\\n    height: auto;\\n    width: 100%;\\n    color: #ccc;\\n    left: 50%;\\n    transform: translateX(-50%); }\\n    @media only screen and (max-width: 56.25em) {\\n      .skills__svg {\\n        width: auto;\\n        height: 100%; } }\\n\\n.about {\\n  padding: 10rem 0;\\n  margin: -5rem 0;\\n  z-index: 10;\\n  background-image: linear-gradient(to left, var(--color-grey-light-3), var(--color-grey-light-1));\\n  display: flex;\\n  flex-direction: column;\\n  align-items: center;\\n  -webkit-clip-path: polygon(0 0, 100% 5rem, 100% 100%, 0 calc(100% - 5rem));\\n  clip-path: polygon(0 0, 100% 5rem, 100% 100%, 0 calc(100% - 5rem)); }\\n  @media only screen and (max-width: 37.5em) {\\n    .about {\\n      padding: 10rem 2rem; } }\\n\\n.section-contact {\\n  padding-bottom: 10rem;\\n  padding-top: 10rem;\\n  margin-top: -5rem;\\n  background: var(--color-secondary-dark);\\n  color: var(--color-grey-light-2);\\n  -webkit-clip-path: polygon(0 0, 100% 5rem, 100% 100%, 0 100%);\\n  clip-path: polygon(0 0, 100% 5rem, 100% 100%, 0 100%); }\\n\\n.contact-list {\\n  list-style: none;\\n  margin: 0 auto;\\n  padding: 0 2rem;\\n  max-width: 55rem;\\n  display: grid;\\n  grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));\\n  grid-row-gap: 3rem;\\n  grid-column-gap: 3rem;\\n  justify-content: center; }\\n  .contact-list__item {\\n    display: block;\\n    list-style: none; }\\n  .contact-list__icon {\\n    margin-right: 1rem; }\\n\\n.btn:link, .btn:visited {\\n  position: relative;\\n  display: block;\\n  padding: 1.5rem 0.8rem;\\n  text-align: center;\\n  font-size: 1.1em;\\n  font-weight: 300;\\n  color: #fff;\\n  text-decoration: none;\\n  background-image: linear-gradient(to left, var(--color-oriole), var(--color-rasp));\\n  border-radius: 10rem;\\n  transition: all 0.2s;\\n  cursor: pointer; }\\n\\n.btn:hover {\\n  transform: translateY(-3px);\\n  box-shadow: 0 1rem 2rem rgba(0, 0, 0, 0.2); }\\n  .btn:hover::after {\\n    transform: scaleX(1.4) scaleY(1.6);\\n    opacity: 0; }\\n\\n.btn:active, .btn:focus {\\n  transform: translateY(-1px);\\n  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.2);\\n  outline: none; }\\n\\n.btn::after {\\n  content: \\\"\\\";\\n  position: absolute;\\n  display: inline-block;\\n  height: 100%;\\n  width: 100%;\\n  top: 0;\\n  left: 0;\\n  z-index: -1;\\n  background-image: linear-gradient(to left, var(--color-oriole), var(--color-rasp));\\n  border-radius: 10rem;\\n  transition: all 0.4s; }\\n\", \"\"]);\n\n// exports\n\n\n//# sourceURL=webpack:///./src/scss/main.scss?./node_modules/css-loader!./node_modules/sass-loader/lib/loader.js");

/***/ }),

/***/ "./node_modules/css-loader/lib/css-base.js":
/*!*************************************************!*\
  !*** ./node_modules/css-loader/lib/css-base.js ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("/*\n\tMIT License http://www.opensource.org/licenses/mit-license.php\n\tAuthor Tobias Koppers @sokra\n*/\n// css base code, injected by the css-loader\nmodule.exports = function(useSourceMap) {\n\tvar list = [];\n\n\t// return the list of modules as css string\n\tlist.toString = function toString() {\n\t\treturn this.map(function (item) {\n\t\t\tvar content = cssWithMappingToString(item, useSourceMap);\n\t\t\tif(item[2]) {\n\t\t\t\treturn \"@media \" + item[2] + \"{\" + content + \"}\";\n\t\t\t} else {\n\t\t\t\treturn content;\n\t\t\t}\n\t\t}).join(\"\");\n\t};\n\n\t// import a list of modules into the list\n\tlist.i = function(modules, mediaQuery) {\n\t\tif(typeof modules === \"string\")\n\t\t\tmodules = [[null, modules, \"\"]];\n\t\tvar alreadyImportedModules = {};\n\t\tfor(var i = 0; i < this.length; i++) {\n\t\t\tvar id = this[i][0];\n\t\t\tif(typeof id === \"number\")\n\t\t\t\talreadyImportedModules[id] = true;\n\t\t}\n\t\tfor(i = 0; i < modules.length; i++) {\n\t\t\tvar item = modules[i];\n\t\t\t// skip already imported module\n\t\t\t// this implementation is not 100% perfect for weird media query combinations\n\t\t\t//  when a module is imported multiple times with different media queries.\n\t\t\t//  I hope this will never occur (Hey this way we have smaller bundles)\n\t\t\tif(typeof item[0] !== \"number\" || !alreadyImportedModules[item[0]]) {\n\t\t\t\tif(mediaQuery && !item[2]) {\n\t\t\t\t\titem[2] = mediaQuery;\n\t\t\t\t} else if(mediaQuery) {\n\t\t\t\t\titem[2] = \"(\" + item[2] + \") and (\" + mediaQuery + \")\";\n\t\t\t\t}\n\t\t\t\tlist.push(item);\n\t\t\t}\n\t\t}\n\t};\n\treturn list;\n};\n\nfunction cssWithMappingToString(item, useSourceMap) {\n\tvar content = item[1] || '';\n\tvar cssMapping = item[3];\n\tif (!cssMapping) {\n\t\treturn content;\n\t}\n\n\tif (useSourceMap && typeof btoa === 'function') {\n\t\tvar sourceMapping = toComment(cssMapping);\n\t\tvar sourceURLs = cssMapping.sources.map(function (source) {\n\t\t\treturn '/*# sourceURL=' + cssMapping.sourceRoot + source + ' */'\n\t\t});\n\n\t\treturn [content].concat(sourceURLs).concat([sourceMapping]).join('\\n');\n\t}\n\n\treturn [content].join('\\n');\n}\n\n// Adapted from convert-source-map (MIT)\nfunction toComment(sourceMap) {\n\t// eslint-disable-next-line no-undef\n\tvar base64 = btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap))));\n\tvar data = 'sourceMappingURL=data:application/json;charset=utf-8;base64,' + base64;\n\n\treturn '/*# ' + data + ' */';\n}\n\n\n//# sourceURL=webpack:///./node_modules/css-loader/lib/css-base.js?");

/***/ }),

/***/ "./node_modules/style-loader/lib/addStyles.js":
/*!****************************************************!*\
  !*** ./node_modules/style-loader/lib/addStyles.js ***!
  \****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("/*\n\tMIT License http://www.opensource.org/licenses/mit-license.php\n\tAuthor Tobias Koppers @sokra\n*/\n\nvar stylesInDom = {};\n\nvar\tmemoize = function (fn) {\n\tvar memo;\n\n\treturn function () {\n\t\tif (typeof memo === \"undefined\") memo = fn.apply(this, arguments);\n\t\treturn memo;\n\t};\n};\n\nvar isOldIE = memoize(function () {\n\t// Test for IE <= 9 as proposed by Browserhacks\n\t// @see http://browserhacks.com/#hack-e71d8692f65334173fee715c222cb805\n\t// Tests for existence of standard globals is to allow style-loader\n\t// to operate correctly into non-standard environments\n\t// @see https://github.com/webpack-contrib/style-loader/issues/177\n\treturn window && document && document.all && !window.atob;\n});\n\nvar getTarget = function (target) {\n  return document.querySelector(target);\n};\n\nvar getElement = (function (fn) {\n\tvar memo = {};\n\n\treturn function(target) {\n                // If passing function in options, then use it for resolve \"head\" element.\n                // Useful for Shadow Root style i.e\n                // {\n                //   insertInto: function () { return document.querySelector(\"#foo\").shadowRoot }\n                // }\n                if (typeof target === 'function') {\n                        return target();\n                }\n                if (typeof memo[target] === \"undefined\") {\n\t\t\tvar styleTarget = getTarget.call(this, target);\n\t\t\t// Special case to return head of iframe instead of iframe itself\n\t\t\tif (window.HTMLIFrameElement && styleTarget instanceof window.HTMLIFrameElement) {\n\t\t\t\ttry {\n\t\t\t\t\t// This will throw an exception if access to iframe is blocked\n\t\t\t\t\t// due to cross-origin restrictions\n\t\t\t\t\tstyleTarget = styleTarget.contentDocument.head;\n\t\t\t\t} catch(e) {\n\t\t\t\t\tstyleTarget = null;\n\t\t\t\t}\n\t\t\t}\n\t\t\tmemo[target] = styleTarget;\n\t\t}\n\t\treturn memo[target]\n\t};\n})();\n\nvar singleton = null;\nvar\tsingletonCounter = 0;\nvar\tstylesInsertedAtTop = [];\n\nvar\tfixUrls = __webpack_require__(/*! ./urls */ \"./node_modules/style-loader/lib/urls.js\");\n\nmodule.exports = function(list, options) {\n\tif (typeof DEBUG !== \"undefined\" && DEBUG) {\n\t\tif (typeof document !== \"object\") throw new Error(\"The style-loader cannot be used in a non-browser environment\");\n\t}\n\n\toptions = options || {};\n\n\toptions.attrs = typeof options.attrs === \"object\" ? options.attrs : {};\n\n\t// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>\n\t// tags it will allow on a page\n\tif (!options.singleton && typeof options.singleton !== \"boolean\") options.singleton = isOldIE();\n\n\t// By default, add <style> tags to the <head> element\n        if (!options.insertInto) options.insertInto = \"head\";\n\n\t// By default, add <style> tags to the bottom of the target\n\tif (!options.insertAt) options.insertAt = \"bottom\";\n\n\tvar styles = listToStyles(list, options);\n\n\taddStylesToDom(styles, options);\n\n\treturn function update (newList) {\n\t\tvar mayRemove = [];\n\n\t\tfor (var i = 0; i < styles.length; i++) {\n\t\t\tvar item = styles[i];\n\t\t\tvar domStyle = stylesInDom[item.id];\n\n\t\t\tdomStyle.refs--;\n\t\t\tmayRemove.push(domStyle);\n\t\t}\n\n\t\tif(newList) {\n\t\t\tvar newStyles = listToStyles(newList, options);\n\t\t\taddStylesToDom(newStyles, options);\n\t\t}\n\n\t\tfor (var i = 0; i < mayRemove.length; i++) {\n\t\t\tvar domStyle = mayRemove[i];\n\n\t\t\tif(domStyle.refs === 0) {\n\t\t\t\tfor (var j = 0; j < domStyle.parts.length; j++) domStyle.parts[j]();\n\n\t\t\t\tdelete stylesInDom[domStyle.id];\n\t\t\t}\n\t\t}\n\t};\n};\n\nfunction addStylesToDom (styles, options) {\n\tfor (var i = 0; i < styles.length; i++) {\n\t\tvar item = styles[i];\n\t\tvar domStyle = stylesInDom[item.id];\n\n\t\tif(domStyle) {\n\t\t\tdomStyle.refs++;\n\n\t\t\tfor(var j = 0; j < domStyle.parts.length; j++) {\n\t\t\t\tdomStyle.parts[j](item.parts[j]);\n\t\t\t}\n\n\t\t\tfor(; j < item.parts.length; j++) {\n\t\t\t\tdomStyle.parts.push(addStyle(item.parts[j], options));\n\t\t\t}\n\t\t} else {\n\t\t\tvar parts = [];\n\n\t\t\tfor(var j = 0; j < item.parts.length; j++) {\n\t\t\t\tparts.push(addStyle(item.parts[j], options));\n\t\t\t}\n\n\t\t\tstylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};\n\t\t}\n\t}\n}\n\nfunction listToStyles (list, options) {\n\tvar styles = [];\n\tvar newStyles = {};\n\n\tfor (var i = 0; i < list.length; i++) {\n\t\tvar item = list[i];\n\t\tvar id = options.base ? item[0] + options.base : item[0];\n\t\tvar css = item[1];\n\t\tvar media = item[2];\n\t\tvar sourceMap = item[3];\n\t\tvar part = {css: css, media: media, sourceMap: sourceMap};\n\n\t\tif(!newStyles[id]) styles.push(newStyles[id] = {id: id, parts: [part]});\n\t\telse newStyles[id].parts.push(part);\n\t}\n\n\treturn styles;\n}\n\nfunction insertStyleElement (options, style) {\n\tvar target = getElement(options.insertInto)\n\n\tif (!target) {\n\t\tthrow new Error(\"Couldn't find a style target. This probably means that the value for the 'insertInto' parameter is invalid.\");\n\t}\n\n\tvar lastStyleElementInsertedAtTop = stylesInsertedAtTop[stylesInsertedAtTop.length - 1];\n\n\tif (options.insertAt === \"top\") {\n\t\tif (!lastStyleElementInsertedAtTop) {\n\t\t\ttarget.insertBefore(style, target.firstChild);\n\t\t} else if (lastStyleElementInsertedAtTop.nextSibling) {\n\t\t\ttarget.insertBefore(style, lastStyleElementInsertedAtTop.nextSibling);\n\t\t} else {\n\t\t\ttarget.appendChild(style);\n\t\t}\n\t\tstylesInsertedAtTop.push(style);\n\t} else if (options.insertAt === \"bottom\") {\n\t\ttarget.appendChild(style);\n\t} else if (typeof options.insertAt === \"object\" && options.insertAt.before) {\n\t\tvar nextSibling = getElement(options.insertInto + \" \" + options.insertAt.before);\n\t\ttarget.insertBefore(style, nextSibling);\n\t} else {\n\t\tthrow new Error(\"[Style Loader]\\n\\n Invalid value for parameter 'insertAt' ('options.insertAt') found.\\n Must be 'top', 'bottom', or Object.\\n (https://github.com/webpack-contrib/style-loader#insertat)\\n\");\n\t}\n}\n\nfunction removeStyleElement (style) {\n\tif (style.parentNode === null) return false;\n\tstyle.parentNode.removeChild(style);\n\n\tvar idx = stylesInsertedAtTop.indexOf(style);\n\tif(idx >= 0) {\n\t\tstylesInsertedAtTop.splice(idx, 1);\n\t}\n}\n\nfunction createStyleElement (options) {\n\tvar style = document.createElement(\"style\");\n\n\toptions.attrs.type = \"text/css\";\n\n\taddAttrs(style, options.attrs);\n\tinsertStyleElement(options, style);\n\n\treturn style;\n}\n\nfunction createLinkElement (options) {\n\tvar link = document.createElement(\"link\");\n\n\toptions.attrs.type = \"text/css\";\n\toptions.attrs.rel = \"stylesheet\";\n\n\taddAttrs(link, options.attrs);\n\tinsertStyleElement(options, link);\n\n\treturn link;\n}\n\nfunction addAttrs (el, attrs) {\n\tObject.keys(attrs).forEach(function (key) {\n\t\tel.setAttribute(key, attrs[key]);\n\t});\n}\n\nfunction addStyle (obj, options) {\n\tvar style, update, remove, result;\n\n\t// If a transform function was defined, run it on the css\n\tif (options.transform && obj.css) {\n\t    result = options.transform(obj.css);\n\n\t    if (result) {\n\t    \t// If transform returns a value, use that instead of the original css.\n\t    \t// This allows running runtime transformations on the css.\n\t    \tobj.css = result;\n\t    } else {\n\t    \t// If the transform function returns a falsy value, don't add this css.\n\t    \t// This allows conditional loading of css\n\t    \treturn function() {\n\t    \t\t// noop\n\t    \t};\n\t    }\n\t}\n\n\tif (options.singleton) {\n\t\tvar styleIndex = singletonCounter++;\n\n\t\tstyle = singleton || (singleton = createStyleElement(options));\n\n\t\tupdate = applyToSingletonTag.bind(null, style, styleIndex, false);\n\t\tremove = applyToSingletonTag.bind(null, style, styleIndex, true);\n\n\t} else if (\n\t\tobj.sourceMap &&\n\t\ttypeof URL === \"function\" &&\n\t\ttypeof URL.createObjectURL === \"function\" &&\n\t\ttypeof URL.revokeObjectURL === \"function\" &&\n\t\ttypeof Blob === \"function\" &&\n\t\ttypeof btoa === \"function\"\n\t) {\n\t\tstyle = createLinkElement(options);\n\t\tupdate = updateLink.bind(null, style, options);\n\t\tremove = function () {\n\t\t\tremoveStyleElement(style);\n\n\t\t\tif(style.href) URL.revokeObjectURL(style.href);\n\t\t};\n\t} else {\n\t\tstyle = createStyleElement(options);\n\t\tupdate = applyToTag.bind(null, style);\n\t\tremove = function () {\n\t\t\tremoveStyleElement(style);\n\t\t};\n\t}\n\n\tupdate(obj);\n\n\treturn function updateStyle (newObj) {\n\t\tif (newObj) {\n\t\t\tif (\n\t\t\t\tnewObj.css === obj.css &&\n\t\t\t\tnewObj.media === obj.media &&\n\t\t\t\tnewObj.sourceMap === obj.sourceMap\n\t\t\t) {\n\t\t\t\treturn;\n\t\t\t}\n\n\t\t\tupdate(obj = newObj);\n\t\t} else {\n\t\t\tremove();\n\t\t}\n\t};\n}\n\nvar replaceText = (function () {\n\tvar textStore = [];\n\n\treturn function (index, replacement) {\n\t\ttextStore[index] = replacement;\n\n\t\treturn textStore.filter(Boolean).join('\\n');\n\t};\n})();\n\nfunction applyToSingletonTag (style, index, remove, obj) {\n\tvar css = remove ? \"\" : obj.css;\n\n\tif (style.styleSheet) {\n\t\tstyle.styleSheet.cssText = replaceText(index, css);\n\t} else {\n\t\tvar cssNode = document.createTextNode(css);\n\t\tvar childNodes = style.childNodes;\n\n\t\tif (childNodes[index]) style.removeChild(childNodes[index]);\n\n\t\tif (childNodes.length) {\n\t\t\tstyle.insertBefore(cssNode, childNodes[index]);\n\t\t} else {\n\t\t\tstyle.appendChild(cssNode);\n\t\t}\n\t}\n}\n\nfunction applyToTag (style, obj) {\n\tvar css = obj.css;\n\tvar media = obj.media;\n\n\tif(media) {\n\t\tstyle.setAttribute(\"media\", media)\n\t}\n\n\tif(style.styleSheet) {\n\t\tstyle.styleSheet.cssText = css;\n\t} else {\n\t\twhile(style.firstChild) {\n\t\t\tstyle.removeChild(style.firstChild);\n\t\t}\n\n\t\tstyle.appendChild(document.createTextNode(css));\n\t}\n}\n\nfunction updateLink (link, options, obj) {\n\tvar css = obj.css;\n\tvar sourceMap = obj.sourceMap;\n\n\t/*\n\t\tIf convertToAbsoluteUrls isn't defined, but sourcemaps are enabled\n\t\tand there is no publicPath defined then lets turn convertToAbsoluteUrls\n\t\ton by default.  Otherwise default to the convertToAbsoluteUrls option\n\t\tdirectly\n\t*/\n\tvar autoFixUrls = options.convertToAbsoluteUrls === undefined && sourceMap;\n\n\tif (options.convertToAbsoluteUrls || autoFixUrls) {\n\t\tcss = fixUrls(css);\n\t}\n\n\tif (sourceMap) {\n\t\t// http://stackoverflow.com/a/26603875\n\t\tcss += \"\\n/*# sourceMappingURL=data:application/json;base64,\" + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + \" */\";\n\t}\n\n\tvar blob = new Blob([css], { type: \"text/css\" });\n\n\tvar oldSrc = link.href;\n\n\tlink.href = URL.createObjectURL(blob);\n\n\tif(oldSrc) URL.revokeObjectURL(oldSrc);\n}\n\n\n//# sourceURL=webpack:///./node_modules/style-loader/lib/addStyles.js?");

/***/ }),

/***/ "./node_modules/style-loader/lib/urls.js":
/*!***********************************************!*\
  !*** ./node_modules/style-loader/lib/urls.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("\n/**\n * When source maps are enabled, `style-loader` uses a link element with a data-uri to\n * embed the css on the page. This breaks all relative urls because now they are relative to a\n * bundle instead of the current page.\n *\n * One solution is to only use full urls, but that may be impossible.\n *\n * Instead, this function \"fixes\" the relative urls to be absolute according to the current page location.\n *\n * A rudimentary test suite is located at `test/fixUrls.js` and can be run via the `npm test` command.\n *\n */\n\nmodule.exports = function (css) {\n  // get current location\n  var location = typeof window !== \"undefined\" && window.location;\n\n  if (!location) {\n    throw new Error(\"fixUrls requires window.location\");\n  }\n\n\t// blank or null?\n\tif (!css || typeof css !== \"string\") {\n\t  return css;\n  }\n\n  var baseUrl = location.protocol + \"//\" + location.host;\n  var currentDir = baseUrl + location.pathname.replace(/\\/[^\\/]*$/, \"/\");\n\n\t// convert each url(...)\n\t/*\n\tThis regular expression is just a way to recursively match brackets within\n\ta string.\n\n\t /url\\s*\\(  = Match on the word \"url\" with any whitespace after it and then a parens\n\t   (  = Start a capturing group\n\t     (?:  = Start a non-capturing group\n\t         [^)(]  = Match anything that isn't a parentheses\n\t         |  = OR\n\t         \\(  = Match a start parentheses\n\t             (?:  = Start another non-capturing groups\n\t                 [^)(]+  = Match anything that isn't a parentheses\n\t                 |  = OR\n\t                 \\(  = Match a start parentheses\n\t                     [^)(]*  = Match anything that isn't a parentheses\n\t                 \\)  = Match a end parentheses\n\t             )  = End Group\n              *\\) = Match anything and then a close parens\n          )  = Close non-capturing group\n          *  = Match anything\n       )  = Close capturing group\n\t \\)  = Match a close parens\n\n\t /gi  = Get all matches, not the first.  Be case insensitive.\n\t */\n\tvar fixedCss = css.replace(/url\\s*\\(((?:[^)(]|\\((?:[^)(]+|\\([^)(]*\\))*\\))*)\\)/gi, function(fullMatch, origUrl) {\n\t\t// strip quotes (if they exist)\n\t\tvar unquotedOrigUrl = origUrl\n\t\t\t.trim()\n\t\t\t.replace(/^\"(.*)\"$/, function(o, $1){ return $1; })\n\t\t\t.replace(/^'(.*)'$/, function(o, $1){ return $1; });\n\n\t\t// already a full url? no change\n\t\tif (/^(#|data:|http:\\/\\/|https:\\/\\/|file:\\/\\/\\/|\\s*$)/i.test(unquotedOrigUrl)) {\n\t\t  return fullMatch;\n\t\t}\n\n\t\t// convert the url to a full url\n\t\tvar newUrl;\n\n\t\tif (unquotedOrigUrl.indexOf(\"//\") === 0) {\n\t\t  \t//TODO: should we add protocol?\n\t\t\tnewUrl = unquotedOrigUrl;\n\t\t} else if (unquotedOrigUrl.indexOf(\"/\") === 0) {\n\t\t\t// path should be relative to the base url\n\t\t\tnewUrl = baseUrl + unquotedOrigUrl; // already starts with '/'\n\t\t} else {\n\t\t\t// path should be relative to current directory\n\t\t\tnewUrl = currentDir + unquotedOrigUrl.replace(/^\\.\\//, \"\"); // Strip leading './'\n\t\t}\n\n\t\t// send back the fixed url(...)\n\t\treturn \"url(\" + JSON.stringify(newUrl) + \")\";\n\t});\n\n\t// send back the fixed css\n\treturn fixedCss;\n};\n\n\n//# sourceURL=webpack:///./node_modules/style-loader/lib/urls.js?");

/***/ }),

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _scss_main_scss__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./scss/main.scss */ \"./src/scss/main.scss\");\n/* harmony import */ var _scss_main_scss__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_scss_main_scss__WEBPACK_IMPORTED_MODULE_0__);\n\n\nconst icons = [\n\t'#js',\n\t'#aws',\n\t'#html5',\n\t'#css3',\n\t'#jenkins',\n\t'#linux',\n\t'#sass',\n\t'#vuejs',\n\t'#node-js',\n\t'#docker',\n\t'#digital-ocean',\n\t'#font-awesome',\n\t'#git',\n\t'#github',\n\t'#gitlab',\n\t'#grunt',\n\t'#gulp',\n\t'#python',\n\t'#angular',\n\t'#codepen'\n]\n\nconst maxvy = 10 // Max y-velocity\nconst size = 40 // Width and height of elements\nconst g = .1 // Gravity\n\nconst svg = document.querySelector('#falling-skills')\nconst vb = svg.getAttribute('viewBox').split(' ')\n\nconst getInitialPosition = () => {\n\tconst r = Math.random()\n\treturn {\n\t\tx: Math.random() * (vb[2] - size),\n\t\ty: -size,\n\t\tvx: 0,\n\t\tvy: r * maxvy,\n\t\tfill: `rgba(0, 0, 0, ${r * 0.3})`\n\t}\n}\n\nlet items = icons.map(item => {\n\t// <image x=\"10\" y=\"20\" width=\"80\" height=\"80\" xlink:href=\"image.svg\" />\n\tconst { x, y, vx, vy, vr, fill } = getInitialPosition()\n\tconst el = document.createElementNS('http://www.w3.org/2000/svg', 'use')\n\tel.setAttributeNS(null, 'x', x)\n\tel.setAttributeNS(null, 'y', y)\n\tel.setAttributeNS(null, 'width', size)\n\tel.setAttributeNS(null, 'height', size)\n\tel.setAttributeNS(null, 'fill', fill)\n\tel.setAttributeNS('http://www.w3.org/1999/xlink', 'href', item)\n\tsvg.appendChild(el)\n\treturn { el, x, y, vx, vy, vr, fill, a: 0 }\n})\n\nconst update = function() {\n\titems.forEach(item => {\n\t\t// gravity only acts in the y direction, increasing the velocity down\n\t\titem.vy += g\n\n\t\titem.x += item.vx // we take the time to be 1\n\t\titem.y += item.vy // we take the time to be 1\n\n\t\titem.el.setAttributeNS(null, 'x', item.x)\n\t\titem.el.setAttributeNS(null, 'y', item.y)\n\t\titem.el.setAttributeNS(null, 'fill', item.fill)\n\n\t\tif (item.y >= vb[3]) {\n\t\t\tconst { x, y, vx, vy, vr, fill } = getInitialPosition()\n\t\t\titem.x = x\n\t\t\titem.y = y\n\t\t\titem.vx = vx\n\t\t\titem.vy = vy\n\t\t\titem.fill = fill\n\t\t}\n\t})\n\trequestAnimationFrame(update)\n}\n\nupdate()\n\n\n//# sourceURL=webpack:///./src/index.js?");

/***/ }),

/***/ "./src/scss/main.scss":
/*!****************************!*\
  !*** ./src/scss/main.scss ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("\nvar content = __webpack_require__(/*! !../../node_modules/css-loader!../../node_modules/sass-loader/lib/loader.js!./main.scss */ \"./node_modules/css-loader/index.js!./node_modules/sass-loader/lib/loader.js!./src/scss/main.scss\");\n\nif(typeof content === 'string') content = [[module.i, content, '']];\n\nvar transform;\nvar insertInto;\n\n\n\nvar options = {\"hmr\":true}\n\noptions.transform = transform\noptions.insertInto = undefined;\n\nvar update = __webpack_require__(/*! ../../node_modules/style-loader/lib/addStyles.js */ \"./node_modules/style-loader/lib/addStyles.js\")(content, options);\n\nif(content.locals) module.exports = content.locals;\n\nif(false) {}\n\n//# sourceURL=webpack:///./src/scss/main.scss?");

/***/ })

/******/ });