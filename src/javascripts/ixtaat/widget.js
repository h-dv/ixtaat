/**
 *
 * Date: 02.09.14
 * Time: 20:18
 * Copyright 2014 H-DV
 *
 * WWW.H-DV.DE
 *
 */

/***********************************************************************************************************************************
 ***********************************************************************************************************************************
 *
 * Widgets
 *
 ***********************************************************************************************************************************
 ***********************************************************************************************************************************/


/************************************************************************************************
 *
 * Template
 *
 ************************************************************************************************/
loader.define('ixtaat/widget', ['ixtaat/core', 'ixtaat/base'], function (core, base) {
  "use strict";

  var widget = {};

  var _MaxSupportedCssHeight;

  core.bindProperty({
    to: widget,
    toProperty: "MaxSupportedCssHeight",
    getter: function () {
      if (widget._MaxSupportedCssHeight) return widget._MaxSupportedCssHeight;
      var supportedHeight = 1000000;
      // FF reports the height back but still renders blank after ~6M px
      var testUpTo = (core.isFirefox) ? 6000000 : 10000000000;
      var div = document.createElement("div");
      div.style.display = "none";
      document.body.appendChild(div);

      while (true) {
        var test = supportedHeight * 2;
        div.style.height = test + "px";
        if (test > testUpTo || div.offsetHeight !== test) {
          break;
        } else {
          supportedHeight = test;
        }
      }

      document.body.removeChild(div);
      widget._MaxSupportedCssHeight = supportedHeight;
      return supportedHeight;
    }
  });


  var _ScrollBarWidth;

  core.bindProperty({
    to: widget,
    toProperty: "ScrollBarWidth",
    getter: function () {
      if (widget._ScrollBarWidth) return widget._ScrollBarWidth;

      var div = document.createElement("div");
      div.style.width = "100px";
      div.style.height = "100px";
      div.style.overflow = "scroll";
      div.style.position = "absolute";
      div.style.top = "-9999px";

      document.body.appendChild(div);

      // Get the scrollbar width
      var scrollbarWidth = div.offsetWidth - div.clientWidth;

      document.body.removeChild(div);

      widget._ScrollBarWidth = scrollbarWidth;
      return scrollbarWidth;
    }
  });


	/**
	 * @class
	 */
  widget.Template = core.Class.construct(
    /** @lends widget.Template.prototype */
    {
      className: "widget.Template",

      /** @construct */
      initialize: function (templateHtml) {

        this.html = templateHtml;

        this.domFragment = document.createDocumentFragment();

        var tmp = document.createElement('body'), child;

        tmp.innerHTML = this.html;

        while (child = tmp.firstChild) {
          this.domFragment.appendChild(child);
        }
      },
			/**
			 *
			 * @returns {Node}
			 */
      render: function () {
        var candidate = this.domFragment.childNodes[0].cloneNode(true);
        if (arguments.length > 0) {
          candidate.id = arguments[0];
        }
        return candidate;
      }
    });


	/************************************************************************************************
	 *
	 * DOM Event Handling
	 *
	 ************************************************************************************************/
	/*
	 * Attach an event listener
	 * @return this
	 */
  widget.addEvent = function (el, ev, func) {
    if (!el) debugger;
    el.addEventListener(ev, func, false);
    return this;
  }

	/**
	 * Detach an existent event listener
	 * @return this
	 */
  widget.removeEvent = function (el, ev, func) {
    if (!el) debugger;
    el.removeEventListener(ev, func, false);
    return this;
  }

	/**
	 * Prevent the default action & stop the event from propagating
	 * @return bool false
	 */
  widget.cancelEvent = function (e) {
    e = e || window.event;
    if (e) {
      if (e.stopPropagation) {
        e.stopPropagation();
      }
      if (e.preventDefault) {
        e.preventDefault();
      }

      e.cancelBubble = true;
      e.cancel = true;
      e.returnValue = false;
    }
    return false;
  };

	/**
	 *
	 * @param element
	 * @param eventName
	 */
  widget.triggerEvent = function (element, eventName) {
    var event = new CustomEvent(eventName);
    element.dispatchEvent(event);
  }


  /************************************************************************************************
   *
   * Component
   *
   ************************************************************************************************/


  widget.Colors = {};
  
  widget.readCssColors = function() {
    /**
     * read css Rules to JS -Vars
     * set Color Variables
     */
    widget.Colors = {};
    for (var i in document.styleSheets) {
      var currentSheet = document.styleSheets[i];

      ///loop through css Rules
      for (var j in currentSheet.cssRules) {
        var sT = currentSheet.cssRules[j].selectorText;

        if (sT && sT.startsWith('.color-')) {
          var name = sT.substring(7, sT.length.length).camelize();
          widget.Colors[name] = currentSheet.cssRules[j].style.color;
        }
      }
    }
  }
  
  widget.readCssColors();


  widget._LastComponentID = 0;

  widget.IdPrefix = "ixc_";

  widget.UUID = function () {
    return widget.IdPrefix.concat((widget._LastComponentID++).toString(16));
  };

  widget.find = function (id) {
    return document.getElementById(id);
  }

  widget.findOwnerComponent = function (element) {
    var el = widget.findParent(element, function (el) {
      return widget.Components[el.id]
    })
    return widget.Components[el.id];
  }

  widget.findParent = function (element, testFnct) {
    if (element) {
      if (testFnct(element)) {
        return element;
      } else {
        return widget.findParent(element.parentNode, testFnct)
      }
    }
  }

  widget.findParentComponent = function (component, testFnct) {
    if (component) {
      if (testFnct(component)) {
        return component;
      } else {
        return widget.findParentComponent(component.parent(), testFnct)
      }
    }
  }

  widget.findYPos = function (element) {
    var curtop = 0;
    if (element.offsetParent) {
      do {
        curtop += element.offsetTop;
      } while (element = element.offsetParent);
      return [curtop];
    }
  };

  widget.Components = {}

  var defineSelectorProperties = function (p) {
    for (var name in p.templateSelectors) {

      // only templateSelectors of current class
      // if defined, values are assigned in setter
      if (!p.templateSelectors.hasOwnProperty(name)) {
        core.debug("selector : " + name + " on " + p.typeName);

        continue;
      }

      core.debug("try property :" + name);

      var backupName = "__" + name + "_options";

      var definedName = "__" + name + "_defined";
      // test, if p[name] is already defined

      var isFunction = typeof p.templateSelectors[name] == 'function';

      if (p[definedName]) {
        core.debug("override defined: " + name + " on " + p.typeName);
      }

      if (!p[backupName]) {
        p[backupName] = {}
      }

      if (!p[definedName] && p.hasOwnProperty(name)) {
        p[backupName] = core.extend(true, {}, p[backupName], p[name]);
      }

      p[definedName] = true;

      var getter;
      var setter;

      if (isFunction) {
        getter = p.templateSelectors[name];
      } else {
        getter = new Function('"use strict";  return this.findFirst("' + p.templateSelectors[name] + '");');
      }

      setter = new Function('val',
        'if (this.coreIsPlainObject(val)) { \
					if (this.elementReady) { \
						this.extendHtmlElement(this.' + name + ', val);\
              } else { \
                this.' + backupName + ' = this.coreExtend(true, {}, this.' + backupName + ', val); \
              } \
            } else { \
              throw new Error("property ' + name + '" + \
                " is not writeable"); }'
      );

      core.debug("add property " + name);

      core.bindProperty({
        to: p,
        toProperty: name,
        getter: getter,
        setter: setter
      });
    }


  }


	/**
	 * @class
	 * @mixes Ixtaat.Observer
	 */
  widget.Component = core.Class.construct(
    /** @lends widget.Component.prototype */
    {
      classModifier: {
				/**
				 *
				 * @param cl
				 * @returns {*}
				 */
        withClassesDo: function (cl) {

          // modify all subclasses to automaticly create getter for
          // template-selectors

          core.debug("******************* " + cl.prototype.typeName + " ***************************");

          var p = cl.prototype;

          if (!p.templateSelectors) return cl;

          defineSelectorProperties(p);

          return cl;

        }
      },

			/**
			 * @member
			 */
      isWidget: true,

			/**
			 * @member
			 */
      typeName: "i-component",

      include: base.Observer,

			/**
			 * @member
			 */
      uuid: null,

			/**
			 * @member
			 */
      content: "",

			/**
			 * @member
			 */
      wrapper: null,

			/**
			 * @member
			 */
      templateHtml: '<div class="i-component"></div>',

			/**
			 * @member
			 */
      templateSelectors: {
        element: function () {
          return this.__element ? this.__element : widget.find(this.uuid);
        }
      },

			/**
			 *
			 * @param select
			 * @returns {NodeList}
			 */
      findAll: function (select) {
        console.assert(select, "empty selector for findall component" + this.uuid);
        console.assert(this.element, "no element found for component " + this.uuid + " : " + select);
        var el = this.element;
        if (core.isChrome || core.isFirefox || core.isSafari) {
          return el.querySelectorAll(':scope > ' + select);
        } else {
          return el.querySelectorAll('#' + this.uuid + ' >' + select);
        }
      },

			/**
			 *
			 * @param select
			 * @returns {Element}
			 */
      findFirst: function (select) {
        console.assert(select, "empty selector for findFirst component " + this.uuid);
        console.assert(this.element, "no element found for component " + this.uuid + " : " + select);
        var el = this.element;
        var res;
        try {
          if (core.isChrome || core.isFirefox || core.isSafari) {
            res = el.querySelector(':scope > ' + select);
          } else {
            res = el.querySelector('#' + this.uuid + ' >' + select);
          }
        } catch (e) {
          core.error("Error in findFirst-Selector: " + select + " : " + e)
        }
        return res;
      },

			/**
			 * @returns {{}}
			 */
      listAllTemplateSelectors: function () {
        var a = {};
        var objs = [];
        var obj = this;
        while (obj) {
          objs.unshift(obj);
          obj = Object.getPrototypeOf(obj);
        }
        for (var i in objs) {
          core.extend(a, objs[i].templateSelectors);
        }
        return a;
      },

			/**
			 * @construct
			 **/
      initialize: function (options) {

        if (options == undefined) options = {};

        //** Check if already created, if so use orignal values.

        if (options.__orignal__) {
          options = options.__orignal__;
        }
        this.__orignal__ = core.extend(true, options);


        if (options.uuid && core.isString(options.uuid)) {
          if (options.uuid.startsWith(widget.IdPrefix)) {
            throw new Error("ComponentID with Prefix " + widget.IdPrefix + " is not possible.")
          }
          this.uuid = options.uuid;
        } else {
          this.uuid = widget.UUID();
        }

        if (widget.Components[this.uuid]) {
          throw new Error("ComponentID " + this.uuid + " already exists.")
        }

        widget.Components[this.uuid] = this;

        this.initializeObserver(options);

        this.fire('beforeInitialize', options);

        if (options.templateHtml)
          this.templateHtml = options.templateHtml;

        this.template = new widget.Template(this.templateHtml);

        if (options.templateSelectors) {
          core.extend(this.templateSelectors, options.templateSelectors);
          defineSelectorProperties(this)
        }

        this.__element = this.generateDom();
        //*******************************************************
        // Mixin Selectors
        //*******************************************************
        this.mixinTemplateSelectors(options);

				/* Already included Templates cant be extended
				 */

        delete options['element'];
        //*******************************************************
        //*******************************************************

        this.extend(options);

        this.fire('afterInitialize', this);

        this.hookAfterCreate();

        if (options.renderIn) {
          this.render(this.renderIn);
        }
      },

			/**
			 *
			 * @param options
			 */
      extend: function (options) {
        core.extend(this, options);
      },

			/**
			 *
			 */
      hookAfterCreate: function () {

      },

			/**
			 *
			 * @returns {*|Node}
			 */
      generateDom: function () {

        if (core.isFunction(this.beforeGenerateDom)) {
          this.beforeGenerateDom();
        }

        var el = this.template.render(this.uuid);

        if (core.isFunction(this.afterGenerateDom)) {
          this.afterGenerateDom(el);
        }

        this.elementReady = true;

        return el;
      },

			/**
			 *
			 * @param parent
			 * @param replace
			 */
      render: function (parent, options) {
        options = options || {};

        this.fire("beforeRender", this);

        if (this.element.parentNode) {
          core.error("already rendered")
        }

        if (typeof parent === 'string') {
          parent = widget.find(parent);
        }

        var element = this.element;

        var replace_fnc = function (_parent, _element) {
          if (options.start) {
            options.before = _parent.firstChild;
          }

          if (options.after) {
            if (options.after.nextSibling) {
              _parent.insertBefore(options.after.nextSibling, _element);
            } else {
              _parent.appendChild(_element);
            }

          } else if (options.before) {
            _parent.insertBefore(options.before, _element);
          } else {
            _parent.appendChild(_element);
          }
        }

        // add wrapper
        if (options.wrapIn) {
          parent.parentNode.insertBefore(element, parent);
          this.on({
            afterRender: [
              function () {
                this[options.wrapIn].appendChild(parent);
              }
            ]
          })
        } else {

          if (options.replace) {

            if (!parent.parentNode) throw "Cannot replace, parent not found"

            if (parent.id.match(/D\_/i)) {
              throw "you can not replace a component"
            }

            parent.parentNode.replaceChild(element, parent);
          } else {
            replace_fnc(parent, element);
          }
        }
        //***********************
        //
        //***********************
        this.__element = null;
        //***********************
        //
        //***********************

        this.fire("render");

        this.hookAfterRender();

        this.fire("afterRender");

        this.isRendered = true;

        this.fire("ready");
      },

			/**
			 *
			 * @param element
			 * @param options
			 * @returns {*}
			 */
      extendHtmlElement: function (element, options) {

        //copy values
        options = core.extend(true, {}, options);

        //Add Events
        if (options.events !== 'undefined') {
          for (var name in options.events) {
            for (var idx in options.events[name]) {
              var fnc = options.events[name][idx].bind(this);
              widget.addEvent(element, name, fnc);

              this.on({
                beforeClose: [function () {
                  if (!element) debugger;
                  widget.removeEvent(element, name, fnc)
                }]
              })
            }
          }
        }

        delete options.events;

        return core.extendElement(element, options);
      },

			/**
			 *
			 * @param options
			 */
      mixinTemplateSelectors: function (options) {

        var selectors = this.listAllTemplateSelectors();//this.templateSelectors;

        var org;

        for (var name in selectors) {

          var backupName = "__" + name + "_options";
          if (this[backupName]) {
            org = core.extend(true, {}, this[backupName], options[name]);
          } else {
            org = core.extend(true, {}, options[name]);
          }

          core.debug("extend " + name);

          this.extendHtmlElement(this[name], org);

          delete options[name];
        }
      },

			/**
			 *
			 */
      hookAfterRender: function () {

      },

			/**
			 *
			 */
      hide: function () {
        this.fire('beforeHide');
        this.element.style.visibility = 'hidden';
        this.fire('afterHide');
      },

			/**
			 *
			 */
      show: function () {
        this.fire('beforeShow');
        this.element.style.visibility = 'visible';
        this.fire('afterShow');
      },

			/**
			 *
			 * @param transitionClass
			 * @param timeout
			 */
      close: function (transitionClass, timeout) {
        if (this._isClosing) return;
        this._isClosing = true;
        if (!this.fire('beforeClose')) return;
        var _this = this;
        if (transitionClass) {
          this.addClass(transitionClass)
        }

        if (!timeout) timeout = 0;

        if (!timeout == 0 && transitionClass) timeout = 500;

        var subComponents = _this.getChildComponentsDownTop();

        for (var i in subComponents) {
          var cid = subComponents[i];
          var c = widget.Components[cid];
          if (c) c.close();
        }

        this.timeout(timeout, function () {
          _this.element.parentNode.removeChild(_this.element);
          widget.Components[this.uuid] = null;

          delete widget.Components[this.uuid];

          this.fire('afterClose');
        })
      },

      getChildComponentsDownTop: function (el, lst) {
        el = el || this.element;
        var child;
        lst = lst || [];
        if (!el) return lst;
        var children = Array.prototype.slice.call(el.childNodes);
        for (var id in children) {
          child = children[id];
          if (child.hasChildNodes()) this.getChildComponentsDownTop(child, lst);
          if (child.id && child.id.startsWith(widget.IdPrefix)) {
            lst.push(child.id)
          }
        }
        return lst;
      },

			/**
			 *
			 * @param cls
			 * @param el
			 * @returns {Array|{index: number, input: string}}
			 */
      hasClass: function (cls, el) {
        el = (el || this.element);
        if (typeof el.className === 'undefined') el.className = "";
        return el.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'));
      },

			/**
			 *
			 * @param cls
			 * @param el
			 */
      addClass: function (cls, el) {
        el = (el || this.element);
        if (!this.hasClass(cls, el)) {
          if (el.className) {
            el.className = el.className + " " + cls;
          } else {
            el.className = cls;
          }
        }
      },

			/**
			 *
			 * @param cls
			 * @param el
			 */
      addClasses: function (cls, el) {
        var arr = cls.split(" ");
        for (var cl in arr) {
          this.addClass(arr[cl]);
        }
      },

			/**
			 *
			 * @param cls
			 * @param el
			 */
      removeClass: function (cls, el) {
        el = (el || this.element);
        if (this.hasClass(cls, el)) {
          var reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');
          el.className = el.className.replace(reg, ' ');
        }
      },

			/**
			 *
			 * @param time
			 * @param func
			 * @param arg
			 * @returns {number}
			 */
      timeout: function (time, func, arg) {
        var _this = this;
        return setTimeout(function () {
          func.apply(_this, [arg]);
        }, time);
      },

			/**
			 *
			 * @param t
			 * @param f
			 * @param a
			 * @returns {number}
			 */
      interval: function (t, f, a) {
        return setInterval(function () {
          f.apply(this, a);
        }, t);
      },

			/**
			 *
			 * @returns {*}
			 */
      parent: function () {
        var candidate = this.element.parentNode;
        while (candidate != null) {
          if (widget.Components[candidate.id]) return widget.Components[
            candidate.id]
          candidate = candidate.parentNode;
        }
        return null;
      },

			/**
			 *
			 * @param opts
			 */
      animate: function (opts) {
        var start = new Date();
        var id = setInterval(function () {
          var timePassed = new Date() - start;
          var progress = timePassed / opts.duration;
          if (progress > 1) progress = 1;
          var delta = opts.delta(progress);
          opts.step(delta);
          if (progress == 1) {
            clearInterval(id)
          }
        }, opts.delay || 10);
      },

			/**
			 * embedd core funktions for HTMLEvents
			 * 
			 */
      coreExtend: function () {
        return core.extend.apply(core, arguments)
      },

      coreIsPlainObject: function (val) {
        return core.isPlainObject(val)
      }

    });
	/************************************************************************************************
	 *
	 * Splitter
	 *
	 ************************************************************************************************/

  //TODO
  widget.Splitter = widget.Component.construct({
    templateHtml: '<div class="i-component i-splitter"><div class="left"></div><div class="i-split"></div><div class="right"></div></div>'
  })


	/************************************************************************************************
	 *
	 * Composite
	 *
	 ************************************************************************************************/
  widget.Sortable = core.Class.construct({

    sortableTemplate: new widget.Template(''),

    events: {
      render: [
        function () {
          this.onDragOver = this.onDragOver.bind(this);
        }
      ],
      afterAddItem: [
        function (item) {
          if (this.dragDropActive) {
            item.element.draggable = true;
            item.addClass('draggable');
          }
        }
      ]
    },


    onDragOver: function (evt) {

      var target = evt.target;

      if (!this._dragItem) return;

      evt.preventDefault();
      evt.stopPropagation();

      evt.dataTransfer.dropEffect = 'move';

      if (!target in this.items) {
        core.info("over " + target.uuid);
        return
      }

      var cmp = widget.findOwnerComponent(target);
      if (!cmp) {
        core.info('drag over wrong element')
      }

      if (cmp.parent() != this) {
        core.info(' drag is not my ' + cmp.uuid + ' : ' + this.uuid);
        return;
      }

      if (cmp.parent() != this || cmp == this || cmp == this._dragItem) {
        return;
      }

      var c = cmp.element.nextSibling;

      if (this.itemContainer.contains(this._dragItem.element)) {
        if (c) {
          this.itemContainer.insertBefore(this._dragItem.element, c);
        } else {
          this.itemContainer.appendChild(this._dragItem.element);
        }
      }
    }
    ,

    itemContainer: {
      events: {

        dragend: [
          function (evt) {
            if (!this.dragDropActive) return;
            evt.preventDefault();
            evt.stopPropagation();

            widget.removeEvent(this.itemContainer, 'dragover', this.onDragOver);
            this._dragItem.removeClass('dragactive');
            delete this._dragItem;

            //		  this.onUpdate(dragEl);
          }
        ],


        dragstart: [
          function (evt) {
            if (!this.dragDropActive) return;
            evt.stopPropagation();
            this._dragItem = widget.findOwnerComponent(evt.target);

            if (!this._dragItem) {
              throw ('Component for Drag found')
            }

            if (!this._dragItem in this.items) {
              throw ('Dragitem not my child!')
            }

            widget.addEvent(this.itemContainer, 'dragover', this.onDragOver);


            evt.dataTransfer.effectAllowed = 'move';
            evt.dataTransfer.setData('Text', this._dragItem.element.textContent);




            setTimeout(function () {

              this._dragItem.addClass('dragactive');
            }.bind(this), 0)

          }
        ]
      }
    }
  })

	/**
	 * @class
	 */
  widget.Composite = widget.Component.construct(
    /** @lends widget.Composite.prototype */
    {
			/**
			 * @member
			 */
      items: undefined,

      include: widget.Sortable,
			/**
			 * @member
			 */
      typeName: "i-composite",

			/**
			 * @member
			 */
      templateHtml: '<div class="i-component i-composite"><div class="i-item-container"></div></div>',

			/**
			 * @member
			 */
      templateSelectors: {
        itemContainer: ".i-item-container"
      },

			/**
			 * @member
			 */
      initialize: function (options) {
        var renderIn = options.renderIn;
        var items = options.items || [];
        delete options.renderIn;
        options.items = [];

        this._super(options); //.apply(this, options);


        for (var i in items) {
          var item = items[i];
          this.addItem(items[i]);
        }

        if (renderIn) this.render(renderIn);
      },

      hookAfterRender: function () {
        var sorted = this.sortedItems();
        var itemContainer = this.itemContainer;
        for (var i in sorted) {
          var item = sorted[i];
          if (item.renderIn) {
            var par = this.findFirst(item.renderIn);
            var par = this.findFirst(item.renderIn);
            item.render(par);
          } else {
            item.render(itemContainer);
          }
        }
      },

			/**
			 *
			 * @param item
			 * @returns {*}
			 */
      addItem: function (item) {
        if (typeof item != 'function') {
          item = core.create(item)
        }

        this.items.push(item);

        if (this.isRendered) {
          if (item.renderIn) {
            var par = this.findFirst(item.renderIn);
            item.render(par);
          } else {
            item.render(this.itemContainer);
          }
        }
        var p = this;
        item.on({
          'afterClose': [function () {
            var idx = p.getItemIndex(item);
            p.items.splice(idx, 1)
          }]
        });

        this.fire('afterAddItem', item)
        return item;

      },

			/**
			 *
			 * @param name
			 */
      hideItem: function (name) {
        this.items[name].hide()
      },

			/**
			 *
			 * @param name
			 */
      showItem: function (name) {
        this.items[name].show()
      },

			/**
			 *
			 * @param numericProperty
			 * @returns {Array}
			 */
      sortedItems: function (numericProperty) {
        numericProperty = numericProperty || "index";
        var arr = [];
        for (var i in this.items) {
          if (this.items[i] === undefined) core.error("sortedItems : undefined Item in Items - Array");
          var idx = this.items[i][numericProperty] || arr.length || 0;
          if (typeof idx === 'undefined') throw "sortIndex not given!";
          if (arr[idx]) throw "sortIndex not unique!";
          arr[idx] = this.items[i];
        }
        return arr;
      },

      isChildItem: function (candidate) {
        if (!candidate) return;
        if (!core.isString(candidate)) {
          candidate = candidate.uuid;
        }

        for (var i in this.items) {
          var item = this.items[i];
          if (item.uuid == candidate) return true;
        }
        return false;
      },

      getItemIndex: function (candidate) {
        if (!candidate) return -1;
        if (!core.isString(candidate)) {
          candidate = candidate.uuid;
        }
        for (var i in this.items) {
          var item = this.items[i];
          if (item.uuid == candidate) return Number(i);
        }
        return -1;
      },

      getPriorItemIndex: function (candidate) {
        var idx = this.getItemIndex(candidate);
        if (idx > 0) {
          return idx - 1;
        }
        return -1;
      },

      getNextItemIndex: function (candidate) {
        var idx = this.getItemIndex(candidate);
        if (idx >= 0 && idx < this.items.length - 1) {
          return idx + 1;
        }
        return -1;
      },
    });

  return widget;

});
