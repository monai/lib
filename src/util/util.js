(function(lib, undefined) {
    /*global lib*/
    "use strict";
    
    lib.util = {
        getType: function getType(object) {
            var op, string;
            op = Object.prototype;
            string = op.toString.call(object);
            if (object === null) {
                return "null";
            } else if (object === undefined) {
                return "undefined";
            } else if (object === true || object === false) {
                return "boolean";
            } else if (string === "[object Array]") {
                return "Array";
            } else if (string === "[object Arguments]" || !!(op.hasOwnProperty.call(object, "callee"))) {
                return "Arguments";
            } else if (string === "[object Function]") {
                return "Function";
            } else if (string === "[object String]") {
                return "String";
            } else if (string === "[object Number]") {
                return "Number";
            } else if (string === "[object Date]") {
                return "Date";
            } else if (string === "[object RegExp]") {
                return "RegExp";
            } else if (typeof object === "object") {
                return this.getConstructorName(object);
            }
        },
        
        isObject: function isObject(object) {
            return object === new Object(object);
        },
        
        isArray: function isArray(object) {
            return this.getType(object) === "Array";
        },
        
        isArguments: function isArguments(object) {
            return this.getType(object) === "Arguments";
        },
        
        isFunction: function isFunction(object) {
            return this.getType(object) === "Function";
        },
        
        isString: function isString(object) {
            return this.getType(object) === "String";
        },
        
        isNumber: function isNumber(object) {
            return this.getType(object) === "Number";
        },
        
        isDate: function isDate(object) {
            return this.getType(object) === "Date";
        },
        
        isRegExp: function isRegExp(object) {
            return this.getType(object) === "RegExp";
        },
        
        getFunctionName: function getFunctionName(func) {
            if (this.isFunction(func)) {
                var name = func.toString();
                if (/^function (\S+?)\(/m.test(name)) {
                    return RegExp.$1;
                }
            }
            return undefined;
        },
        
        getConstructorName: function getConstructorName(object) {
            if (object !== undefined && object.constructor) {
                var constructor, name;
                constructor = object.thisConstructor || object.constructor;
                name = this.getFunctionName(constructor);
                if (name === undefined) {
                    if (/\[object (\S+?)\]/.test(constructor.toString())) {
                        name = RegExp.$1;
                    }
                }
                return name;
            }
            return undefined;
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
                    },
                    
                    superConstructor: {
                        value: superConstructor,
                        enumerable: false,
                        writable: true,
                        configurable: true
                    }
                });
            } else {
                F.prototype = superConstructor.prototype;
                constructor.prototype = new F(constructor, superConstructor);
            }
        }
    };
    
    function F(thisConstructor, superConstructor) {
        this.thisConstructor = thisConstructor;
        this.superConstructor = superConstructor;
    }
})(lib);
