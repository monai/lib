(function(lib, undefined) {
    lib.array = {
        toArray: function toArray(object) {
            var array = [];
            try {
                array = Array.prototype.slice.call(object, 0);
            } catch (e) {
                for (var i = 0, len = object.length; i < len; i++) array[i] = object[i];
            }
            return array;
        },
        
        inArray: function inArray(array, object) {
            for (var i = 0, len = array.length; i < len; i++) {
                if (array[i] === object) return true;
            }
            return false;
        },
        
        forEach: function forEach(array, callback, thisObject) {
            if (typeof callback != "function") throw new TypeError(callback + " is not a function");
            
            if ("forEach" in array) {
                array.forEach(callback, thisObject || lib.view);
            } else {
                for (var i = 0, len = array.length; i < len; i++) {
                    callback.call(thisObject || lib.view, array[i], i, array);
                }
            }
        },
        
        every: function every(array, callback, thisObject) {
            if (typeof callback != "function") throw new TypeError(callback + " is not a function");
            
            if ("every" in array) {
                return array.every(callback, thisObject || lib.view);
            } else {
                for (var i = 0, len = array.length; i < len; i++) {
                    if (i in array && !callback.call(thisObject || lib.view, array[i], i, array)) return false;
                }
                return true;
            }
        },
        
        some: function some(array, callback, thisObject) {
            if (typeof callback != "function") throw new TypeError(callback + " is not a function");
            
            if ("some" in array) {
                return array.some(callback, thisObject || lib.view);
            } else {
                for (var i = 0, len = array.length; i < len; i++) {
                    if (i in array && callback.call(thisObject || lib.view, array[i], i, array)) return true;
                }
                return false;
            }
        },
        
        filter: function filter(array, callback, thisObject) {
            if (typeof callback != "function") throw new TypeError(callback + " is not a function");
            
            if ("filter" in array) {
                return array.filter(callback, thisObject || lib.view);
            } else {
                var out = [];
                for (var i = 0, len = array.length; i < len; i++) {
                    if (i in array) {
                        if (callback.call(thisObject || lib.view, array[i], i, array)) out.push(array[i]);
                    }
                }
                return out;
            }
        },
        
        map: function map(array, callback, thisObject) {
            if (typeof callback != "function") throw new TypeError(callback + " is not a function");
            
            if ("map" in array) {
                return array.map(callback, thisObject || lib.view);
            } else {
                var len = array.length,
                    out = new Array(len);
                for (var i = 0; i < len; i++) {
                    if (i in array) out[i] = callback.call(thisObject || lib.view, array[i], i, array);
                }
                return out;
            }
        },
        
        reduce: function reduce(array, callback, initialValue) {
            if (typeof callback != "function") throw new TypeError(callback + " is not a function");
            
            if ("reduce" in array) {
                return array.reduce(callback, initialValue);
            } else {
                var len = array.length,
                    isUndefined = typeof initialValue == "undefined";
                
                if (len == 0 && isUndefined) {
                    throw new TypeError("Reduce of empty array with no initial value");
                }
                
                var i = 0,
                    out = (isUndefined) ? initialValue : array[i++];
                
                for (; i < len; i++) {
                    if (i in array) out = callback.call(lib.view, out, array[i], i, array);
                }
                return out;
            }
        },
        
        reduceRight: function reduceRight(array, callback, initialValue) {
            if (typeof callback != "function") throw new TypeError(callback + " is not a function");
            
            if ("reduceRight" in array) {
                return array.reduceRight(callback, initialValue);
            } else {
                var len = array.length,
                    isUndefined = typeof initialValue == "undefined";
                
                if (len == 0 && isUndefined) {
                    throw new TypeError("Reduce of empty array with no initial value");
                }
                
                var i = len - 1,
                    out = (isUndefined) ? initialValue : array[i--];
                
                for (; i >= 0; i--) {
                    if (i in array) out = callback.call(lib.view, out, array[i], i, array);
                }
                return out;
            }
        },
        
        equal: function equal(array) {
            var out = true,
                len = array.length;
            for (var i = 1, argsLen = arguments.length; i < argsLen; i++) {
                if (len != arguments[i].length) return false;
                for (var j = 0; j < len; j++) {
                    if (array[j] instanceof Array || arguments[i][j] instanceof Array) {
                        if (array[j] instanceof Array && arguments[i][j] instanceof Array) {
                            out = this.equal(array[j], arguments[i][j]);
                            if (!out) break;
                        } else {
                            return false;
                        }
                    } else {
                        out = (array[j] == arguments[i][j]);
                        if (!out) break;
                    }
                }
                if (!out) break;
            }
            return out;
        },
        
        subtract: function subtract(array) {
            var outPrev = array,
                outCurr = [],
                subtrahend = [];
            
            for (var i = 1, argsLen = arguments.length; i < argsLen; i++) {
                if (arguments[i] instanceof Array) {
                    for (var j = 0, len = arguments[i].length; j < len; j++) {
                        subtrahend.push(arguments[i][j]);
                    }
                } else {
                    subtrahend.push(arguments[i]);
                }
            }
            
            for (var i = 0, len = subtrahend.length; i < len; i++) {
                for (var j = 0, outLen = outPrev.length; j < outLen; j++) {
                    if (subtrahend[i] instanceof Array) {
                        if (!this.equal(outPrev[j], subtrahend[i])) {
                            outCurr.push(outPrev[j]);
                        }
                    } else {
                        if (outPrev[j] != subtrahend[i]) {
                            outCurr.push(outPrev[j]);
                        }
                    }
                }
                outPrev = outCurr;
                outCurr = [];
            }
            return outPrev;
        },
        
        intersect: function intersect(array) {
            var out = array;
            for (var i = 1, len = arguments.length; i < len; i++) {
                var tmp = this.subtract(array, arguments[i]);
                out = this.subtract(out, tmp);
            }
            return out;
        }
    };
})(lib);
