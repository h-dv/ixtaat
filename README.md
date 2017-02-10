# ixtaat component architecture

this is a small js framework with some smart tools to build a clean and simple component architecture.

It includes functionality for object inheritance, mixins, class manipulation and many other. 
The most important part of it is the Idea of linked Selectors. You can easily access 
DOM-Elements and Properties like simple JS-Properties without GC-Problems, without the complexity of shadow DOM 
or custom template languages. Just pure JS with some simple and smart tools.

## Base
the only Namespace used is Ixtaat. You can use different frameworks in Combination with it or
you can do something like 
~~~
var i = Ixtaat;
~~~
to prevent typing.

## Object Handling
### Class definition

~~~
var Foo = Ixtaat.define({
    
    defaults: {
        /**
          initialize Values for instance-Variables
        **/
    },
    
    //** Constructor
    initialize: function(options) {
        //...
    }
})
~~~

### Inheritance
~~~
var Bar = Foo.define({
    //** Constructor
    initialize: function(options) {
        //...
        this._super(options);
    }
})
~~~

### Mixins

~~~
var Mixin =Ixtaat.define({
    someFunction: function() {
        //...
    }
})

var Foo = Ixtaat.define({
    include: Mixin   
});

var b = new Foo();
b.someFunction();

~~~

## Widgets

Widget is the Base Class of a UI-Component. 
~~~
var CTest = Ixtaat.Widget.Component.define({
    templateHtml: '<div><div class="title"> </div> <a href="#"> </a></div>'
    templateSelectors: {
        title: '.title',
        link: 'a'
    }
})
~~~
this defines a small Component with a simple Html and accessors for title and link.
You can create a instance of this, render it to a Element and access the selectors. 
~~~
var c= new CTest()
c.render('main')
c.title.textContent = 'Hey Title';
c.link.href = 'https://www.h-dv.de';
~~~
You think there is GC-Trouble because of direct linking of DOM-Objects? No. 
The selectors are dynamic getters for a Stored Selector-String. 
When you access the property <link> or <title>, ixtaat will use the css selector 
and find the first Element that fits the rule, and returns the element. 
Raw-Access but no direct DOM Reference in Memory.  
Now you can set properties for the Elements in code:
~~~
var c= new CTest({
    title: {
        textContent : 'Hello '
    },
    link: {
        href : 'https://www.h-dv.de',
        target: '_blank',
        textContent : 'World!'
    }
});
~~~
and of course you can preset style too.
~~~
var c= new CTest({
    title: {
        style: {
            color: Ixtaat.Colors.blue,
            fontWeight: 700
        },
        textContent : 'Hello '
    },
    link: {
        style: {
            color: '#333',
        },
        href : 'https://www.h-dv.de',
        target: '_blank',
        textContent : 'World!'
    }
});
~~~

We should not forget event Handling. Events are assigend to DOM on render and 
removed on Component.close() automaticly.

~~~
var c= new CTest({
    title: {
        style: {
            color: Ixtaat.Colors.blue,
            fontWeight: 700
        },
        textContent : 'Hello ',
        
        events: {
            click: [
                function(evt){
                    if(this.link.style.display=='none') {
                        this.link.style.display='block';
                    } else {
                        this.link.style.display='none';
                    }
                }
            ]
        }
    },
    link: {
        style: {
            color: '#333',
        },
        href : 'https://www.h-dv.de',
        target: '_blank',
        textContent : 'World!'
    }
});
~~~

This is an early Version, you can use it but it is not complete. 
Any Comments and Hints are welcome.



## TODO
+ Add Dokumentation
+ Add Tests
+ create Base Components










