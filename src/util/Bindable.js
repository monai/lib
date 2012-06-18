(function(lib, undefined) {
    function Bindable(value, element) {
        if (this == lib.util) return new Bindable(value, element);
        
        this.__guid = lib.guid();
        this._bound = {};
        
        if (arguments.length == 1 && lib.dom.isTypeOf(element, lib.dom.ELEMENT_NODE)) {
            element = value;
            value = undefined;
        }
        
        this.value = value;
        
        if (element) {
            this._element = element;
            this._eventName = "__bindableChange" + this.__guid;
            this._events = {};
        }
    };
    
    lib.extend(Bindable.prototype, {
        toString: function toString() {
            return "[object Bindable]";
        },
        
        valueOf: function valueOf() {
            return this.get();
        },
        
        get: function get() {
            return this.value;
        },
        
        set: function set(value) {
            var oldValue = this.value;
            this.value = value;
            
            if (this._element) {
                lib.event.dispatch(this._element, this._eventName, { value: this.value, oldValue: oldValue });
            } else {
                lib.bind(callAllBound, this)(this.value, oldValue);
            }
            
            return this;
        },
        
        bind: function bind(target, property) {
            var id = lib.guid(),
                bound = {
                    id: id,
                    target: null,
                    proxy: null
                };
            
            if (target && typeof property == "string") {
                bound.target = [target, property];
            } else if (lib.util.isFunction(target)) {
                bound.target = target;
            }
            this._bound[id] = bound;
            
            if (this._element) {
                bound.proxy = lib.bind(function(event) {
                    lib.bind(callBound, this)(id, event.value, event.oldValue);
                }, this);
                lib.event.add(this._element, this._eventName, bound.proxy);
            }
        },
        
        unbind: function unbind(target, property) {
            var bound = this._bound,
                test;
            
            for (var i in bound) {
                var bTarget = bound[i].target,
                    specificTarget = (bTarget === target
                                      || lib.util.isArray(bTarget)
                                         && bTarget[0] === target
                                         && bTarget[1] === property);
                
                if (specificTarget || !target) {
                    if (this._element) {
                        lib.event.remove(this._element, this._eventName, this._bound[i].proxy);
                    }
                    delete bound[i];
                }
                
                if (specificTarget) break;
            }
        }
    });
    
    function callAllBound(value, oldValue) {
        var cb = lib.bind(callBound, this);
        for (var i in this._bound) {
            cb(i, value, oldValue);
        }
    };
    
    function callBound(id, value, oldValue) {
        var bound = this._bound[id];
        if (lib.util.isArray(bound.target)) {
            bound.target[0][bound.target[1]] = value;
        } else {
            bound.target.call(this, value, oldValue);
        }
    };
    
    lib.util.Bindable = Bindable;
    
})(lib);
