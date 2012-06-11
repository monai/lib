(function(lib, undefined) {
    function Bindable(value) {
        if (this == lib.util) return new Bindable(value);
        
        this.__guid = lib.guid();
        this._callbacks = [];
        
        this.value = value;
    };
    
    lib.extend(Bindable.prototype, {
        get: function get() {
            return this.value;
        },
        
        set: function set(value) {
            var oldValue = this.value;
            this.value = value;
            lib.array.forEach(this._callbacks, lib.bind(function(n) {
                n(this.value, oldValue);
            }, this));
            return this;
        },
        
        addListener: function addListener(callback) {
            if (!lib.util.isFunction(callback)) return;
            this._callbacks.push(callback);
        },
        
        removeListener: function removeListener(callback) {
            if (callback) {
                if (!lib.util.isFunction(callback)) return;
                var cb = this._callbacks;
                for (var i = 0, l = cb.length; i < l; i++) {
                    if (cb[i] === callback) {
                        cb.splice(i, 1);
                        break;
                    }
                }
            } else {
                this.callbacks = [];
            }
        }
    });
    
    lib.util.Bindable = Bindable;
    
})(lib);
