/**
 *
 * Date: 09.06.16
 * Time: 19:52
 * Copyright 2016 H-DV
 *
 * WWW.H-DV.DE
 *
 */


/************************************************************************************************
 *
 * Table
 *
 ************************************************************************************************/

"use strict";
loader.define('ixtaat/table', ['ixtaat/core', 'ixtaat/base', 'ixtaat/widget'], function (core,base, widget) {

  return loader.load.css('ixtaat/table').then(function(){

     widget.readCssColors();

     var table = {};

    table.List = widget.Component.construct({

      defaults: {
        retrieveblockSize: 500,
      },

      typeName: "i-list",

      /**
       * @member
       */
      templateHtml: '<div class="i-list"><div class="scrollarea" tabindex="0">' +
        '<div class="content"><div class="topspacing"></div><div class="contentrow empty"></div><div class="bottomspacing" style="height: 1000000px"></div></div></div></div>',

      /**
       * @member
       */
      templateSelectors: {
        scrollarea: ".scrollarea",
        content: ".scrollarea > .content",
        bottomSpacing: ".scrollarea > .content > .bottomspacing",
        topSpacing: ".scrollarea > .content > .topspacing",
        rows: function () {
          return this.findAll(".scrollarea > .content > .contentrow");
        }
      },

      initialize: function (options) {
        if (options.dataProvider) this.setDataProvider(options.dataProvider);
        this._super(options); //.apply(this, options);
        this.rowHeight = 22;
      },

      getRow: function (row) {
        return this.content.querySelector('[data-id="' + row + '"]');
      },

      selectRow: function (row) {

        if (row == undefined || row < 0) return;

        var sel = this.content.querySelectorAll('.selected');

        for (var i = 0; i < sel.length; i++) {
          sel[i].classList.remove('selected')
        }

        this.selectedRow = row;

        var el = this.getRow(row);
        if (el) {
          el.classList.add('selected');
          el.focus();
        }
      },

      /**
       *
       * @param row
       */
      scrollToRow: function (row) {
        var firstRow = Math.floor(this.calcRowFromPosition(this.scrollarea.scrollTop));
        if (row < firstRow || row >= Math.floor(firstRow + (this.scrollarea.clientHeight / this.rowHeight))) {
          var newPos = this.calcPositionFromRow(row - ((this.scrollarea.clientHeight / this.rowHeight) / 2));
          this.scrollarea.scrollTop = newPos;
        }
      },

      getSelectedRow: function () {
        return this.selectedRow;
      },

      calcVisibleRows: function () {
        return Math.floor(this.scrollarea.clientHeight / this.rowHeight);
      },

      scrollarea: {
        events: {
          click: [
            function (evt) {
              var row = this.getRowFromEvent(evt);
              this.selectRow(row);
            }
          ],
          keydown: [
            function (event) {

              core.debug("key:" + event.keyCode);
              switch (event.keyCode || event.which) {
                case 33: //pageup
                  var row = this.getSelectedRow() - this.calcVisibleRows() - 1;
                  if (row < 0) row = 0;
                  this.selectRow(row);
  //                setTimeout(function() {
                  this.scrollToRow(row);
  //                }.bind(this),50);
                  event.preventDefault();
                  break;
                case 34: //pagedown
                  var row = this.getSelectedRow() + this.calcVisibleRows() - 1;
                  if (row > this.currentCount) row = this.currentCount;
                  this.selectRow(row);
  //                setTimeout(function() {
                  this.scrollToRow(row);
  //                }.bind(this),50);
                  event.preventDefault();
                  break;
                case 35: //ende
                  this.selectRow(this.currentCount - 1);
                  this.scrollarea.scrollTop = this.scrollarea.scrollHeight - this.scrollarea.clientHeight;
                  event.preventDefault();
                  break;
                case 36: //pos1
                  this.selectRow(0);
                  this.scrollarea.scrollTop = 0;
                  event.preventDefault();
                  break;
                case 37: //left
  //                event.preventDefault();
                  break;
                case 38: //up
                  var row = this.getSelectedRow();
                  this.selectRow(row - 1);
  //                setTimeout(function() {
                  this.scrollToRow(row - 1);
  //                }.bind(this),50);
                  event.preventDefault();
                  break;
                case 39: //right
  //                event.preventDefault();
                  break;
                case 40: //down
                  var row = this.getSelectedRow();
                  this.selectRow(row + 1);
  //                setTimeout(function() {
                  this.scrollToRow(row + 1);
                  //}.bind(this),50);
                  event.preventDefault();
                  break;
              }
            }
          ],
          scroll: [
            function (e) {
              if (this._last_top_scrollpos !=e.currentTarget.scrollTop ) {  
                this._last_top_scrollpos =e.currentTarget.scrollTop;  
                var minScrollTime = 100;
                var now = new Date().getTime();

                if (!this.scrollTimer) {
                  if (now - this.lastScrollFireTime > (3 * minScrollTime)) {
                    this.requestRedraw();
                    this.lastScrollFireTime = now;
                  }
                  this.scrollTimer = setTimeout(function () {
                    this.requestRedraw();
                    this.scrollTimer = null;
                    this.lastScrollFireTime = new Date().getTime();

                  }.bind(this), minScrollTime);
                }
              }
            }
          ]
        },
      },

      calcPositionFromRow: function (row) {
        core.debug('calcPositionFromRow ' + row);
        var position = 0;
        var c = 0;
        if (row <= this.currentRangeFrom) {
          c = this.currentRangeFrom;
          position = this.topSpacing.clientHeight * row / c;
        } else if (row <= this.currentRangeTo) {
          position = this.topSpacing.clientHeight;
          row = row - this.currentRangeFrom;
          position = position + (row * this.rowHeight);
        } else {
          c = this.currentRangeTo - this.currentRangeFrom;
          row = row - this.currentRangeTo;
          position = this.topSpacing.clientHeight + ((row / c) * this.bottomSpacing);
        }
        return position;
      },

      calcRowFromPosition: function (scrollPosition) {
        core.debug('calcRowFromPosition ' + scrollPosition);

        var scrollExtend = this.scrollarea.scrollHeight - this.scrollarea.clientHeight;
        this.currentCount = core.isNumeric(this.currentCount) ? this.currentCount : 0;

        if (this.currentCount == 0) return 0;

        if (scrollExtend == 0) return 0;

        var contentHeight = this.content.clientHeight - this.bottomSpacing.clientHeight - this.topSpacing.clientHeight;
        var t1 = this.topSpacing.clientHeight;
        var t2 = t1 + contentHeight;
        var row;
        if (scrollPosition < t1) {
          row = Math.round(this.currentRangeFrom * scrollPosition / (t1))
        } else if (scrollPosition < t2) {
          var rangeCount = this.currentRangeTo - this.currentRangeFrom;
          scrollPosition = scrollPosition - t1;
          row = this.currentRangeFrom + Math.round(rangeCount * scrollPosition / (contentHeight))
        } else {
          scrollPosition = scrollPosition - t2;
          var rangeCount = this.currentCount - this.currentRangeTo;
          row = this.currentRangeTo + Math.round(rangeCount * scrollPosition / (this.bottomSpacing.clientHeight - this.scrollarea.clientHeight))
        }
        core.debug("row : " + row + " POS " + scrollPosition);
        return row;
      },


      requestRedraw: function () {
        var fnct = function (rowCount) {

          if (rowCount == 0) {
            this.setTopSpacing(0);
            this.setBottomSpacing(0);
            for (var i = this.rows.length; i > 0; i--) {
              this.content.removeChild(this.rows[i - 1]);
            }
            var r = this.newRowElement();
            r = this.renderRow({}, r);
            this.content.appendChild(r);
            return;
          }

          var positionRow = this.calcRowFromPosition(this.scrollarea.scrollTop);

          var trigger = 50;

          var from = Math.ceil(positionRow - (this.retrieveblockSize / 2));

          from = (from < 0) ? 0 : from;

          var to = from + this.retrieveblockSize;

          to = (to > rowCount) ? rowCount : to;

          if (positionRow < 0) positionRow = 0;


          if (this.currentRangeFrom == undefined ) this.currentRangeFrom = 0;
          if (this.currentRangeTo == undefined ) this.currentRangeTo = 0;

          if (from < this.currentRangeFrom || to > this.currentRangeTo) {
  //					if (this.currentRangeFrom == undefined || this.currentRangeTo == undefined) {
    //					this.buildContent(from, to, rowCount);
  //					} else {

              var innerPositionRow = positionRow + trigger * (1 - (2 * positionRow / rowCount));

              if (innerPositionRow < (this.currentRangeFrom + trigger ) ||
                (innerPositionRow) > (this.currentRangeTo - trigger )) {
                this.buildContent(from, to, rowCount, positionRow);
              }
  //					}
          }
        }.bind(this);

        if (this.currentCount == undefined) {
          this.dataProvider.getCount({
            success: fnct
          });
        } else {
          fnct(this.currentCount);
        }
      },

      setDataProvider: function (dataProvider) {
        this.dataProvider = dataProvider;
        this.dataProvider.on({
          retrieved: [function () {
            this.update();
          }]
        });
      },

      events: {
        afterRender: [
          function () {
            this.initializeView();
          }
        ],
        ready: [
          function () {
            var el;
            var p = this.parent();
            if (p.itemContainer) {
              var el = p.itemContainer;
            } else {
              el = p.element;
            }
          }
        ]
      },

      initializeView: function () {
        this.currentCount = undefined;
        this.currentRangeFrom = 0;
        this.currentRangeTo = 0;
        this.requestRedraw();
        this.selectRow(0);
      },

      resetContent: function () {
        this.setTopSpacing(0);
        this.setBottomSpacing(0);
        for (var i = this.rows.length; i > 0; i--) {
          this.content.removeChild(this.rows[i - 1]);
        }
      },

      buildContent: function (from, to, count, positionRow) {
        from = parseInt(from);
        to = parseInt(to);

        this.element.classList.add("loading");

        var p = this.dataProvider;

        if (to > count) to = count;
        if (from > count) from = count;
        if (to < 0) to = 0;
        if (from < 0) from = 0;
        if (from > to) {
          var temp = from;
          from = to;
          to = temp;
        }

        core.debug(from + ' - ' + to);

        p.getList({
          from: from,
          to: to,

          success: function (range) {
            var l = this.rows.length;

            var parent = this.content;

            var allrowsHeight = 0, rowCount = 0;

            var frag = document.createDocumentFragment();

            for (var idx  in range) {
              idx = parseInt(idx)
              var r = this.newRowElement();
              var data = p.getRow(from + idx);
              r.dataset.id = from + idx;
              r = this.renderRow(data, r);
              frag.appendChild(r);
              rowCount++;
            }

            for (var i = this.rows.length; i > 0; i--) {
              parent.removeChild(this.rows[i - 1]);
            }

            parent.insertBefore(frag, this.bottomSpacing)

            for (var i = this.rows.length; i > 0; i--) {
              allrowsHeight = allrowsHeight + this.rows[i - 1].clientHeight;
            }

            this.rowHeight = allrowsHeight / rowCount;

            var invisibleRowHeight;

            var contentHeight;

            if (count * this.rowHeight > widget.MaxSupportedCssHeight) {
              invisibleRowHeight = ((widget.MaxSupportedCssHeight - allrowsHeight) / (count - rowCount));
              contentHeight = widget.MaxSupportedCssHeight;
            } else {
              invisibleRowHeight = this.rowHeight;
              contentHeight = this.rowHeight * count;
            }

            core.debug("invisibleRowHeight " + invisibleRowHeight);

            var topSpacing = invisibleRowHeight * from;
            var bottomSpacing = contentHeight - topSpacing - allrowsHeight;

            this.setTopSpacing(topSpacing);

            this.setBottomSpacing(bottomSpacing);

            this.currentRangeFrom = from;
            this.currentRangeTo = to;
            this.currentCount = count;

            this.scrollarea.scrollTop = this.calcPositionFromRow(positionRow);
            if (core.isNumeric(this.selectedRow)) this.selectRow(this.selectedRow);
            this.element.classList.remove("loading");
          }.bind(this)
        });

      },

      getRowElementFromEvent: function (event) {
        return widget.findParent(event.target, function (el) {
          return el.dataset.id !== undefined
        });
      },

      getRowFromEvent: function (event) {
        var element = this.getRowElementFromEvent(event);
        if (element) {
          return parseInt(element.dataset.id);
        }
      },

      getDataFromEvent: function (event) {
        var element = this.getRowElementFromEvent(event);
        if (element) {
          return this.dataProvider.getRow(element.dataset.id);
        }
      },

      setTopSpacing: function (value) {
        this.topSpacing.style.maxHeight = value + "px";
        this.topSpacing.style.height = value + "px";
      },

      setBottomSpacing: function (value) {
        this.bottomSpacing.style.maxHeight = value + "px";
        this.bottomSpacing.style.height = value + "px";
      },

      newRowElement: function () {
        var el = document.createElement('div');
        el.className = "contentrow";
  //      el.tabIndex = "0";
        return el;
      },

      renderRow: function (data, element) {
        return element;
      },

    });


    table.Table = table.List.construct({
      typeName: "i-table",

      templateHtml: '<div class="i-table">' +
      '<div class="header"><table class="tablehead"><colgroup/><thead><tr><th>Headers</th></tr></thead></table></div>' +
      '<div class="scrollarea" tabindex="0">' +
      '<table class="tablecontent"><colgroup/><tbody class="content"><tr class="topspacing"><td colspan="100%"></td></tr>' +
      '<tr class="contentrow"><td></td></tr>' +
      '<tr class="bottomspacing"><td colspan="100%" style="height: 100px"></td></tr>' +
      '</tbody></table></div></div>',

      /**
       * @member
       */
      templateSelectors: {
        header: "div.header ",
        headerTable: "div.header > table.tablehead ",
        contentTable: "table.tablecontent",
        headerColumns: "div.header > table.tablehead > colgroup",
        contentColumns: ".scrollarea > table.tablecontent > colgroup",
        headerRow: "div > table.tablehead > thead > tr",
        content: ".scrollarea > table > .content",
        bottomSpacing: ".scrollarea > table > .content > .bottomspacing",
        topSpacing: ".scrollarea > table > .content > .topspacing",
        rows: function () {
          return this.findAll(".scrollarea > table > .content > tr.contentrow");
        }
      },

      scrollarea: {
        events: {
          scroll: [
            function (e) {
              this.header.style.marginRight = (this.scrollarea.offsetWidth - this.scrollarea.clientWidth) + "px";

              var left = e.currentTarget.scrollLeft;
                this.header.scrollLeft = left;

            }
          ]
        }
      },
      header: {
        events: {
          scroll: [
            function (e) {
            
              this._last_left_scrollpos = e.currentTarget.scrollLeft;
            
              if(this._header_scroll_timer) {
                clearTimeout(this._header_scroll_timer);
              }

              this._header_scroll_timer = setTimeout(function() {

                this.scrollarea.scrollLeft = this._last_left_scrollpos;

              }.bind(this) , 100);

  //						if (e.currentTarget.scrollLeft - this.scrollarea.scrollLeft != 0)  this.scrollarea.scrollLeft = e.currentTarget.scrollLeft;
            }
          ]
        }
      },

      newRowElement: function () {
        var el = document.createElement('tr');
        el.className = "contentrow";
  //      el.tabIndex="0";
        return el;
      },

      newCellElement: function (fix) {
        var el;
        if (fix) {
          el = document.createElement('th');
        } else {
          el = document.createElement('td');
        }
        el.className = "contentcell";
  //      el.tabIndex ="0";
        return el;
      },

      newHeaderCellElement: function () {
        var el = document.createElement('th');
  //			el.draggable = true;
        el.className = "headercell";
        return el;
      },

      renderHeader: function () {

        while (this.headerRow.firstChild) {
          this.headerRow.removeChild(this.headerRow.firstChild);
        }

        while (this.contentColumns.firstChild) {
          this.contentColumns.removeChild(this.contentColumns.firstChild);
        }

        while (this.headerColumns.firstChild) {
          this.headerColumns.removeChild(this.headerColumns.firstChild);
        }

        for (var id in this.columns) {
          var column = this.columns[id];
          if (!column.hidden) {

            var el = this.newHeaderCellElement();

            var header = column.header || {};

            if (!header.typeName) header.typeName = 'i-table-header';
            header.column = column;

            this.headerRow.appendChild(el);


            var h = core.create(header);

            h.on({
              render:[
              function() {
              }
              ]
            });
            h.render(el);

            column.header = h;

            el = document.createElement('col');
            el.style.width = column.width + "px";
            this.headerColumns.appendChild(el);

            el = document.createElement('col');
            el.style.width = column.width + "px";
            this.contentColumns.appendChild(el);

          }
        }

        var el = this.newHeaderCellElement();
        el.classList.add("filler");
        this.headerRow.appendChild(el);

        el = document.createElement('col');
        el.classList.add("filler");
        this.headerColumns.appendChild(el);

        el = document.createElement('col');
        el.classList.add("filler");
        this.contentColumns.appendChild(el);

      },

      renderRow: function (data, rowElement) {

        for (var id in this.columns) {
          var column = this.columns[id];
          if (!column.hidden) {
            var cellElement = this.newCellElement();
            cellElement.classList.add(column.property);
            cellElement.style.width = column.width + "px";
            cellElement.textContent = data[column.property];

            if (column.cell) {
              cellElement = this.extendHtmlElement(cellElement, column.cell);
            }
            if (column.cellRenderer) {
              rowElement.appendChild(column.cellRenderer(data, column, cellElement, rowElement));
            } else {
              rowElement.appendChild(this.renderCell(data, column, cellElement, rowElement));
            }
          }
        }

        var cellElement = this.newCellElement();
        cellElement.classList.add("filler");
        rowElement.appendChild(cellElement);

        return rowElement;
      },

      renderCell: function (data, column, cellElement, rowElement) {
        return cellElement;
      },

      setTopSpacing: function (value) {
        this.topSpacing.firstChild.style.height = value + "px";
        this.topSpacing.firstChild.style.maxHeight = value + "px";
      },

      setBottomSpacing: function (value) {
        this.bottomSpacing.firstChild.style.height = value + "px";
        this.bottomSpacing.firstChild.style.maxHeight = value + "px";
      },

      initializeView: function () {
        this._super();
        this.renderHeader();
      }
    });

    table.Table.Header = widget.Component.construct({
      typeName: 'i-table-header',
      templateHtml: '<div class="i-table-header"><span class="caption"></span><i class="sort-arrow material-icons">sort</i>' +
      '<div class="input-wrapper"><input class="m-input" type="text"/></div></div>',
      templateSelectors: {
        sortArrow: "i.sort-arrow",
        caption: ".caption",
        inputWrapper: ".input-wrapper",
        input: ".input-wrapper > input"
      },

      defaults: {
        sortState: ''
      },

      include: widget.RippleEffect,

      input: {
        events: {
          input: [
            function(evt) {
              this.fire('change', evt)
            }
          ],
          keypress: [
            function(evt) {
              this.fire('keypress', evt)
            }
          ]
        }
      },
      events: {
        afterRender: [
          function () {
            this.caption.textContent = this.column.label;

            if (this.column.searchable) {
              this.inputWrapper.style.display = 'flex';
            }

            if (!this.column.sortable) {
              this.sortArrow.style.visibility = 'hidden';
            }
          }
        ]
      },
      sortArrow: {
        events: {
          click: [
            function (evt) {
              if (this.column.sortable) {

                this.sortStateChange = Date.now();

                if (this.sortState == 'up') {
                  this.sortState = 'down';
                  this.sortArrow.innerText = 'arrow_drop_down'
                } else if (this.sortState == 'down') {
                  this.sortState = '';
                  this.sortArrow.innerText = 'sort'
                } else {
                  this.sortState = 'up';
                  this.sortArrow.innerText = 'arrow_drop_up'
                }
                this.fire('sort', evt)
              }
            }
          ]
        }
      }
    });
  

    table.TableColumn = core.Class.construct({
      defaults: {
        label: "Column",
        width: 40,
        sortable: true,
        color: 'transparent',
        headStyle: {},
        rowStyle: {},
        cellRenderer: null,
        headerRenderer: null
      },

      initialize: function (options) {
        core.extend(true, this, options);
      }
    });


    return table;
  });   
});