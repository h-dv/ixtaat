/**
 *
 * Date: 26.01.13
 * Time: 13:38
 * Copyright 2013 H-DV
 *
 * WWW.H-DV.DE
 *
 */


/************************************************************************************************
 *
 * Base Functions
 *
 ************************************************************************************************/

(function (globals) {
  "use strict";

	/************************************************************************************************
	 *
	 * Read Script-Tag-Attributes from document as initial Settings
	 *
	 ************************************************************************************************/

  var scripts = document.getElementsByTagName("script");

  var config = {
    loader: {
      paths: []
    },
    i18n: {

    }
  };

  for (var i = 0; i < scripts.length; i++) {
    var n = scripts[i];
    var src = n.getAttribute("src") || "";
    if ((src.match(/\/ixtaat\./i))) {
      var conf = (n.getAttribute("config"));
      if (conf) {
        var obj = eval("({ " + conf + " })");
        for (var key in obj) {
          config[key] = obj[key];
        }
      }
    }
  }

  function _normalizePath(path) {
    if (!path) {
      path = '';
    } else {
      if (!path.endsWith('/')) path = path + '/'
    }
    return path;
  }

  config.cssPath = _normalizePath(config.cssPath);
  config.jsPath = _normalizePath(config.jsPath);


	/************************************************************************************************
	 *
	 * Requirement/Loader
	 *
	 ************************************************************************************************/

  var loader = (function () {
    var load = (function () {
      function _load(tag) {
        return function (url) {
          return new Promise(function (resolve, reject) {
            var element = document.createElement(tag);
            var parent = 'body';
            var attr = 'src';
            
            switch(tag) {
              case 'script':
                url = resolvJsLibraryFile(url);
                break;
              case 'link':
                url = resolvCssLibraryFile(url);
                break;
            }  

            element.onload = function () {
              if (config.debug) console.log("url " + url + " added");
              resolve(url);
            };

            element.onerror = function () {
              console.error('error loading ' + url)
              reject(url);
            };

            switch (tag) {
              case 'script':
                element.async = true;
                break;
              case 'link':
                element.type = 'text/css';
                element.rel = 'stylesheet';
                attr = 'href';
                parent = 'head';
            }

            element[attr] = url;
            document[parent].appendChild(element);
          });
        };
      }

      return {
        css: _load('link'),
        js: _load('script'),
        img: _load('img')
      }
    })();

    var resolvCssLibraryFile = function (name) {
      var path = config.cssPath;
      for (var c in config.loader.paths) {
        var re = new RegExp(c);
        if (re.match(name)) {
          path = config.loader.paths[c];
          break;
        }
      };

      return path + name + '.css'
    };


    var resolvJsLibraryFile = function (name) {
      var path = config.jsPath;
      for (var c in config.loader.paths) {
        var re = new RegExp(c);
        if (re.match(name)) {
          path = config.loader.paths[c];
          break;
        }
      };

      if (config.debug)
        return path + name + '.full.js'
      else
        return path + name + '.js'
    };

    var registry = {
      localDefined: {},
      remoteLoading: {},
      promises: {},
      resolves: {},

      getDependencyPromise: function (name) {
        if (!this.promises[name]) {
          var resolves = this.resolves;
          this.promises[name] = new Promise(function (resolve) {
            resolves[name] = resolve;
          });
        }
        return this.promises[name];
      },

      resolve: function (name, value) {
        this.getDependencyPromise(name); // create promise if necessary
        try {
          this.resolves[name](value);
        } catch (err) {
          console.error(name + ' not resolved!' + err)
        }
        delete this.resolves[name];
      }
    };

    function define(name, deps, definition) {
      registry.localDefined[name] = true;
      require(deps, function () {
        registry.resolve(name, definition.apply(this, arguments));
      });
    }

    function require(deps, definition, debug) {
      var fileLoads = [];
      for (var i in deps) {
        var name = deps[i];
        if (!registry.localDefined[name]) {
          if (registry.remoteLoading[name]) continue;
          registry.remoteLoading[name] = true;
//          var fileName = resolvJsLibraryFile(name);
//          if (config.debug) console.info("external load " + name + ' --> ' + fileName);
          fileLoads.push(load.js(name))
        }
      }

      var promises = deps.map(registry.getDependencyPromise, registry);

      Promise.all(fileLoads).then(
        Promise.all(promises).then(function (result) {
          definition.apply(this, result);
        }, function (err) {
          console.error(err)
        }).catch(function (err) {
          console.error(err)
        })
      )
    }

    return {
      require: require,
      define: define,
      load: load
    }
  }());

  loader.define('ixtaat/config', [], function () {
    return config;
  })

  globals.loader = loader;

})(this);


