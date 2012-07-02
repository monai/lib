(function(lib, undefined) {
    function Widget(element) {
        this.__guid = lib.guid();
        this.__bound = {};
        
        if (lib.dom.isTypeOf(element, lib.dom.ELEMENT_NODE | lib.dom.DOCUMENT_NODE) || element == lib.window) {
            this.element = element;
            this.element.__widgets = {};
            this.element.__widgets[lib.util.getType(this)] = this;
        }
    };
    
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
            args.shift();
            return this.apply(method, args);
        },
        
        apply: function apply(method, args) {
            var methodFunction;
            
            try {
                methodFunction = widget.__bound[method];
                return methodFunction.apply(widget, args);
            } catch (e) {
                throw new Error("method " + method + " isn't bound");
            }
        }
    });
    
    function WidgetFactory(widgetConstructor, bind) {
        this.widgetConstructor = widgetConstructor;
        this.items = [];
        this.length = 0;
        this.name = lib.util.getFunctionName(this.widgetConstructor);
    };
    
    lib.extend(WidgetFactory.prototype, {
        run: function run(elements, properties) {
            var widget;
            elements = lib.util.isArray(elements) ? lib.array.toArray(elements) : [elements];
            lib.array.forEach(elements, lib.bind(function(element) {
                widget = new this.widgetConstructor(element, properties);
                this.items.push(widget);
                this.length++;
            }, this));
            
            return widget;
        },
        
        create: function create(elementize, properties) {
            if (elementize !== true && !!elementize != false && arguments.length == 1) {
                properties = elementize;
                elementize = false;
            }
            
            var widget;
            if (elementize) {
                var element = lib.dom.create("<div>");
                widget = new this.widgetConstructor(element, properties);
            } else {
                widget = new this.widgetConstructor(null, properties);
            }
            return widget;
        },
        
        destroy: function destroy(widget) {
            for (var i = 0, l = this.items.length; i < l; i++) {
                if (widget && widget != this.items[i]) continue;
                
                widget.dispose();
                
                var type = lib.util.getType(widget);
                delete widget.element.__widgets[type];
                this.items.splice(i, 1);
                this.length--;
            }
        },
        
        item: function item(n) {
            return this.items[n] || null;
        },
        
        call: function call(element, method) {
            var args = lib.array.toArray(arguments);
            args.shift();
            args.shift();
            return this.apply(element, method, args);
        },
        
        apply: function apply(element, method, args) {
            var widget = lib.widget.get(element, this.name);
            return widget.apply(method, args);
        }
    });
    
    lib.widget = {
        Widget: Widget,
        
        create: function create(constructor, prototype) {
            lib.util.inherits(constructor, Widget);
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
