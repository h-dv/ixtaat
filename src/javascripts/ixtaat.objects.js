/************************************************************************************************
 *
 * Inheritance
 *
 ************************************************************************************************/

(function (globals) {
  "use strict";

  var Registry = {};
  Registry.Types = {};

  var addTypeName = function (name, cl) {
    Ixtaat.debug("add Type for ", name);
    Registry.Types[name] = cl;
  };

  var getTypeName = function (name) {
    if (!Registry.Types.hasOwnProperty(name)) {
      Ixtaat.debug("TypeName not registered.", name);
    }
    return Registry.Types[name];
  };

  var create = function (options) {

    var cl = Ixtaat.getTypeName(options.typeName);
    if (cl) {
      return new cl(options);
    } else {
      Ixtaat.debug("TypeName not registered.", options.typeName);
    }
  };


  var fnTest = /xyz/.test(function () {
    xyz;
  }) ? /\b_super\b/ : /.*/;

  globals.Class = function () {
  };

  // extension of http://ejohn.org/blog/simple-javascript-inheritance/
  Class.define = function (options) {

    var _super = this.prototype;

    var prototype = Object.create(_super);

    var classModifier = options.classModifier;

    delete options.classModifier;

    //  if (options.className) prototype.constructor.name = options.className;

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
          if (Ixtaat.isArray(prop[p])) {
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
        Ixtaat.extend(true, this, prototype.defaults);
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

    if (options.typeName && typeof options.typeName === 'string')
      addTypeName(prototype.typeName, ixtaatClass);

//   call in inherited ClassModifiers
    if (classModifier) {

      if (classModifier.__all_modifiers) {
        for (var i in  classModifier.__all_modifiers) {
          classModifier.__all_modifiers[i](ixtaatClass);
        }
      }

      if (!classModifier.__all_modifiers) classModifier.__all_modifiers = [];
      if (classModifier.withClassDo)  classModifier.withClassDo(ixtaatClass);

      if (classModifier.withClassesDo) {
        classModifier.withClassesDo(ixtaatClass);
        classModifier.__all_modifiers.push(classModifier.withClassesDo);
      }
      if (classModifier.withSubClassesDo) classModifier.__all_modifiers.push(classModifier.withSubClassesDo);

      if (classModifier.__all_modifiers) {

        ixtaatClass.define = function (options) {
          if (!options.classModifier) options.classModifier = {};
          options.classModifier.__all_modifiers = classModifier.__all_modifiers;
          return Class.define.apply(ixtaatClass, [options]);
        }

      } else {
        ixtaatClass.define = Class.define; //;arguments.callee;
      }
    } else {
      ixtaatClass.define = Class.define; //;arguments.callee;
    }

    return ixtaatClass;
  };


  Ixtaat.Registry = Registry;
  Ixtaat.getTypeName = getTypeName;
  Ixtaat.addTypeName = addTypeName;
  Ixtaat.create = create;


})(this);


