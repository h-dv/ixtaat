﻿// TEST
"use strict";
loader.require(['ixtaat/core', 'ixtaat/base', 'ixtaat/widget', 'ixtaat/material', 'ixtaat/table'], function (core, base, widget, material, table) {

  var d = [];
  for (var i = 0; i < 100000; i++) {
    d[i] = { idx: i, value: "text" + i, date: new Date() }
  }

  var p = new base.MemoryDataProvider({
    data: d
  });

  var form = core.create({

    renderIn: "main",

    typeName: "m-viewport",

    events: {
      ready: [
        function () {
        }
      ]
    },
    header: {
      textContent: ".:: ixtaat component system ::.",

      style: {
        "font-weight": 700
      },
    },
    itemContainer: {
      style: {
        flexDirection: 'row',
        flexWrap: 'wrap'
      }
    },
    items: [
      {
        typeName: 'm-card',
        header: {
          textContent: "Header",
        },
        footer: {
          textContent: "Footer",
        },
        items: [
          {
            typeName: 'i-table',
            dataProvider: p,
            columns: [
              {
                label: "*", width: 150,
                cellRenderer: function (data, column, cellElement, rowElement) {
                  cellElement.innerText = rowElement.dataset.id;
                  return cellElement;
                },
                cell: {
                  style: {
                    backgroundColor: "#f0f0f0"
                  }
                }
              },
              {
                label: "Nr", width: 100, property: 'idx',
                searchable: true,
                header: {
                  element: {
                    style: {
                      backgroundColor: "#707070",
                      color: "#f0f0f0"
                    }
                  },
                },
              },
              { label: "Datum", width: 350, property: 'date' },
              { label: "Testtext", width: 150, property: 'value' }
            ],
          }
        ]
      },
      /*
          {
            typeName: 'm-card',
            element: {
              className: "w-grid-column-6",
            },
            header: {
              textContent: "Header2",
            },
            footer: {
              textContent: "Footer2",
            },
            items: [
              {
                typeName: 'i-list',
                dataProvider: p,
                renderRow: function (data, element) {
                  element.innerHTML = "Index " + data.idx + "<br/>" +
                    "The max-height property in CSS is used to set the maximum height of a specified element." +
                    " Authors may use any of the length values as long as they are a positive value. max-height " +
                    "overrides height, but min-height always overrides max-height.";
                  return element;
                }
              }
            ]
          }*/
    ]


  });

})