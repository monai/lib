n(lib, undefined) {
    /*global lib*/
    "use strict";
    
    function Widget(element) {
        /*jshint bitwise:false*/
        this.__guid = lib.guid();
        this.__bound = {};
        
        if (lib.dom.isTypeOf(element, lib.dom.ELEMENT_NODE | lib.dom.DOCUMENT_NODE) || element === lib.window) {
            this.element = element;
        }
    }
    
    lib.extend(Widget.prototype, {
        _bind: function _bind(method) {
            this.__bound[method] = this[method];
        },
        
        dispose: function dispose() {
            /* must be implemented in widget */
        },
        
        call: function call(method) {
            var args = lib.array.toArray(arguments);
            args.shift();
            return this.apply(method, args);
        },
        
        apply: function apply(method, args) {
            var methodFunction = this.__bound[method];
            if (methodFunction) {
                return methodFunction.apply(this, args);
            } else {
                throw new Error("method " + method + " is not bound");
            }
        }
    });
    
    function WidgetFactory(widgetConstructor) {
        this.widgetConstructor = widgetConstructor;
        this.items = [];
        this.length = 0;
        this.name = lib.util.getFunctionName(this.widgetConstructor);
    }
    
    lib.extend(WidgetFactory.prototype, {
        run: function run(elements, properties) {
            /*jshint bitwise:false*/
            var widget;
            if (lib.dom.isTypeOf(elements, lib.dom.ELEMENT_NODE | lib.dom.DOCUMENT_NODE) || elements === lib.window) {
                elements = [elements];
            } else if (elements) {
                elements = lib.array.toArray(elements);
            } else {
                elements = [];
            }
            lib.array.forEach(elements, lib.bind(function(element) {
                widget = new this.widgetConstructor(element, properties);
                this.elementize(widget, element);
                this.items.push(widget);
                this.length++;
            }, this));
            
            return widget;
        },
        
        create: function create(elementize, properties) {
            if (elementize !== true && elementize !== false && arguments.length === 1) {
                properties = elementize;
                elementize = false;
            }
            
            var widget;
            if (elementize) {
                var element = lib.dom.create("<div>");
                widget = new this.widgetConstructor(element, properties);
                this.elementize(widget, element);
            } else {
                widget = new this.widgetConstructor(null, properties);
            }
            this.items.push(widget);
            this.length++;
            return widget;
        },
        
        destroy: function destroy(widget) {
            for (var i = 0, l = this.items.length; i < l; i++) {
                if (widget === this.items[i]) {
                    widget.dispose();
                    var type = lib.util.getType(widget);
                    if (widget.element && widget.element.__widgets) {
                        delete widget.element.__widgets[type];
                    }
                    this.items.splice(i, 1);
                    this.length--;
                }
            }
        },
        
        elementize: function elementize(widget, element) {
            if (!widget.element.__widgets) {
                widget.element.__widgets = {};
            }
            widget.element.__widgets[this.name] = widget;
        },
        
        item: function item(n) {
            return this.items[n] || null;
        },
        
        call: function call(element, method) {
            var args = lib.array.toArray(arguments);
            args.shift();
            if (lib.util.isFunction(method)) {
                args.shift();
            } else {
                if (method) {
                    args.push(method);
                }
                method = null;
            }
            return this.apply(element, method, args);
        },
        
        apply: function apply(element, method, args) {
            var widget;
            if ("string" === typeof element && !method) {
                return this.widgetConstructor[element].apply(this, args);
            } else {
                widget = lib.widget.get(element, this.name);
                return widget.apply(method, args);
            }
        }
    });
    
    lib.widget = {
        Widget: Widget,
        
        create: function create(constructor, prototype) {
            if (1 === arguments.length && lib.util.isObject(constructor)) {
                prototype = constructor;
                constructor = prototype.constructor;
                delete prototype.constructor;
            }
            
            lib.util.inherits(constructor, Widget);
            lib.extend(constructor.prototype, lib.widget.helpers);
            lib.extend(constructor.prototype, prototype);
            return new WidgetFactory(constructor);
        },
        
        get: function get(element, name) {
            if (lib.dom.isTypeOf(element, lib.dom.ELEMENT_NODE) && element.__widgets) {
                name = (name instanceof WidgetFactory) ? name.name : name;
                return element.__widgets[name] || null;
            } else {
                return null;
            }
        }
    };
    
})(lib);
