(function(lib, undefined) {
    /*global lib*/
    "use strict";
    
    lib.array = {
        toArray: function toArray(object) {
            var array = [];
            try {
                array = Array.prototype.slice.call(object, 0);
            } catch (e) {
                for (var i = 0, len = object.length; i < len; i++) {
                    array[i] = object[i];
                }
            }
            return array;
        },
        
        indexOf: function indexOf(array, object, fromIndex) {
            fromIndex = fromIndex || 0;
            if ("indexOf" in Array.prototype) {
                return Array.prototype.indexOf.call(array, object, fromIndex);
            } else {
                for (var i = fromIndex, len = array.length; i < len; i++) {
                    var found = lib.util.isArray(object) ?
                                this.isEqual(array[i], object) : array[i] === object;
                    if (found) {
                        return i;
                    }
                }
                return -1;
            }
        },
        
        lastIndexOf: function lastIndexOf(array, object, fromIndex) {
            fromIndex = fromIndex || array.length;
            if ("lastIndexOf" in Array.prototype) {
                return Array.prototype.lastIndexOf.call(array, object, fromIndex);
            } else {
                for (var len = array.length, i = len - 1; i >= 0; i--) {
                    var found = lib.util.isArray(object) ?
                                this.isEqual(array[i], object) : array[i] === object;
                    if (found) {
                        return i;
                    }
                }
                return -1;
            }
        },
        
        inArray: function inArray(array, object) {
            return (this.indexOf(array, object) > -1) ? true : false;
        },
        
        forEach: function forEach(array, callback, thisObject) {
            if (typeof callback !== "function") {
                throw new TypeError(callback + " is not a function");
            }
            
            if ("forEach" in Array.prototype) {
                Array.prototype.forEach.call(array, callback, thisObject || lib.window);
            } else {
                for (var i = 0, len = array.length; i < len; i++) {
                    callback.call(thisObject || lib.window, array[i], i, array);
                }
            }
        },
        
        every: function every(array, callback, thisObject) {
            if (typeof callback !== "function") {
                throw new TypeError(callback + " is not a function");
            }
            
            if ("every" in Array.prototype) {
                return Array.prototype.every.call(array, callback, thisObject || lib.window);
            } else {
                for (var i = 0, len = array.length; i < len; i++) {
                    if (i in array && !callback.call(thisObject || lib.window, array[i], i, array)) {
                        return false;
                    }
                }
                return true;
            }
        },
        
        some: function some(array, callback, thisObject) {
            if (typeof callback !== "function") {
                throw new TypeError(callback + " is not a function");
            }
            
            if ("some" in Array.prototype) {
                return Array.prototype.some.call(array, callback, thisObject || lib.window);
            } else {
                for (var i = 0, len = array.length; i < len; i++) {
                    if (i in array && callback.call(thisObject || lib.window, array[i], i, array)) {
                        return true;
                    }
                }
                return false;
            }
        },
        
        filter: function filter(array, callback, thisObject) {
            if (typeof callback !== "function") {
                throw new TypeError(callback + " is not a function");
            }
            
            if ("filter" in Array.prototype) {
                return Array.prototype.filter.call(array, callback, thisObject || lib.window);
            } else {
                var out = [];
                for (var i = 0, len = array.length; i < len; i++) {
                    if (i in array) {
                        if (callback.call(thisObject || lib.window, array[i], i, array)) {
                            out.push(array[i]);
                        }
                    }
                }
                return out;
            }
        },
        
        map: function map(array, callback, thisObject) {
            if (typeof callback !== "function") {
                throw new TypeError(callback + " is not a function");
            }
            
            if ("map" in Array.prototype) {
                return Array.prototype.map.call(array, callback, thisObject || lib.window);
            } else {
                var len = array.length,
                    out = new Array(len);
                for (var i = 0; i < len; i++) {
                    if (i in array) {
                        out[i] = callback.call(thisObject || lib.window, array[i], i, array);
                    }
                }
                return out;
            }
        },
        
        reduce: function reduce(array, callback, initialValue) {
            if (typeof callback !== "function") {
                throw new TypeError(callback + " is not a function");
            }
            
            if ("reduce" in Array.prototype) {
                var args = initialValue ? [callback, initialValue] : [callback];
                return Array.prototype.reduce.apply(array, args);
            } else {
                var len = array.length,
                    isUndefined = typeof initialValue === "undefined";
                
                if (0 === len && isUndefined) {
                    throw new TypeError("Reduce of empty array with no initial value");
                }
                
                var i = 0,
                    out = (isUndefined) ? initialValue : array[i++];
                
                for (; i < len; i++) {
                    if (i in array) {
                        out = callback.call(lib.window, out, array[i], i, array);
                    }
                }
                return out;
            }
        },
        
        reduceRight: function reduceRight(array, callback, initialValue) {
            if (typeof callback !== "function") {
                throw new TypeError(callback + " is not a function");
            }
            
            if ("reduceRight" in Array.prototype) {
                var args = initialValue ? [callback, initialValue] : [callback];
                return Array.prototype.reduceRight.apply(array, args);
            } else {
                var len = array.length,
                    isUndefined = (typeof initialValue === "undefined");
                
                if (0 === len && isUndefined) {
                    throw new TypeError("Reduce of empty array with no initial value");
                }
                
                var i = len - 1,
                    out = (isUndefined) ? initialValue : array[i--];
                
                for (; i >= 0; i--) {
                    if (i in array) {
                        out = callback.call(lib.window, out, array[i], i, array);
                    }
                }
                return out;
            }
        },
        
        isEqual: function isEqual(array) {
            var out = true,
                len = array.length;
            for (var i = 1, argsLen = arguments.length; i < argsLen; i++) {
                if (len !== arguments[i].length) {
                    return false;
                }
                for (var j = 0; j < len; j++) {
                    if (array[j] instanceof Array || arguments[i][j] instanceof Array) {
                        if (array[j] instanceof Array && arguments[i][j] instanceof Array) {
                            out = this.isEqual(array[j], arguments[i][j]);
                            if (!out) {
                                break;
                            }
                        } else {
                            return false;
                        }
                    } else {
                        out = (array[j] === arguments[i][j]);
                        if (!out) {
                            break;
                        }
                    }
                }
                if (!out) {
                    break;
                }
            }
            return out;
        },
        
        flatten: function flatten(array) {
            return this.reduce(array, function(prev, curr) {
                return prev.concat(curr);
            });
        },
        
        unique: function unique(array) {
            return lib.array.reduce(array, lib.bind(function(prev, curr) {
                if (!this.inArray(prev, curr)) {
                    prev.push(curr);
                }
                return prev;
            },this), []);
        },
        
        union: function union() {
            return this.unique(this.flatten(this.toArray(arguments)));
        },
        
        difference: function difference(array) {
            var rest = this.unique(this.flatten(this.toArray(arguments).slice(1)));
            return this.filter(array, lib.bind(function(value) {
                return !this.inArray(rest, value);
            }, this));
        },
        
        intersection: function intersection(array) {
            var rest = this.toArray(arguments).slice(1);
            return this.filter(this.unique(array), lib.bind(function(item) {
                return this.every(rest, lib.bind(function(other) {
                    return this.indexOf(other, item) >= 0;
                }, this));
            }, this));
        }
    };
})(lib);
