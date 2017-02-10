/**
 *
 * Date: 05.01.16
 * Time: 08:38
 * Copyright 2016 H-DV
 *
 * WWW.H-Ixtaat.DE
 *
 * http://kangax.github.io/compat-table/es5/
 *
 */

(function (globals) {
  var ix = {};

  Ixtaat.Controller = Class.define(
      /** @lends Ixtaat.Ajax.Core.prototype */
      {
        /**
         *
         */
        include: Ixtaat.Observer,

        extend: function (options) {
          Ixtaat.extend(this, options);
        },


        initialize: function (options) {

          this.initializeObserver(options);

          this.fire('beforeInitialize', this);

          this._super(options);

          this.extend(options);

          var th=this;
          if (document.readyState === "complete") {
            this.fire('ready');
          } else {
            document.addEventListener("load", function(event) {

              th.fire('ready');
            });
          }

          this.fire('afterInitialize', this);

        }
      }
  );

})(this);
