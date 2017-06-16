﻿ // TEST
"use strict";

loader.require(['ixtaat/core', 'ixtaat/base', 'ixtaat/widget', 'ixtaat/material', 'ixtaat/table'], function(core, base, widget, material, table) {

var startApp = function() {
  var tab = form.addItem({
    typeName: 'm-tab-container'
  });

  tab.addTab(
  {
    typeName: 'm-card',
    element: {
      className: "w-grid-column-6",
    },
    header: {
      textContent: "Header",
    },
    footer: {
      textContent: "Footer",
    }
  });

  tab.addTab({
    typeName: 'm-card',
    element: {
      className: "w-grid-column-12",
    },
    header: {
      textContent: "Header2",
    },
    footer: {
      textContent: "Footer2",
    }

  });

  tab.addTab({
    caption : 'uncloseable',
    closeable: false,
    typeName: 'm-card',
    element: {
      className: "w-grid-column-12",
    },
    header: {
      textContent: "Header32132",
    },
    footer: {
      textContent: "Footer3",
      style: {
      }
    }

  });



}

var form = core.create({

  renderIn: "main",

  typeName: "m-viewport",

  events : {
    ready: [
      function() {
      var ovl = new material.Overlay({
        itemContainer: {
          style : {
            flex: 0,
          }
        },
        items: [
          {
            typeName: 'm-card',
            itemContainer : {
              style : {
                padding: 0,
                flex: 1 ,
              }
            },
            header: {
              textContent : "Login"
            },
            items : [
            {
              typeName: 'm-form',
              itemContainer: {
                style: {
                  margin: "0 1em 0 1em"
                }
              },
              items: [
                {
                  typeName: 'm-fieldset',
                  items: [
                    {
                      typeName: 'm-field',
                      name: "mandant ",
                      labelText: 'Mandant',
                      events: {
                        ready: [
                          function () {
                            this.input.focus();
                          }
                        ]
                      },
                    },
                    {
                      typeName: 'm-field',
                      name: "userName",
                      labelText: 'UserName',
                    },
                    {
                      typeName: 'm-field',
                      name: "password",
                      labelText: 'Password',
                      input: {
                        type: "password",
                        events: {
                          click: [
                            function () {
                              core.info("password input test!");
                            }
                          ]
                        }
                      }
                    },
                    {
                      typeName: 'm-checkbox',
                      name: "rememberme",
                      labelText: 'RememberMe',
                    },
                    {
                      typeName: 'm-formfooter',
                      items: [
                        {
                          typeName: 'm-button',
                          element: {
                            events: {
                              click:  [function () {
                                core.info("login clicked!");
                              }]
                            },
                            textContent: 'login'
                          }
                        },
                        {
                          typeName: 'm-button',
                          element: {
                            textContent: 'cancel',
                            events: {
                              click: [
                                function () {
                                  ovl.close('m-transition-fadeout',500);
                                  startApp();
                                }
                              ]
                            }
                          }
                        }]
                    }
                    /*                {
                     typeName: 'm-textfield',
                     name: "text",
                     labelText: 'Text',
                     },

                     */
                  ]
                },
              ]
            }
          ]}
        ]
      });

      ovl.show();

    }
      ]
  },
  header :{
    textContent: ".:: ixtaat component system ::.",
    style: {
      fontSize: "1.3em",
      fontWeight: 500
    },
  },
  items: [
  ]



});

});
