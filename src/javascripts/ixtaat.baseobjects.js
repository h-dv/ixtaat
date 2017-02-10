/***********************************************************************************************************************************
 ***********************************************************************************************************************************
 *
 * Observer
 *
 ***********************************************************************************************************************************
 ***********************************************************************************************************************************/

(function (globals) {
  /**
   * @class
   */
  Ixtaat.Observer = Class.define(
      /** @lends Ixtaat.Observer.prototype */
      {
        observations: null,

        /**
         * @param options
         */
        initializeObserver: function (options) {

          this.observations = {};

          this._recursiveRegisterEvents(this);

          if (options && options.events) {
            this.on(options.events);
          }

        },

        /**
         *
         * @param obj
         * @private
         */
        _recursiveRegisterEvents: function (obj) {

          if (obj._ancestor) this._recursiveRegisterEvents(obj._ancestor);

          if (obj.events) this.on(obj.events);

        },

        /**
         *
         * @param options
         */
        on: function (options) {
          if(this.hookBeforeEventAdd)
            options = this.hookBeforeEventAdd(options);

          for (var event in options) {
            if (typeof options[event] != 'undefined') {

              var exists = false;

              if (!this.observations[event]) this.observations[event] =[];

              olist = this.observations[event];

              for (var i in olist) {
                var observation = olist[i];
                if (observation.name == event.toString() && observation.func ==
                    options[event]) {
                  exists = true;
                  break;
                }
              }


              if (!exists) {
                Ixtaat.debug(" ++ add event "+ event );
                if (!Ixtaat.isArray(options[event])) {
                  Ixtaat.error("no array given in definition for event : <"+ event + ">");
                }
                for (var idx in options[event]) {
                  var fncDef = options[event][idx];
                  var h={};
                  if (typeof fncDef == 'function') {
                    h.func = fncDef;
                  } else {
                    h.func = fncDef.fn;
                    h.useCapture = fncDef.useCapture;
                    h.scope = fncDef.scope;
                  }
                  olist.push(h);
                  if (typeof this.hookEventAdded == 'function') this.hookEventAdded(
                    h);
                }
              }
            }
          }
        },

        /**
         *
         * @param name
         * @param func
         */
        remove: function (name, func) {
          var olist = this.observations[name];
          for (var i in olist) {
            if (olist[i].func==func) {
	            olist.splice(i, 1);
            }
            if (typeof this.hookEventRemoved == 'function') {
              this.hookEventRemoved(name, olist[i]);
            }
          }
        },

        /**
         *
         * @param name
         * @param data
         */
        fire: function (name, data) {
          var result = true;
          if (this.isWidget) Ixtaat.debug('fire ' + (this.uuid ? this.uuid :
                  ' no ID ') +
              ' : ' + name);
          var olist = this.observations[name];
          for (var i in olist) {
            try {
              if (olist[i].func.call(olist[i].scope ||
                  this,
                  data) ===false ) result = false ;
            } catch (e) {
              Ixtaat.info("error in event <", name, ">: ", e.message , e.stack);
            }
          }
          return result ;
        },

        /**
         *
         * @param name
         * @returns {boolean}
         */
        hasObservationFor: function (name) {
          for (var i in this.observations) {
            var item = this.observations[i];
            if (item.name == name) return true;
          }
          return false;
        }
      })
})(this);


/***********************************************************************************************************************************
 ***********************************************************************************************************************************
 *
 * Ajax
 *
 ***********************************************************************************************************************************
 ***********************************************************************************************************************************/

