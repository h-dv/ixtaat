/**
 *
 * Date: 02.09.14
 * Time: 20:18
 * Copyright 2014 H-DV
 *
 * WWW.H-DV.DE
 *
 */


/************************************************************************************************
 *
 * Widgets
 *
 ************************************************************************************************/
loader.define('ixtaat/material', ['ixtaat/core', 'ixtaat/widget'], function (core, widget) {
  "use strict";

  return loader.load.css('ixtaat/material').then(function(){
     var material = {};

     widget.readCssColors();
 
    /************************************************************************************************
     *
     * Button
     *
     ************************************************************************************************/

    material.RippleEffect = core.Class.construct({

      appendRipple: function (coordinates, size) {
        ++this.rippleIndex;
        var ripple = document.createElement('div');
        ripple.style.top = coordinates.y + "px";
        ripple.style.left = coordinates.x + "px";
        ripple.style.height = size + "px";
        ripple.style.width = size + "px";

        ripple.classList.add('ripple');

        // cache index on ripple
        ripple.index = this.rippleIndex;
        // listen to animation
        ripple.addEventListener('animationend', this.endIntro.bind(
          this));

        this.ripples[this.rippleIndex] = {
          element: ripple,
          animating: true
        };
        // appned the element
        this.element.appendChild(ripple);
      },

      endIntro: function (event) {
        this.ripples[event.target.index].animating = false;
        event.target.removeEventListener('animationend', this.endIntro);
      },

      startOutro: function (event) {
        // update last
        ++this.last;
        // if the trigger was an event we need to clear the listener
        if (event) {
          event.target.removeEventListener('animationend', this.startOutro);
        }
        this.ripples[this.last].element.style.opacity = 0;
        // add a new listener
        this.ripples[this.last].element.addEventListener(
          'transitionend', this.removeFromDOM.bind(this));
      },

      removeFromDOM: function (event) {
        // remove element and listeners
        event.target.removeEventListener('transitionend', this.removeFromDOM);
        delete this.ripples[event.target.index];
        event.target.remove();
      },

      finishRipple: function (event) {
        if (!this.down) {
          return;
        }
        this.down = false;
        if (this.ripples[this.rippleIndex].animating) {
          // if the ripple is still animating we need to wait
          this.ripples[this.rippleIndex].element.addEventListener(
            'animationend', this.startOutro.bind(this));
        } else {
          // otherwise we can start removing the ripple
          this.startOutro();
        }
      },

      mouseleave: function (event) {
        this.finishRipple.call(this, event);
      },

      mouseup: function (event) {
        this.finishRipple.call(this, event);
      },

      mousedown: function (event) {
        this.down = true;
        var y = event.layerY;
        var x = event.layerX;
        // get event dimensions
        var w = event.target.offsetWidth;
        var h = event.target.offsetHeight;
        // get offset
        var offsetX = Math.abs(w / 2 - x);
        var offsetY = Math.abs(h / 2 - y);
        // get delta
        var deltaX = w / 2 + offsetX;
        var deltaY = h / 2 + offsetY;
        // calculate size
        var size = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(
          deltaY,
          2) - 2 * deltaX * deltaY * Math.cos(90 / 180 *
            Math.PI)) *
          2;

        this.appendRipple({
          x: x,
          y: y
        }, size);
      },

      initializeInclude: function () {
        core.debug(this.uuid + " initializeInclude RippleEffect");
        this.rippleIndex = 0;
        this.ripples = {};
        this.last = 0;
        this.down = false;
        this.element.classList.add("rippleffect");
        this.extendHtmlElement(this.element, {
          events: {
            mouseleave: [this.mouseleave],

            mouseup: [this.mouseup],

            mousedown: [this.mousedown]
          }
        });
      }
    });


    material.Button = widget.Component.construct({
      className: "Material.Button",
      typeName: 'm-button',
      templateHtml: '<button class="m-button" tabindex="0">Button</button >',
      include: material.RippleEffect
    });


    /************************************************************************************************
     *
     * Card
     *
     ************************************************************************************************/
    material.Card = widget.Composite.construct({
      className: "material.Card",
      typeName: 'm-card',
      templateHtml: '<div class="m-card"><h3 class="m-header"></h3><div class="i-item-container"></div><div class="m-footer"></div></div>',
      templateSelectors: {
        header: " .m-header",
        itemContainer: " .i-item-container",
        footer: " .m-footer"
      }
    });


    /************************************************************************************************
     *
     * Viewport
     *
     ************************************************************************************************/
    material.Viewport = widget.Composite.construct({

      className: "material.Viewport",

      typeName: 'm-viewport',

      templateHtml: '<div class="m-viewport w-grid-wrapper">' +
      '<div class="m-viewport-header w-grid-row"></div>' +
//      '<div class="w-grid-row"><div class="m-viewport-left"></div><div class="i-item-container"></div><div class="m-viewport-right"></div></div>' +
      '<div class="w-grid-row i-item-container"></div>' +
        '<div class="m-viewport-footer w-grid-row"></div>' +
      '</div>',

      templateSelectors: {
        header: ".m-viewport-header",
//        left: ".w-grid-row > .m-viewport-left",
//        itemContainer: " .w-grid-row > .i-item-container",
//        right: ".w-grid-row > .m-viewport-right",
        itemContainer: ".i-item-container",
        footer: " .m-viewport-footer"
      }
    });


    /************************************************************************************************
     *
     * Tab
     *
     ************************************************************************************************/
    material.TabItemHeader = widget.Component.construct({
      closeable: true,
      include: material.RippleEffect,
      typeName: 'm-tab-item-header',
      templateHtml: '<div class="i- m-tab-item-header w-grid-row"><span class="caption">tabitem</span>' +
      '<i class="close-button material-icons md-18  ">highlight_off</i></div>',
      templateSelectors: {
        closeButton: ".close-button",
        caption: ".caption",
      },

      caption: {
        events: {
          click: [
            function () {
              this.activate();
            }
          ]
        }
      },

      closeButton: {
        events: {
          click: [
            function () {
              this.close();
            }
          ]
        }
      },


      getContent: function () {
        if (this.contentUuid) {
          return widget.Components[this.contentUuid];
        }
      },

      activate: function () {
        if (this.hasClass('m-active-tab-item-header')) return true;
        this.fire('beforeActivate');
        var t = this.parent();
        for (var i in t.items) {
          var item = t.items[i];
          if (item && item.hasClass('m-active-tab-item-header')) {
            if (!item.deactivate()) return false;
          }
        }

        var content = this.getContent();
        content.removeClass('m-inactive-tab-item-content');
        content.addClass('m-active-tab-item-content');
        this.removeClass('m-inactive-tab-item-header');
        this.addClass('m-active-tab-item-header');

        // scroll tab header to activetab
        var it = this.parent().itemContainer.parentElement;
        if (it.scrollWidth > it.clientWidth) {
          if (it.clientWidth > this.element.offsetLeft + this.element.clientWidth) {
            // scroll to start
            it.parentElement.scrollLeft = 0;
          } else if (this.element.offsetLeft > it.scrollWidth - (it.clientWidth / 2)) {
            // scroll to end
            it.parentElement.scrollLeft = it.scrollWidth - (it.clientWidth / 2);
          } else {
            it.parentElement.scrollLeft = this.element.offsetLeft + (it.clientWidth / 2);
          }
        }
        this.fire('afterActivate');
      },

      deactivate: function () {
        if (!this.hasClass('m-inactive-tab-item-header')) {
          if (!this.fire('beforeDeactivate')) return false;
          var content = this.getContent();
          content.removeClass('m-active-tab-item-content');
          content.addClass('m-inactive-tab-item-content');
          this.removeClass('m-active-tab-item-header');
          this.addClass('m-inactive-tab-item-header');
          this.fire('afterDeactivate')
        }
        return true;
      },

      events: {
        afterInitialize: [
          function () {
            if (!this.closeable) {
              this.addClass('m-tab-uncloseable')
            }
            ;
          }
        ],
        beforeClose: [
          function () {
            if (!this.closeable) return false;
            if (this.hasClass('m-active-tab-item-header')) {
              var newActive = this.parent().getPriorItemIndex(this);
              if (newActive < 0) newActive = this.parent().getNextItemIndex(this);
              if (newActive < 0 && this.parent().length > 1) newActive = 1;
              if (newActive >= 0) {
                var ne = this.parent().items[newActive];
                ne.activate();
              }
            }
            this.getContent().close();
          }
        ]
      }
    });

    material.TabContainer = widget.Composite.construct({

      className: "material.TabContainer",

      typeName: 'm-tab-container',

      templateHtml: '<div class="m-tab-container">' +
      '<div class="m-tab-header-scrollbar"><div class="m-tab-header-wrapper w-grid-row"></div></div>' +
      '<div class="i-item-container w-grid-row"></div>' +
      '<div class="m-tab-footer w-grid-row"></div>' +
      '</div>',

      templateSelectors: {
        headerWrapper: " .m-tab-header-scrollbar > .m-tab-header-wrapper",
        itemContainer: " .i-item-container",
        footer: " .m-tab-footer"
      },

      initialize: function (options) {
        this._super(options); //.apply(this, options);
        this.header = new widget.Composite({
          element: {
            className: "m-tab-header-header"
          }
        })
      },

      events: {
        afterRender: [
          function () {
            this.header.render(this.headerWrapper);
          }
        ],
        ready: [
          function () {
            if (this.tabs) {
              for (var i in this.tabs) {
                this.addTab(this.tabs[i]);
              }
            }
          }
        ]
      },

      addTab: function (tabContent) {

        var content = this.addItem(tabContent);

        var tabHeader = tabContent.tabHeader || {};
        tabHeader.typeName = 'm-tab-item-header';
        tabHeader.contentUuid = content.uuid;
        tabHeader.closeable = tabContent.closeable;

        tabHeader.caption = tabHeader.caption || {};
        if (tabContent.caption) {
          tabHeader.caption.textContent = tabContent.caption
        }

        var header = this.header.addItem(tabHeader);
        header.getTabHeader = function () {
          return widget.Components[content.uuid];
        }
        header.activate();
        return header;
      },

      removeTab: function () {

      },

      setActiveTab: function (candidate) {
        if (!candidate) return;
        if (!core.isString(candidate)) {
          candidate = candidate.uuid;
        }

        if (!candidate) {
          core.debug("no candidate given");
          return;
        }

        if (!this.isChildItem(candidate)) {
          core.debug("candidate is not my item");
          return;
        }

        widget.Components[candidate].activate();

      },

      getActiveTab: function () {

      }
      /*
      TODO
      TRIGGER
      TABCHANGE BEFORE AFTER
      TABADD BEFORE AFTER
      TABREMOVE BEFORE AFTER

      ADD

      REMOVE

      SETACTIVE

      GETACIVE
      */
    });


    /************************************************************************************************
     *
     * Form & Fields
     *
     ************************************************************************************************/
    material.Field = widget.Component.construct({
      typeName: 'm-field',
      templateHtml: '<label class="m-field m-row"><span class="m-input-label m-cell"></span><span class="m-input m-cell"><input/></span>' +
      '<span class="m-input-selector m-cell"><i class="material-icons"></i></span></label>',
      templateSelectors: {
        inputWrapper: " .m-input",
        input: " .m-input > input",
        selector: " .m-input-selector",
        selectorIcon: " .m-input-selector>i",
        label: " .m-input-label",
      },

      setFocus: function () {
        this.element.classList.add("focused");
        this.label.classList.add("focused");
        this.input.classList.add("focused");
        this.inputWrapper.classList.add("focused");
      },

      looseFocus: function () {
        this.element.classList.remove("focused");
        this.label.classList.remove("focused");
        this.input.classList.remove("focused");
        this.inputWrapper.classList.remove("focused");
      },

      input: {
        events: {
          focus: [
            function () {
              this.setFocus();
            }
          ],

          blur: [
            function () {
              this.looseFocus();
            },
          ],
          input: [
            function (e) {
              this.fire('change', this.value)
            }
          ]
        },
      },

      getValue: function () {
        return this.input.value;
      },

      setValue: function (val) {
        this.input.value = val;
      },

      classModifier: {

        withClassDo: function (cl) {

          core.bindProperty({
            to: cl.prototype,
            toProperty: "name",
            getter: function () {
              return this.input.name;
            },
            setter: function (val) {
              this.input.name = val;
            }
          });

          core.bindProperty({
            to: cl.prototype,
            toProperty: "labelText",
            getter: function () {
              return this.label.textContent;
            },
            setter: function (val) {
              this.label.textContent = val;
            }
          });

          core.bindProperty({
            to: cl.prototype,
            toProperty: "value",
            getter: function () {
              return this.getValue();
            },
            setter: function (val) {
              this.setValue(val);
            }
          })
        }
      }
    }
    );

    material.Checkbox = material.Field.construct({

      typeName: 'm-checkbox',

      /*
      templateHtml: '<label class="m-checkbox m-field m-row"><span class="m-input-label m-cell"></span>' +
      '<span class="m-input m-cell"><input type="checkbox"/></span>' +
      '<span class="checkhelper"></span><span class="m-input-selector"></span></label>',
      */

      templateHtml: '<label class="m-checkbox m-field m-row">' +
      '<span class="m-input-label m-cell"></span>' +
      '<span class="m-input m-cell"><input type="checkbox" tabindex="0"/>' +
      '<span class="checkhelper"></span></span><span class="m-input-selector"></span></label>',

      getValue: function () {
        return this.input.checked;
      },

      setValue: function (val) {
        this.input.checked = val;
      },
      input: {
        events: {
          change: [
            function (e) {
              this.fire('change check', this.value)
            }
          ]
        }
      },

    });


    material.TextField = material.Field.construct({

      typeName: 'm-textfield',

      templateHtml: '<label class="m-textfield m-field m-row"><span class="m-input-label m-cell"></span>' +
      '<span class="m-input m-cell"><textarea></textarea></span>' +
      '<span class="m-input-selector"></span></label>',

      templateSelectors: {
        inputWrapper: " .m-input",
        input: " .m-input > textarea",
        selector: " .m-input-selector",
        label: " .m-input-label",
      },

      getValue: function () {
        return this.input;
      },

      setValue: function (val) {
        this.input = val;
      },
    });


    material.Editor = widget.Component.construct({
      //http://codepen.io/tinanimo/pen/KLkDf
      templateHtml: '<div class="m-editor">' +

      '<div class="m-editcontrols">' +
      '<i data-role="undo" class="material-icons">undo</i>' +
      '<i data-role="redo" class="material-icons">redo</i>' +
      '<i data-role="italic" class="material-icons">format_italic</i>' +
      '<i data-role="bold" class="material-icons">format_bold</i>' +
      '<i data-role="underline" class="material-icons">format_underlined</i>' +
      '<i data-role="strikeThrough" class="material-icons">format_strikethrough</i>' +

      '<i data-role="superscript" class="material-icons">vertical_align_top</i>' +
      '<i data-role="subscript" class="material-icons">vertical_align_bottom</i>' +

      '<i data-role="justifyLeft" class="material-icons">format_align_left</i>' +
      '<i data-role="justifyCenter" class="material-icons">format_align_center</i>' +
      '<i data-role="justifyRight" class="material-icons">format_align_right</i>' +

      '<i data-role="justifyFull" class="material-icons">format_align_justify</i>' +

      '<i data-role="indent" class="material-icons">format_indent_increase</i>' +
      '<i data-role="outdent" class="material-icons">format_indent_decrease</i>' +

      '<i data-role="insertUnorderedList" class="material-icons">format_list_bulleted</i>' +
      '<i data-role="insertOrderedList" class="material-icons">format_list_numbered</i>' +
      '<i data-role="removeFormat" class="material-icons">format_clear</i>' +

      '</div><div class="m-editablecontent" style="" contenteditable tabindex="0"></div></div>',

      typeName: 'm-editor',

      templateSelectors: {
        editcontrols: " .m-editcontrols",
        editablecontent: " .m-editablecontent"
      },

      editcontrols: {
        onselectstart: function () {
          return false
        },

        onmousedown: function () {
          return false
        },

        events: {
          click: [function (e) {
            var el = e.target || e.srcElement;

            while (el.dataset && !(el.dataset && el.dataset.role)) {
              if (el.parentNode) {
                el = el.parentNode
              } else {
                return
              }
            }
            var res = document.execCommand(el.dataset.role, false, null);

            e.stopPropagation();

            return false;
            /*          switch (el.dataset.role) {
            case 'h1':
            case 'h2':
            case 'p':
            document.execCommand('formatBlock', false, el.dataset.role);
            break;
            default:
            document.execCommand(el.dataset.role, false, null);
            break;
            }*/
          }
          ]
        }
      }
    })


    material.EditorField = material.Field.construct({

      typeName: 'm-editorfield',

      templateHtml: '<label class="m-field m-row"><span class="m-input-label m-cell"></span>' +
      '<span class="m-input m-cell"><span class="m-editor"><span class="m-editablecontent"></span></span>' +
      '<span class="m-input-selector m-cell"></span></label>',

      templateSelectors: {
        inputWrapper: " .m-input",
        inputHolder: " .m-input > .m-editor",
        input: " .m-input > .m-editor > .m-editablecontent",
        selector: " .m-input-selector",
        label: " .m-input-label",
      },


      events: {
        beforeRender: [
          function () {
            this.inputWrapper.removeChild(this.inputHolder);
          }
        ],
        render: [
          function () {
            this.editor.render(this.inputWrapper);
          }
        ],
        afterInitialize: [
          function () {
            var th = this;
            this.editor = new material.Editor({
              editablecontent: {
                events: {
                  focus: [
                    function () {
                      th.setFocus();
                    }
                  ],
                  blur: [
                    function () {
                      th.looseFocus();
                    }
                  ]
                }
              },
              input: {
                events: {
                  input: [
                    function (e) {
                      th.fire('change', th.value)
                    }
                  ]
                }
              },
            });
          }
        ],
      },

      getValue: function () {
        return this.input.innerHTML;
      },

      setValue: function (val) {
        this.input.innerHTML = val;
      },
    });


    material.FieldSet = widget.Composite.construct({
      typeName: 'm-fieldset',
      templateHtml: '<fieldset class="m-fieldset"><legend><span class="m-fieldset-legend"></span></legend><div class="i-item-container"></div></fieldset>',
      templateSelectors: {
        itemContainer: " .i-item-container",
        legend: "legend .m-fieldset-legend"
      }
    });


    material.Form = widget.Composite.construct({
      typeName: 'm-form',
      templateHtml: '<div class="m-form"><form onsubmit="return false;"><div class="i-item-container"></div><div class="i-footer"></div></form></div>',
      templateSelectors: {
        formular: "form",
        itemContainer: " form > .i-item-container",
        footer: " form > .i-footer"
      },

      getElement: function (name) {
        var elements = this.formular.elements;
        for (var i = 0; i < elements.length; i++) {
          if (elements[i].name == name) {
            return elements[i];
          }
        }
      },

      getValue: function (name) {

        var el = this.getElement(name);
        if (el) {
          return el.value;
        }
      }
    });

    material.FormFooter = widget.Composite.construct({
      typeName: 'm-formfooter',
      templateHtml: '<div class="m-formfooter m-row"><span class="m-filler m-cell"></span><div class="i-item-container"></div><span class="m-filler"></div>',
      templateSelectors: {
        itemContainer: " .i-item-container",
      },
    });


    /*******************************************************************************
     *
     * Overlay
     *
     *******************************************************************************/

    material.Overlay = widget.Composite.construct({

      typeName: 'm-overlay',

      templateHtml: '<div class="m-overlay"><div class="m-grid-wrapper i-item-container"></div></div>',

      templateSelectors: {
        itemContainer: " .i-item-container"
      },

      events: {

        beforeShow: [
          function () {

            if (!this.isRendered) {
              if (!this.renderIn) {
                var tmp = document.createElement('div');
                document.body.appendChild(tmp);
                this.renderIn = tmp;
              }
              this.render(this.renderIn);
            }
          }
        ]
      }
    });


    material.Spinner = widget.Component.construct({

      typeName: 'm-spinner',

      templateHtml: '<div class="m-spinner-wrapper"><div class="m-spinner"></div></div>',

      templateSelectors: {
        inner: " .m-spinner"
      },

      events: {

        beforeShow: [
          function () {

            if (!this.isRendered) {
              if (!this.renderIn) {
                var tmp = document.createElement('div');
                document.body.appendChild(tmp);
                this.renderIn = tmp;
              }
              this.render(this.renderIn);
            }
          }
        ],

        afterRender: [
          function() {

          }
        ]
      }
    })

    /*******************************************************************************
     *
     *
     *******************************************************************************/

    material.MessageBox = material.Overlay.construct({

      typeName: 'm-messagebox',
      items: [
        {
          /*				typeName: 'm-card',
                  element: {
                    style: {
                      position: 'absolute',
                      margin: 'auto',
                      top: 0, left: 0,
                      right: 0, bottom: 0,
                      zIndex: 1999
                    }
                  },
          
                  header: {
                    style: {
                      background: '#ff3333'
                    }
                  }, */
        }
      ]

    });


    material.error = function (message) {
      var window = core.create({
        typeName: 'm-messagebox',
        items: [{
          typeName: 'm-card',
          element: {
            style: {
              margin: 'auto'
            }
          },
          header: {
            textContent: 'ERROR'
          },
          itemContainer: {
            style: {
              flexDirection: 'column'
            }
          },
          items: [
            {
              typeName: 'i-component',
              element: {
                textContent: message
              }
            }, {
              typeName: 'm-button',
              events: {
                afterRender: [
                  function (sender) {
                    this.element.focus()
                  }
                ]
              },

              element: {
                textContent: 'close',
                events: {
                  click: [
                    function (sndr) {
                      window.close()
                    }
                  ]
                }
              },

            }
          ]
        }]

      });
      window.show();

      return window;
    }
    return material;
  });

});
