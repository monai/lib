(function(lib, undefined) {
    function Model(object, element) {
        if (this == lib.widget) return new Model(object, element);
        if (!lib.util.isObject(object)) return;
        
        this.__guid = lib.guid();
        this._bound = [];
        
        if (element && lib.dom.isTypeOf(element, lib.dom.ELEMENT_NODE)) {
            this._element = element;
        }
        
        for (var prop in object) {
            var _this = this,
                propBindable = this[prop] = this._element
                                            ? lib.util.Bindable(object[prop], this._element)
                                            : lib.util.Bindable(object[prop]);
            propBindable.name = prop;
        }
    };
    
    lib.extend(Model.prototype, {
        bind: function bind(target) {
            
        },
        
        unbind: function unbind(target) {
            
        }
    });
    
    function callAllBound(value, oldValue, property) {
        
    };
    
    lib.widget.Model = Model;
    
})(lib);
