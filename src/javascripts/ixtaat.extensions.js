/***********************************************************************************************************************************
 ***********************************************************************************************************************************
 *
 * String extension
 *
 ***********************************************************************************************************************************
 ***********************************************************************************************************************************/
(function (globals) {

  Ixtaat.extend(String.prototype, function () {


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
        position = Ixtaat.isNumeric(position) ? position : 0;
        return this.lastIndexOf(pattern, position) === position;
      }
    }

    if (!String.prototype.endsWith) {
      ext.endsWith = function (pattern, position) {
        pattern = String(pattern);
        position = Ixtaat.isNumeric(position) ? position : this.length;
        if (position < 0) position = 0;
        if (position > this.length) position = this.length;
        var d = position - pattern.length;
        return d >= 0 && this.indexOf(pattern, d) === d;
      }
    }

    return ext;

  }())

})(this);