loader.define('ixtaat/core', ['ixtaat/config'], function (config) {

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

    if (!target) return target;

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

    extend(destination, source);

    if (style) {
      extend(destination.style, style);
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

    if (JSON && JSON.stringify) {
      return JSON.stringify(data);
    }

    if (window.JSON && window.JSON.stringify) {
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
  var output = function () {
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

  var extractLineNumberFromStack = function (stack) {
    /// <summary>
    /// Get the line/filename detail from a Webkit stack trace.  See http://stackoverflow.com/a/3806596/1037948
    /// </summary>
    /// <param name="stack" type="String">the stack string</param>

    // correct line number according to how Log().write implemented
    var lines = stack.split('\n');
    var line = lines[lines.length - 1];
    // fix for various display text
    line = (line.indexOf(' (') >= 0 ? line.split(' (')[1].substring(0, line
      .length -
      1) : line.split('at ')[1]);
    return line;

  };

	/**
	 * writes given arguments to console when in debug mode
	 */
  var debug = function () {
    if (config.debug) output.apply(this, arguments);
  };

	/**
	 * writes given arguments to console
	 */
  var info = function () {
    output.apply(this, arguments);
  };

	/**
	 *
	 * @param meta
	 * @returns {string}
	 */
  var getMeta = function (meta) {
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
  var sleep = function (milliseconds) {
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
  var sprintf = function (s) {
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


  var translate = function () {
    var arr = Array.prototype.slice.call(arguments);
    var s = arr.shift();
    if (typeof (config.i18n) != 'undefined' && config.i18n[s]) {
      var r = config.i18n[s];
      arr.unshift(r || s);
      return sprintf.apply(this, arr);
    }
    return s;
  };


  // require dependencies specified in <body data-load attribute
  //		setTimeout(asyncLoader.require.bind(0, document.body.getAttribute('data-load').split(' '), Date), 0);


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

  var supportsTouch = 'ontouchstart' in window || navigator.maMaxTouchPoints;
  
  var isArrayLike = function (obj) {

    // Support: real iOS 8.2 only (not reproducible in simulator)
    // `in` check used to prevent JIT error (gh-2145)
    // hasOwn isn't used here due to false negatives
    // regarding Nodelist length in IE
    var length = !!obj && "length" in obj && obj.length,
      type = jQuery.type(obj);

    if (type === "function") {
      return false;
    }

    return type === "array" || length === 0 ||
      typeof length === "number" && length > 0 && (length - 1) in obj;
  }


  var each = function (obj, callback) {
    var length, i = 0;

    if (isArrayLike(obj)) {
      length = obj.length;
      for (; i < length; i++) {
        if (callback.call(obj[i], i, obj[i]) === false) {
          break;
        }
      }
    } else {
      for (i in obj) {
        if (callback.call(obj[i], i, obj[i]) === false) {
          break;
        }
      }
    }

    return obj;
  }


	/************************************************************************************************
	 *
	 * core
	 *
	 ************************************************************************************************/


  //  if (!globals.$) globals.$ = Sizzle;



  var core = {
    _: translate,
    bindProperty: bindProperty,
    config: config,
    debug: debug,
    each: each,
    extendElement: extendElement,
    extend: extend,
    error: error,
    fromJson: fromJson,
    getMeta: getMeta,
    getType: getType,
    getObjectInheritance: getObjectInheritance,
    info: info,

    isArray: isArray,
    isBlink: isBlink,
    isChrome: isChrome,
    isDate: isDate,
    isEdge: isEdge,
    isEmptyObject: isEmptyObject,
    isFirefox: isFirefox,
    isFunction: isFunction,
    isIE: isIE,
    isNumeric: isNumeric,
    isOpera: isOpera,
    isSafari: isSafari,
    isString: isString,
    isPlainObject: isPlainObject,

    sleep: sleep,
    supportsTouch: supportsTouch,
    
    toJson: toJson,
  };


  /***********************************************************************************************************************************
   ***********************************************************************************************************************************
   *
   * String extension
   *
   ***********************************************************************************************************************************
   ***********************************************************************************************************************************/
  extend(String.prototype, function () {


    var ext = {};

    ext.trim = function () {
      return this.replace(/^\s+|\s+$/g, '');
    };

    ext.capitalize = function () {
      return "".concat(this.substr(0, 1).toUpperCase(), this.substr(1));
    };

    ext.camelize = function () {
      return this.replace(/\-+(\S)?/g, function (match, chr) {
        return chr ? chr.toUpperCase() : '';
      });
    }

    ext.classify = function () {
      var r = this.split('_');
      var res = '';
      for (var i = 0; i < r.length; i++) {
        res = res.concat(r[i].capitalize())
      }
      return res;
    }

    ext.times = function (count) {
      return count < 1 ? '' : new Array(count + 1).join(this);
    }

    if (!String.prototype.startsWith) {
      ext.startsWith = function (pattern, position) {
        position = isNumeric(position) ? position : 0;
        return this.lastIndexOf(pattern, position) === position;
      }
    }

    if (!String.prototype.endsWith) {
      ext.endsWith = function (pattern, position) {
        pattern = String(pattern);
        position = isNumeric(position) ? position : this.length;
        if (position < 0) position = 0;
        if (position > this.length) position = this.length;
        var d = position - pattern.length;
        return d >= 0 && this.indexOf(pattern, d) === d;
      }
    }

    return ext;

  }());


  /************************************************************************************************
   *
   * Inheritance
   *
   ************************************************************************************************/

  var Registry = {};
  Registry.Types = {};

  var addTypeName = function (name, cl) {
    debug("add Type for ", name);
    Registry.Types[name] = cl;
  };

  var getTypeName = function (name) {
    if (!Registry.Types.hasOwnProperty(name)) {
      debug("TypeName not registered.", name);
    }
    return Registry.Types[name];
  };

  var create = function (options) {
    var cl = getTypeName(options.typeName);
    if (cl) {
      return new cl(options);
    } else {
      debug("TypeName not registered.", options.typeName);
    }
  };


  var fnTest = /xyz/.test(function () {
    xyz;
  }) ? /\b_super\b/ : /.*/;

  var Class = function () {
  };

  // extension of http://ejohn.org/blog/simple-javascript-inheritance/
  Class.construct = function (options) {

    var _super = this.prototype;

    var prototype = Object.create(_super);

    var classModifier = options.classModifier;

    delete options.classModifier;

    var inheritProperties = function (prop) {
      // Copy the properties over onto the new prototype
      for (var name in prop) {
        // Check if we're overwriting an existing function
        prototype[name] = typeof prop[name] == "function" &&
          typeof _super[name] == "function" && fnTest.test(prop[name]) ?
          (function (name, fn) {
            return function () {
              var tmp = this._super;

              // Add a new ._super() method that is the same method
              // but on the super-class
              this._super = _super[name];

              // The method only need to be bound temporarily, so we
              // remove it when we're done executing
              var ret = fn.apply(this, arguments);

              this._super = tmp;

              return ret;
            };
          })(name, prop[name]) :
          prop[name];
      }
    };

    var includeProperties = function (prop) {
      for (var p in prop) {
        if (p == 'constructor' || p == '_ancestor') continue;
        if (p == 'initializeInclude') {
          if (!prototype.initializeInclude) prototype.initializeInclude = [];
          if (isArray(prop[p])) {
            prototype.initializeInclude = prototype.initializeInclude.concat(
              prop[p]);
          } else {
            prototype.initializeInclude.push(prop[p]);
          }
        } else {
          console.assert(!prototype[p], "Property " + p +
            " already defined!"); //TODO MSG
          prototype[p] = prop[p];
        }
      }

      if (classModifier && classModifier.afterInclude) classModifier.afterInclude(
        prototype, options);
    };

    inheritProperties(options);

    if (typeof options.include !== 'undefined') {
      if (typeof options.include === 'function') {
        console.assert(options.include.prototype); //TODO MSG
        includeProperties(new options.include()); //.prototype);
      } else {
        for (var i = 0; i < options.include.length; i++) {
          console.assert(options.include[i].prototype); //TODO MSG
          includeProperties(new options.include[i]()); // [i].prototype);
        }
      }
    }

    var ixtaatClass = function () {

      if (prototype.defaults) {
        core.extend(true, this, prototype.defaults);
      }

      if (this.initialize) {
        this.initialize.apply(this, arguments);
      }

      if (this.initializeInclude && this.initializeInclude.length > 0) {
        for (var i = 0; i < this.initializeInclude.length; i++) {
          this.initializeInclude[i].apply(this, arguments);
        }
      }
    };

    ixtaatClass.prototype = prototype;

    ixtaatClass.prototype._ancestor = _super;

    ixtaatClass.prototype.constructor = Class;
    //  if (options.className) prototype.constructor.name = options.className;


    if (options.typeName && typeof options.typeName === 'string')
      addTypeName(prototype.typeName, ixtaatClass);

    //   call in inherited ClassModifiers
    if (classModifier) {

      if (classModifier.__all_modifiers) {
        for (var i in classModifier.__all_modifiers) {
          classModifier.__all_modifiers[i](ixtaatClass);
        }
      }

      if (!classModifier.__all_modifiers) classModifier.__all_modifiers = [];
      if (classModifier.withClassDo) classModifier.withClassDo(ixtaatClass);

      if (classModifier.withClassesDo) {
        classModifier.withClassesDo(ixtaatClass);
        classModifier.__all_modifiers.push(classModifier.withClassesDo);
      }
      if (classModifier.withSubClassesDo) classModifier.__all_modifiers.push(classModifier.withSubClassesDo);

      if (classModifier.__all_modifiers) {

        ixtaatClass.construct = function (options) {
          if (!options.classModifier) options.classModifier = {};
          options.classModifier.__all_modifiers = classModifier.__all_modifiers;
          return Class.construct.apply(ixtaatClass, [options]);
        }

      } else {
        ixtaatClass.construct = Class.construct; //;arguments.callee;
      }

    } else {
      ixtaatClass.construct = Class.construct; //;arguments.callee;
    }

    return ixtaatClass;
  };

  core.Class = Class;
  core.Registry = Registry;
  core.getTypeName = getTypeName;
  core.addTypeName = addTypeName;
  core.create = create;

  return core;
});