(function (globals) {

  Ixtaat.Ajax = {};

  /**
   * @class
   */
  Ixtaat.Ajax.Core = Class.define(
      /** @lends Ixtaat.Ajax.Core.prototype */
      {

        /**
         *
         */
        activeRequestCount: 0,

        /**
         *
         * @returns {*}
         */
        getRequest: function () {
          if (window.XMLHttpRequest) {
            // Chrome, Firefox, IE7+, Opera, Safari
            return new XMLHttpRequest();
          }
          // IE6
          try {
            // The latest stable version. It has the best security, performance,
            // reliability, and W3C conformance. Ships with Vista, and available
            // with other OS's via downloads and updates.
            return new ActiveXObject('MSXML2.XMLHTTP.6.0');
          } catch (e) {
            try {
              // The fallback.
              return new ActiveXObject('MSXML2.XMLHTTP.3.0');
            } catch (e) {
              alert('This browser is not AJAX enabled.');
              return null;
            }
          }
        },

        /** @constructs */
        initialize: function (options) {

          Ixtaat.extend(this, options || {});

          this.method = this.method.toLowerCase();
        }

      })


  /**
   * @class
   */
  Ixtaat.Ajax.Request = Ixtaat.Ajax.Core.define(
      /** @lends Ixtaat.Ajax.Request.prototype */
      {
        defaults: {
          request: null,
        },
        /**
         *
         */
        include: Ixtaat.Observer,
        /**
         *
         */
        async: true,
        /**
         *
         */
        method: 'GET',
        /**
         *
         */
        mimetype: 'json',
        /**
         *
         */
        request: null,
        /**
         *
         */
        fires: [
          'readyStateChange',
          'open',
          'send',
          'abort',
          'unset',
          'opened',
          'headersReceived',
          'loading',
          'done'
        ],
        /**
         *
         * @param options
         */
        initialize: function (options) {
          this.initializeObserver(options);
          this._super(options);

          this.request = this.getRequest();

          this.request.onreadystatechange = this.onReadyStateChange.bind(
              this);
          this.request.onsend = function () {
            this.fire('send', this.request)
          }.bind(this);
          this.request.onopen = function () {
            this.fire('open', this.request)
          }.bind(this);
          this.request.onabort = function () {
            this.fire('abort', this.request)
          }.bind(this);
        },

        /**
         *
         */
        onReadyStateChange: function () {
          this.fire('readyStateChange', this.request);
          switch (this.request.readyState) {
            case XMLHttpRequest.UNSENT: // request not initialized
              this.fire('unset', this.request);
              break;
            case XMLHttpRequest.OPENED: // server connection established
              this.activeRequestCount++;
              this.fire('opened', this.request);
              break;
            case XMLHttpRequest.HEADERS_RECEIVED: // request received
              this.fire('headersReceived', this.request);
              break;
            case XMLHttpRequest.LOADING: // processing request
              this.fire('loading', this.request);
              break;
            case XMLHttpRequest.DONE: // request finished and response is ready
              if (this.mimetype && this.mimetype.toUpperCase() == 'JSON' &&
                  this.request
                      .responseText) {
                try {
                  this.request.responseJson = JSON.parse(this.request.responseText);
                } catch(ex) {
                  Ixtaat.error("Error Parse JSON " + this.url + ": "+ this.request.responseText);
                }
              }
              this.fire('done', this.request);
              this.activeRequestCount--;
              break;
            default:
              break;
          }
        },

        /**
           *
         * @returns {*}
         */
        doSend: function () {
          if (this.request) {

            var params = this.params || {};


            var csrf = Ixtaat.getMeta("csrf-token");

            if (csrf) {
              params["authenticity_token"] = csrf;
            }

            params = this.preparePostData(params);

            var url = this.prepareUrl(params);

            this.request.open(this.method, url, this.async);

            this.request.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

            if (this.method.toUpperCase() != 'POST') {
                params = null;
            } else {
              if (this.mimetype && this.mimetype.toUpperCase() == 'JSON') {
                params = Ixtaat.toJson(params);
                this.request.setRequestHeader("Content-Type",
                    "application/json;charset=UTF-8");
              }
            }

            this.request.send(params);

            if (!this.async) {
              if (this.mimetype && this.mimetype.toUpperCase() == 'JSON' &&
                  this.request
                      .responseText) {
                return Ixtaat.fromJson(this.request.responseText);
              } else {
                return this.request.responseText;
              }
            } else {
              return true;
            }
          }
          return false;
        },
        /**
         *
         * @returns {boolean}
         */
        abort: function () {
          if (this.request) {
            this.request.abort();
            if (typeof(this.onAbort) == "function") {
              this.onAbort(this.request);
            }
            return true;
          }
          return false;
        },
        /**
         *
         * @param params
         * @returns {*}
         */
        preparePostData: function (params) {
          return params
        },
        /**
         *
         * @param params
         * @returns {*}
         */
        prepareUrl: function (params) {
          if (this.method.toUpperCase() != 'POST') {
            var s = [];
            if (params) {
              for (var param in params) {
                if (typeof params[param] != 'function' && typeof params[
                        param] !=
                    'undefined') s.push(param.concat("=", params[param]))
              }
            }
            var u = "";
            if (s.length > 0) {
              u = '?' + encodeURI(s.join('&'));
            }
            return this.url + u
          } else {
            return this.url
          }
        }

      });


  /**
   * @function Ixtaat.Request
   */
  Ixtaat.Request = function (options) {
    return (new Ixtaat.Ajax.Request(options)).doSend();
  }

})(this);


/***********************************************************************************************************************************
 ***********************************************************************************************************************************
 *
 * Data
 *
 ***********************************************************************************************************************************
 ***********************************************************************************************************************************/

