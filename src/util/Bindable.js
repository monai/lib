(function(lib, undefined) {
    function Bindable(value) {
        if (this == lib.util) return new Bindable(value);
        
        this.__guid = lib.guid();
        this._bound = [];
        
        this.value = value;
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
            
            lib.array.forEach(this._bound, lib.bind(function(callback) {
                if (lib.util.isArray(callback)) {
                    callback[0][callback[1]] = this.value;
                } else {
                    callback.call(this, this.value, oldValue);
                }
            }, this));
            
            return this;
        },
        
        bind: function bind(target, property) {
            if (target && typeof property == "string") {
                this._bound.push([target, property]);
            } else if (lib.util.isFunction(target)) {
                this._bound.push(target);
            }
        },
        
        unbind: function unbind(target, property) {
            if (target) {
                var bound = this._bound,
                    test;
                for (var i = 0, l = bound.length; i < l; i++) {
                    if (bound[i] === target || bound[i][0] === target && bound[i][1] === property) {
                        bound.splice(i, 1);
                        break;
                    }
                }
            } else {
                this._bound = [];
            }
        }
    });
    
    lib.util.Bindable = Bindable;
    
})(lib);
