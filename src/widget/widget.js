(function(lib, undefined) {
    function Widget(element) {
        this.__bound = {};
        
        if (lib.dom.isTypeOf(element, lib.dom.ELEMENT_NODE)) {
            this.element = element;
            this.element.__widgets = {};
            this.element.__widgets[lib.util.getType(this)] = this;
        }
    };
    
    lib.extend(Widget.prototype, {
        bind: function bind(method) {
            this.__bound[method] = this[method];
        }
    });
    
    function WidgetRunner(widgetConstructor, bind) {
        this.widgetConstructor = widgetConstructor;
        this.items = [];
        this.length = 0;
        this.name = lib.util.getFunctionName(this.widgetConstructor);
    };
    
    lib.extend(WidgetRunner.prototype, {
        run: function run(elements) {
            elements = lib.util.isArray(elements) ? lib.array.toArray(elements) : [elements];
            lib.array.forEach(elements, lib.bind(function(element) {
                this.items.push(new this.widgetConstructor(element));
                this.length++;
            }, this));
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
            var widget = lib.widget.get(element, this.name),
                method = widget.__bound[method];
            if (lib.util.isFunction(method)) return method.apply(widget, args);
        }
    });
    
    lib.widget = {
        Widget: Widget,
        
        create: function create(constructor, prototype) {
            lib.util.inherits(constructor, Widget);
            lib.extend(constructor.prototype, prototype);
            return new WidgetRunner(constructor);
        },
        
        get: function get(element, name) {
            if (lib.dom.isTypeOf(element, lib.dom.ELEMENT_NODE) && element.__widgets) {
                name = (name instanceof WidgetRunner) ? name.name : name;
                return element.__widgets[name] || null;
            } else {
                return null;
            }
        }
    };
    
})(lib);
