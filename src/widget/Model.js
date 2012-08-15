(function(lib, undefined) {
    /*global lib*/
    "use strict";
    
    function Model(object, element) {
        if (this === lib.widget) {
            return new Model(object, element);
        }
        if (!lib.util.isObject(object)) {
            return;
        }
        
        this.__guid = lib.guid();
        this._bound = {};
        
        if (element && lib.dom.isTypeOf(element, lib.dom.ELEMENT_NODE)) {
            this._element = element;
            this._eventName = "__modelChange" + this.__guid;
        }
        
        for (var prop in object) {
            if (object.hasOwnProperty(prop)) {
                var propBindable;
                propBindable = this[prop] = this._element ?
                                            lib.util.Bindable(object[prop], this._element) :
                                            lib.util.Bindable(object[prop]);
                propBindable.name = prop;
                propBindable.model = this;
                propBindable.bind(dispatcher);
            }
        }
    }
    
    lib.extend(Model.prototype, {
        dispose: function dispose() {
            this.unbind();
            for (var i in this) {
                if (this[i] instanceof lib.util.Bindable) {
                    this[i].dispose();
                }
            }
        },
        
        bind: function bind(target) {
            if (!lib.util.isFunction(target)) {
                return;
            }
            
            var id = lib.guid(),
                bound = {
                    id: id,
                    target: target,
                    proxy: null
                };
            this._bound[id] = bound;
            
            if (this._element) {
                bound.proxy = lib.bind(function(event) {
                    lib.bind(callBound, this)(id, event.value, event.oldValue, event.property);
                }, this);
                lib.event.add(this._element, this._eventName, bound.proxy);
            }
        },
        
        unbind: function unbind(target) {
            var bound = this._bound;
            
            for (var i in bound) {
                if (bound.hasOwnProperty(i)) {
                    var specificTarget = (bound[i].target === target);
                    if (specificTarget || !target) {
                        if (this._element) {
                            lib.event.remove(this._element, this._eventName, this._bound[i].proxy);
                        }
                        delete bound[i];
                    }
                    
                    if (specificTarget) {
                        break;
                    }
                }
            }
        }
    });
    
    function dispatcher(value, oldValue) {
        /*jshint validthis:true*/
        var model = this.model;
        if (model._element) {
            lib.event.dispatch(model._element, model._eventName, { value: value, oldValue: oldValue, property: this.name });
        } else {
            callAllBound.call(model, value, oldValue, this.name);
        }
    }
    
    function callAllBound(value, oldValue, property) {
        /*jshint validthis:true*/
        for (var i in this._bound) {
            if (this._bound.hasOwnProperty(i)) {
                callBound.call(this, i, value, oldValue, property);
            }
        }
    }
    
    function callBound(id, value, oldValue, property) {
        /*jshint validthis:true*/
        var bound = this._bound[id];
        bound.target.call(this, value, oldValue, property);
    }
    
    lib.widget.Model = Model;
    
})(lib);