(function (globals) {


  /**
   * @class
   */
  Ixtaat.Wire = Class.define({

    include: Ixtaat.Observer,

    defaults: {
      values: {}
    },

    initialize: function(model, fields) {
      var field;

      this.views = {};

      for(var i in fields) {

        field = fields[i];

        this.views[field] = [];

        getter = new Function('val', 'return this.values.' + field );
        setter = new Function('val', 'this.values.'+field+' = val; this.notifyViews(\'' + field + '\', val);');

        Ixtaat.bindProperty({
          to: this,
          toProperty: field,
          getter: getter,
          setter: setter
        })
      }
    },

    bind: function(field, widget, property, options) {
      options=options||{};
      var setview;
      if (!property) {

        var changeListener = new Function('data', 'this.'+ field + '=data').bind(this);

        //bind to a component as model
        property='value';
        widget.on({
          change: [ changeListener ]
        })
        options.listener = changeListener;
      }
      setview =new Function('val', 'Ixtaat.Components.'+widget.uuid + '.' + property + '=val');
      this.views[field].push({w:widget, p:property, f:setview, o:options});

      setview(this[field]);
    },

    unbind: function(field, widget, property) {
    	if (!property) property='value';
      for (var i in  this.views[field]) {
	      var b = this.views[field][i];
        if(b.w==widget && b.p==property) {
	        if(b.f) widget.remove('change', b.o.listener);
          delete this.views[field][i];
          break;
        }
      }
    },

    notifyViews: function(field, value) {
      for(var i in this.views[field]) {
        var s = this.views[field][i];
        try {
          s.f(value);
        } catch (e) {
        }
      }
    }
  });


  Ixtaat.DataProvider =  Class.define({

    include: Ixtaat.Observer,

    defaults :{
      updatable: true,
      filters:  [],
      sort: [],
      rawData: [],
      changedRows: [],
      removedRows: []
    },

    fires: [
      'loading',
      'loaded',
      'save',
      'saved',
      'datachange',
      'datachanged'
    ],

    extend: function (options) {
      Ixtaat.extend(this, options );
    },

    initialize: function(options) {
      this.initializeObserver(options);
      this.extend(options || {});
    },

    /**
     *
     * @param options
     * from
     * to
     */
    getList : function (options) {

    },

    getCount :function() {

    },

    setFilter : function(filter) {

    },

    setSort: function(list) {

    },

    getRow: function(idx) {

    },

    setRow: function(idx, data) {

    },

    isDirty : function() {
      return false
    }

  });

  Ixtaat.JsonDataProvider = Ixtaat.DataProvider.define({

    defaults: {
      url : "",
      parameterNameFilter : "filter",
      parameterNameSort : "sort",
      parameterNameOffset: "offset",
      parameterNameSize: "size",
      parameterNameQuery: "query"
    },

    initialize : function(options) {
      this._super(options);
      if (! this.url.endsWith('/'))  this.url += '/';
    },

    retrieve :function() {

    },

    update: function() {

    },

    getCount : function(options) {
      var th=this;
      var res = Ixtaat.Request({
        url: this.url + '_count',
        params: this.buildParameter(),
        events : {
          done: [
            function(res) {
              th._count = res.responseJson['count'];
              options.success(th._count)
            }
          ]
        }
      });
    },

    getRow: function(idx) {
      return this._cache[idx - this._from]
    },

    getList : function (options) {
      this.offset = options.from;
      this.size = options.to - options.from;
      if (this.size && this.offset) {
        if (this.size==this._size && this.offset==this._offset)  {
          return this._cache;
        }
      }

      var th  = this;
      Ixtaat.Request({
        url : this.url ,
        params : this.buildParameter(),
        events : {
          done: [
              function(data) {
                th._cache = data.responseJson;
                th._from = options.from;
                th._to = options.to;
                options.success(th._cache);
              }.bind(th)
          ]
        }
      });
    },

    buildParameter : function() {
      var res={};
      if (this.filter) {
        res[this.parameterNameFilter] = Ixtaat.extend({}, this.filter);
      };
      if (this.filter) {
        res[this.parameterNameSort] = Ixtaat.extend({}, this.sort);
      };

      if (this.offset!=null) res[this.parameterNameOffset]  = this.offset || 0;

      if (this.size!=null) res[this.parameterNameSize]  = this.size || 100;

      if (this.query!=null) res[this.parameterNameQuery] = this.query;

      return res;
    }
  });

  Ixtaat.MemoryDataProvider = Ixtaat.DataProvider.define({
    defaults: {
      data: [],
    },

    initialize: function (options) {
      if (options.data) this.data = options.data;
      this._super(options);
    },
    /**
     *
     * @param options
     *  from
     *  to
     * @returns {*}
     */
    getList : function (options) {
      options.success(this.data.slice(options.from, options.to));
    },

    getCount : function(options) {
      options.success(this.data.length);
    },


    getRow: function(idx) {
      return this.data[idx];
    },

    setRow: function(idx, value) {
      this.data[idx] = value;
    }

  });


})(this);
