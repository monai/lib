(function(lib, undefined) {
    /*global lib*/
    "use strict";
    
    lib.klass = {
        create: function create(template) {
            var publicProperties = {},
                publicBoundMethods = {},
                mirrorKlass,
                klassPrototype,
                beforePropertyChangeCallbacks = [],
                propertyChangeCallbacks = [];
            
            function KlassConstructor() {
                this.constructor.apply(this, arguments);
            }
            function MirrorKlass() {}
            
            if (template.inherits) {
                lib.util.inherits(KlassConstructor, template.inherits);
                lib.util.inherits(MirrorKlass, template.inherits);
                KlassConstructor.prototype.superConstructor = template.inherits.prototype.constructor;
            }
            lib.extend(MirrorKlass.prototype, template["private"], template["public"]);
            mirrorKlass = new MirrorKlass();
            
            if (template["public"]) {
                for (var i in template["public"]) {
                    if (lib.util.isFunction(template["public"][i])) {
                        publicBoundMethods[i] = lib.bind(template["public"][i], mirrorKlass);
                    } else {
                        publicProperties[i] = template["public"][i];
                    }
                }
            }
            
            klassPrototype = {
                constructor: template.constructor,
                
                properties: lib.object.keys(publicProperties),
                
                __guid: lib.guid(),
                
                getProperty: function getProperty(name) {
                    return (lib.array.inArray(this.properties, name)) ? mirrorKlass[name] : undefined;
                },
                
                setProperty: function setProperty(name, value) {
                    var exists = lib.array.inArray(this.properties, name),
                        oldValue = (exists) ? mirrorKlass[name] : undefined;
                    
                    if (!(name in template["private"]) && !exists) {
                        this.properties.push(name);
                        exists = true;
                    }
                    
                    if (exists) {
                        var prevent = dispatchBeforePropertyChangeEvent(name, value, oldValue);
                        prevent = prevent !== false;
                        
                        if (prevent) {
                            mirrorKlass[name] = value;
                        }
                        dispatchPropertyChangeEvent(name, value, oldValue);
                        return mirrorKlass[name];
                    }
                    
                    return undefined;
                },
                
                onbeforepropertychange: function onbeforepropertychange(callback) {
                    if (lib.util.isFunction(callback)) {
                        beforePropertyChangeCallbacks.push(callback);
                    }
                },
                
                onpropertychange: function onpropertychange(callback) {
                    if (lib.util.isFunction(callback)) {
                        propertyChangeCallbacks.push(callback);
                    }
                }
            };
            lib.extend(KlassConstructor.prototype, publicBoundMethods, klassPrototype);
            
            function dispatchBeforePropertyChangeEvent(name, newValue, oldValue) {
                return dispatchEvent(beforePropertyChangeCallbacks, name, newValue, oldValue);
            }
            
            function dispatchPropertyChangeEvent(name, newValue, oldValue) {
                return dispatchEvent(propertyChangeCallbacks, name, newValue, oldValue);
            }
            
            function dispatchEvent(callbacks, name, newValue, oldValue) {
                /*jshint validthis:true*/
                var out = true;
                for (var i = 0; i < callbacks.length; i++) {
                    out = out && callbacks[i].apply(this, [name, newValue, oldValue]);
                }
                
                return out;
            }
            
            return KlassConstructor;
        }
    };
})(lib);
