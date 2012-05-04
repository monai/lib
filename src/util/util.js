(function(lib, undefined) {
    lib.util = {
        getType: function getType(object) {
            if (object === null) { return "null"; }
            else if (Object.prototype.toString.call(object) === "[object Function]") { return "Function"; }
            else if (Object.prototype.toString.call(object) === "[object Array]") { return "Array"; }
            else if (typeof object == "object") return this.getFunctionName(object.constructor);
        },
        
        isFunction: function isFunction(object) {
            return this.getType(object) == "Function";
        },
        
        isArray: function isArray(object) {
            return this.getType(object) == "Array";
        },
        
        isObject: function isObject(object) {
            return this.getType(object) == "Object";
        },
        
        getFunctionName: function getFunctionName(func) {
            if (this.isFunction(func)) {
                var name = func.toString();
                if (/^function (\S+?)\(/.test(name)) return RegExp.$1;
            } else {
                return null;
            }
        },
        
        inherits: function inherits(constructor, superConstructor) {
            constructor.superConstructor = superConstructor;
            
            if (Object.create) {
                constructor.prototype = Object.create(superConstructor.prototype, {
                    constructor: {
                        value: constructor,
                        enumerable: false,
                        writable: true,
                        configurable: true
                    }
                });
            } else {
                function f() {};
                f.prototype = superConstructor.prototype;
                constructor.prototype = new f;
            }
        }
    };
})(lib);
