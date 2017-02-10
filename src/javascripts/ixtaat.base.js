/**
 *
 * Date: 26.01.13
 * Time: 13:38
 * Copyright 2013 H-Ixtaat
 *
 * WWW.H-Ixtaat.DE
 *
 */


/************************************************************************************************
 *
 * Base Functions
 *
 ************************************************************************************************/

(function(globals) {
  "use strict";

  /************************************************************************************************
   *
   * Read Script-Tag-Attributes from document as initial Settings
   *
   ************************************************************************************************/

  var scripts = document.getElementsByTagName("script");
  var config = {};

  for (var i = 0; i < scripts.length; i++) {
    var n = scripts[i];
    var src = n.getAttribute("src") || "";
    if (src.match(/\/ixtaat\.js$/i)) {
      var conf = (n.getAttribute("config"));
      if (conf) {
        var obj = eval("({ " + conf + " })");
        for (var key in obj) {
          config[key] = obj[key];
        }
      }
    }
  }

  /**
   * load files from config and embedd the content
   * in invisble div at start of dom
   * for using with
   * <svg role="img" title="delete"><use xlink:href="defs.svg#icon-delete"></use></svg>
   */
  if (config['svgfiles']) {
    document.addEventListener("DOMContentLoaded", function (event) {
      var files = config['svgfiles'].split(';');
      for(var i in files) {
        Ixtaat.info("load svgfile " + files[i]);
        var ajax = new XMLHttpRequest();
        ajax.open("GET", files[i], true);
        ajax.send();
        ajax.onload = function(e) {
          var div = document.createElement("div");
          div.innerHTML = ajax.responseText;
          div.style.display = 'none';
          document.body.insertBefore(div, document.body.childNodes[0]);
        }
      }
    });
  }


  /************************************************************************************************
   *
   * General Functions
   *
   ************************************************************************************************/

  /**
   *
   * @param {type} candidate
   * @returns {Boolean}
   */
  var isFunction = function (candidate) {
    return typeof candidate === "function";
  };

  /**
   *
    * @param candidate
   * @returns {boolean}
   */
  var isArray = function (candidate) {
    return candidate instanceof Array;
  };
  /**
   *
   * @param candidate
   * @returns {boolean}
   */
  var isNumeric = function (candidate) {
    return !isNaN(parseFloat(candidate)) && isFinite(candidate);
  };

  /**
   *
   * @param candidate
   * @returns {boolean}
   */
  var isString = function (candidate) {
    return typeof candidate === 'string';
  };
  /**
   *
   * @param candidate
   * @returns {boolean}
   */
  var isDate = function (candidate) {
    return typeof candidate === '[object Date]';
  };

  var _class2type = {
    "[object Boolean]": "boolean",
    "[object Number]": "number",
    "[object String]": "string",
    "[object Function]": "function",
    "[object Array]": "array",
    "[object Date]": "date",
    "[object RegExp]": "regexp",
    "[object Object]": "object"
  };

  /**
   *
   * @param obj
   * @returns {*}
   */
  var getType = function (obj) {
    return obj == null ? String(obj) : _class2type[Object.prototype.toString.call(obj)] || "object"
  };

  /**
   *
   * @param candidate
   * @returns {boolean}
   */
  var isPlainObject = function (candidate) {
    var hasOwn = Object.prototype.hasOwnProperty;
    if (!candidate || getType(candidate) !== 'object' || candidate.nodeType) {
      return false
    }
    try {
      if (candidate.constructor && !hasOwn.call(candidate, "constructor") && !hasOwn.call(candidate.constructor.prototype, "isPrototypeOf")) {
        return false
      }
    } catch (e) {
      return false
    }
    var key;
    for (key in candidate) {
    }
    return key === undefined || hasOwn.call(candidate, key)
  }

  /**
   *
   * @param candidate
   * @returns {boolean}
   */
  var isEmptyObject = function (candidate) {
    var name;
    for (name in candidate) {
      return false;
    }
    return true;
  };

  /**
   *
   * @param options
   */
  var bindProperty = function (options) {

    var readOnly = false, setter;

    var getter = options.getter || function () {
        return options.from[options.property || options.fromProperty];
      };

    if (options.getter) {
      if (options.setter != undefined) {
        setter = options.setter;
      } else {
        readOnly = true;
      }
    } else {
      setter = function (value) {
        options.from[options.property || options.fromProperty] =
          value;
      }
    }

    Object.defineProperty(options.to, options.property || options.toProperty, {
      get: getter,
      set: setter,
      readOnly: readOnly,
      enumerable: true
    });
  };

  /**
   *
   * @param dest
   * @param source
   * @param [source n]
   *
   * @returns {*}
   */
  var extend = function () {
    var deep, i, target, options, name, src, copy,
      targetIsArray, copyIsArray, clone,
      length = arguments.length;

    if (typeof arguments[0] === "boolean") {
      deep = arguments[0];
      target = arguments[1];
      i = 2;
    } else {
      deep = false;
      target = arguments[0];
      i = 1;
    }

    if (!target ) return target;

    if (typeof target !== "object" && !isFunction(target)) {
      error('cannot extend ' + typeof target);
    }

    if (!target['__isActiveClone']) {

      target['__isActiveClone'] = true;
      targetIsArray = isArray(target);
      for (; i < length; i++) {
        if ((options = arguments[i]) !== null) {
          // Extend the base object
          for (name in options) {
            src = target[name];
            copy = options[name];
            if (target === copy) {
              continue
            }
            if (deep && copy && (isPlainObject(copy) || (copyIsArray = isArray(copy)))) {
              if (copyIsArray) {
                copyIsArray = false;
                clone = src && isArray(src) ? src : []
              } else {
                clone = src && isPlainObject(src) ? src : {};
              }
              // WARNING: RECURSION
              if (targetIsArray) {
                target.push(extend(deep, clone, copy));
              } else {
                target[name] = extend(deep, clone, copy);
              }
            } else if (copy !== undefined) {
              if (targetIsArray) {
                target.push(copy);
              } else {
                target[name] = copy;
              }
            }
          }
        }
      }
    }
    delete target['__isActiveClone'];
    return target;
  }


  /**
   * extends HTMLElement
   *
   * @param destination
   * @param source
   * @returns {*}
   */
  var extendElement = function (destination, source) {
    var style = source.style;
    var cssClass = source.className;
    delete source.style;
    delete source.className;

    Ixtaat.extend(destination, source);

    if (style) {
      Ixtaat.extend(destination.style, style);
    }
    if (cssClass) {
      destination.className += " " + cssClass;
    }

    return destination;
  }

  /**
   * throws new Error with given Message
   *
   * @param msg
   */
  var error = function (msg) {
    throw new Error(msg);
  }

  /**
   * convert data to json-String
   * @param data
   */
  var toJson = function (data) {

    if (JSON && JSON.parse) {
      return JSON.stringify(data);
    }

    if (window.JSON && window.JSON.parse) {
      return window.JSON.stringify(data);
    }

    error("No Json Handler present");
  };

  /**
   * convert json-string to js-Object
   */
  var fromJson = function (str) {
    if (JSON && JSON.parse) {
      return JSON.parse(str);
    }

    if (window.JSON && window.JSON.parse) {
      return window.JSON.parse(str);
    }

    error("No Json Handler present");
  };

  /************************************************************************************************
   *
   * Helper Functions
   *
   ************************************************************************************************/

  /**
   * writes given arguments to console and include Line Number and Filename
   */
  var output = function() {
    var error;

    var args = Array.prototype.slice.call(arguments, 0);

    try {
      throw Error('');
    } catch (err) {
      error = err;
    }

    var suffix;

    suffix = error.lineNumber ? error.fileName + ':' + error.lineNumber + ":1" // add arbitrary column value for chrome linking
      : extractLineNumberFromStack(error.stack);

    args.push("at");
    args.push(suffix);




    if (console && console.log) {
      if (console.log.apply) {
        console.log.apply(console, args);
      } else {
        console.log(args);
      } // nicer display in some browsers
    }
  };

  var extractLineNumberFromStack = function(stack) {
    /// <summary>
    /// Get the line/filename detail from a Webkit stack trace.  See http://stackoverflow.com/a/3806596/1037948
    /// </summary>
    /// <param name="stack" type="String">the stack string</param>

    // correct line number according to how Log().write implemented
    var lines = stack.split('\n');
    var line = lines[lines.length-1];
    // fix for various display text
    line = (line.indexOf(' (') >= 0 ? line.split(' (')[1].substring(0, line
        .length -
      1) : line.split('at ')[1]);
    return line;

  };

  /**
   * writes given arguments to console when in debug mode
   */
  var debug = function() {
    if (config.debug) output.apply(this, arguments);
  };

  /**
   * writes given arguments to console
   */
  var info = function() {
    output.apply(this, arguments);
  };

  /**
   *
   * @param meta
   * @returns {string}
   */
  var getMeta = function(meta) {
    var metas = document.getElementsByTagName('META');
    var i;
    for (i = 0; i < metas.length; i++) {
      if (metas[i].getAttribute('NAME') == meta)
        return metas[i].getAttribute('CONTENT');
    }
  };

  /**
   * wait execution for
   * @param milliseconds
   */
  var sleep = function(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
      if ((new Date().getTime() - start) > milliseconds) {
        break;
      }
    }
  };

  /**
   * TODO
   * @param obj
   * @returns {Array}
   */

  var getObjectInheritance = function (obj) {
    var hierarchy = [];
    if (['boolean', 'number', 'string', 'undefined'].indexOf(typeof obj) !== -1 || obj === null) { // support for primitives types
      obj = Object(obj);
    } else if (typeof obj === 'function') {
      hierarchy.push(obj.name || (obj.toString().match(/function (\w*)/) || obj.toString().match(/\[object (\w*)\]/))[1] || 'Anonymous Function');
      obj = obj.prototype;
    } else if (obj.toString() !== '[object Object]' && obj.prototype) { // fix Objects instances and IE
      hierarchy.push(obj.prototype.constructor.name || (obj.prototype.constructor.toString().match(/function (\w*)/) || obj.prototype.constructor.toString().match(/\[object (\w*)\]/))[1] || 'Anonymous Function');
      obj = obj.prototype;
    } else if (!Object.getPrototypeOf(obj) && obj.constructor) {
      hierarchy.push(obj.constructor.name || (obj.constructor.toString().match(/function (\w*)/) || obj.constructor.toString().match(/\[object (\w*)\]/))[1] || 'Anonymous Function');
    }
    while (obj = Object.getPrototypeOf(obj)) {
      if (obj && obj.constructor) {
        hierarchy.push(obj.constructor.name || (obj.constructor.toString().match(/function (\w*)/) || obj.constructor.toString().match(/\[object (\w*)\]/))[1] || 'Anonymous Function');
      }
    }
    return hierarchy;
  };


  /************************************************************************************************
   *
   * I18N
   *
   ************************************************************************************************/

  config.locale = config.locale || "de";

  /**
   * TODO
   * @param s
   * @returns {*}
   */
  var sprintf = function(s) {
    var bits = s.split('%');
    var out = bits[0];
    var re = /^([ds])(.*)$/;
    for (var i = 1; i < bits.length; i++) {
      var p = re.exec(bits[i]);
      if (!p || arguments[i] == null) continue;
      if (p[1] == 'd') {
        out += parseInt(arguments[i], 10);
      } else if (p[1] == 's') {
        out += arguments[i];
      }
      out += p[2];
    }
    return out;
  };

  /**
   * TODO
   * @returns {*}
   */
  var translate = function() {
    var arr = Array.prototype.slice.call(arguments);
    var s = arr.shift();
    if (typeof(Ixtaat.i18n) != 'undefined' && Ixtaat.i18n[s]) {
      var r = Ixtaat.i18n[s];
      arr.unshift(r || s);
      return sprintf.apply(this, arr);
    }
    return s;
  };

  /************************************************************************************************
   *
   * Requirement/Loader
   *
   ************************************************************************************************/

  /**
   * TODO
   */
  var require = (function() {

    var cache = {};

    // load synchron
    function loadScript(url) {
      var xhr = new XMLHttpRequest(),
        fnBody;
      xhr.open('get', url, false);
      xhr.send();
      if (xhr.status === 200) {
        if (xhr.getResponseHeader('Content-Type').match(/javascript$/i)) {
          fnBody = '(function(){var exports = {};\n' + xhr.responseText +
            '\nreturn exports;})();\n//@ sourceURL=' + url + '\n';
          cache[url] = (new Function(fnBody)).call({});
        }
      } else {
        info("required extension not loaded : ", url, " ", xhr.status);
      }
    }

    function resolve(module) {
      config.path = config.path || "";
      return config.path + module + ".js";
    }

    function require(module) {
      var url = resolve(module);
      if (!Object.prototype.hasOwnProperty.call(cache, url)) {
        debug("load required module : ", module);
        loadScript(url);
      }
      return cache[url];
    }

    require.cache = cache;

    return require;
  }());



  // Opera 8.0+
  var isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
  // Firefox 1.0+
  var isFirefox = typeof InstallTrigger !== 'undefined';
  // At least Safari 3+: "[object HTMLElementConstructor]"
  var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
  // Internet Explorer 6-11
  var isIE = /*@cc_on!@*/false || !!document.documentMode;
  // Edge 20+
  var isEdge = !isIE && !!window.StyleMedia;
  // Chrome 1+
  var isChrome = !!window.chrome && !!window.chrome.webstore;
  // Blink engine detection
  var isBlink = (isChrome || isOpera) && !!window.CSS;



  /************************************************************************************************
   *
   * Exports
   *
   ************************************************************************************************/

//  if (!globals.$) globals.$ = Sizzle;

  globals._ = translate;

  globals.Ixtaat = {
    bindProperty: bindProperty,
    config: config,
//    clone: clone,
    getObjectInheritance: getObjectInheritance,
    isFunction: isFunction,
    isArray: isArray,
    isNumeric: isNumeric,
    isString: isString,
    isDate: isDate,
    isEmptyObject: isEmptyObject,
    isPlainObject: isPlainObject,

    getType: getType,
    extendElement: extendElement,
    extend: extend,
    error: error,
    toJson: toJson,
    fromJson: fromJson,
    require: require,
    getMeta: getMeta,
    debug: debug,
    info: info,
    sleep: sleep,
    isChrome: isChrome,
    isOpera: isOpera,
    isFirefox: isFirefox,
    isSafari: isSafari,
    isIE: isIE,
    isEdge: isEdge,
    isBlink: isBlink
  };
})(this);