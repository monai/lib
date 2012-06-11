(function(lib, undefined) {
    function Model(object, element) {
        if (this == lib.widget) return new Model(object, element);
        if (!lib.util.isObject(object)) return;
        
        this.__guid = lib.guid();
        
        if (element && lib.dom.isTypeOf(element, lib.dom.ELEMENT_NODE)) {
            this._element = element;
            this._eventName = "__widgetModelPropertyChange" + this.__guid;
            this._callbacks = {
                original: [],
                bound: []
            };
        }
        
        for (var prop in object) {
            var _this = this,
                bindableProp = this[prop] = lib.util.Bindable(object[prop]);
            bindableProp.name = prop;
            
            if (this._element) {
                bindableProp.addListener(lib.bind(function(val, old) {
                    var prop = this.name,
                        eventName = _this._eventName + prop;
                    lib.event.dispatch(_this._element, eventName, {
                        property: prop,
                        value: val,
                        oldValue: old
                    });
                }, bindableProp));
            }
        }
    };
    
    lib.extend(Model.prototype, {
        addListener: function addListener(prop, callback) {
            if (!lib.util.isFunction(callback)) return;
            if (this._element) {
                var eventName = this._eventName + prop,
                    bound = function(event) {
                        callback(event.value, event.oldValue);
                    };
                
                this._callbacks.original.push(callback);
                this._callbacks.bound.push(bound);
                
                lib.event.add(this._element, eventName, bound);
            } else {
                this[prop].addListener(callback);
            }
        },
        
        removeListener: function removeListener(prop, callback) {
            if (this._element) {
                var eventName = this._eventName + prop,
                    cb = this._callbacks,
                    bound;
                
                for (var i = 0, l = cb.original.length; i < l; i++) {
                    if (cb.original[i] === callback) {
                        lib.event.remove(this._element, eventName, cb.bound[i]);
                        cb.original.splice(i, 1);
                        cb.bound.splice(i, 1);
                        break;
                    }
                }
            } else {
                this[prop].removeListener(callback);
            }
        }
    });
    
    lib.widget.Model = Model;
    
})(lib);
