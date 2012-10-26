/*! lib - A JavaScript Library - http://github.com/monai/lib | MIT license */

(function(window, undefined) {
    "use strict";
    
    var log = function log() {
        if (window.console && window.console.log && window.console.log.apply) {
            window.console.log.apply(window.console, arguments);
        } else {
            if (!log.output) {
                log.output = [];
            }
            log.output.push(lib.array.toArray(arguments).join(", "));
            window.clearTimeout(log.time);
            log.time = window.setTimeout(function() {
                var t = log.output.join("\r\n");
                log.output = [];
                alert(t);
            }, 1000);
        }
        return arguments[0];
    },
    
    inspect = function inspect(object) {
        var o = [];
        for (var i in object) {
            if (Object.prototype.hasOwnProperty.call(object, i)) {
                o.push(i + ": " + object[i]);
            }
        }
        return o.join("\r\n");
    },
    
    lib = {
        log: log,
        
        inspect: inspect,
        
        window: window,
        
        document: window && window.document,
        
        isReady: false,
        
        isDOMReady: false,
        
        ready: function ready(callback, dom) {
            if (callback === undefined) {
                lib.isReady = true;
                lib.event.dispatch(lib.document, "libReady");
                lib.event.remove(lib.document, "libReady");
            } else if (typeof callback === "function") {
                if (!lib.isReady && !dom) {
                    lib.event.add(lib.document, "libReady", lib.bind(callback, lib.window));
                } else if (!lib.isDOMReady && dom) {
                    lib.event.add(lib.document, "DOMReady", lib.bind(callback, lib.window));
                } else {
                    callback();
                }
            }
        },
        
        extend: function extend(target) {
            for (var i, k = 0, len = arguments.length; ++k < len;) {
                for (i in arguments[k]) {
                    if (arguments[k].hasOwnProperty(i)) {
                        target[i] = arguments[k][i];
                    }
                }
            }
            return target;
        },
        
        bind: function bind(method, context) {
            if ("bind" in method) {
                return method.bind(context);
            } else {
                return function bound() {
                    return method.apply(context, arguments);
                };
            }
        },
        
        guid: function guid(object) {
            if (!lib.guid.id) {
                lib.guid.id = 1;
            }
            if (!object) {
                return ++lib.guid.id;
            }
            if (!object.__guid) {
                object.__guid = lib.guid.id++;
            }
            return object.__guid;
        }
    };
    
    window["lib"] = lib;
    window["log"] = log;
})(window);

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

(function(lib, undefined) {
    /*global lib*/
    "use strict";
    
    function Benchmark(name, start) {
        if (this === lib.util) {
            return new Benchmark(name, start);
        }
        
        this.name = name;
        this.startTime = null;
        this.endTime = null;
        if (start || typeof start === "undefined") {
            this.start();
        }
    }
    
    lib.extend(Benchmark.prototype, {
        start: function start() {
            this.startTime = (new Date()).getTime();
        },
        
        stop: function stop() {
            this.endTime = (new Date()).getTime();
            return this.endTime - this.startTime;
        },
        
        log: function log() {
            var t = this.stop();
            lib.log(this.name + ": " + t + "ms");
        }
    });
    
    lib.util.Benchmark = Benchmark;
    
})(lib);

(function(lib, undefined) {
    /*global lib*/
    "use strict";
    
    lib.object = {
        keys: function keys(object) {
            var ks;
            if ("keys" in Object) {
                return Object.keys(object);
            } else {
                ks = [];
                for (var i in object) {
                    if (object.hasOwnProperty(i)) {
                        ks.push(i);
                    }
                }
                return ks;
            }
        },
        
        createFromTemplate: function createFromTemplate(template, object) {
            object = (object) ? object : {};
            var path = template.split(".");
            
            (function iterate(parent, path) {
                if (!parent[path[0]]) {
                    parent[path[0]] = {};
                }
                if (path.length > 1) {
                    iterate(parent[path[0]], path.splice(1));
                }
            })(object, path);
            
            return object;
        },
        
        subtract: function subtract(minuend, subtrahend) {
            var difference = {};
            for (var i in minuend) {
                if (typeof subtrahend[i] === "undefined") {
                    difference[i] = minuend[i];
                }
            }
            return difference;
        }
    };
})(lib);

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

(function(lib, undefined) {
    /*global lib*/
    "use strict";
    
    lib.string = {
        trim: function trim(str) {
            /*jshint curly:false*/
            
            if ("trim" in String) {
                return String.trim(str);
            } else {
                str = str.replace(/^\s\s*/, "");
                var i = str.length;
                while (/\s/.test(str.charAt(--i)));
                return str.slice(0, i + 1);
            }
        },
        
        trimLeft: function trimLeft(str) {
            if ("trimLeft" in String) {
                return String.trimLeft(str);
            } else {
                return str.replace(/^\s\s*/, "");
            }
        },
        
        trimRight: function trimRight(str) {
            /*jshint curly:false*/
            
            if ("trimRight" in String) {
                return String.trimRight(str);
            } else {
                var i = str.length;
                while (/\s/.test(str.charAt(--i)));
                return str.slice(0, i + 1);
            }
        },
        
        padding: function padding(str, pad, length) {
            if (typeof str !== "string") {
                str = str.toString();
            }
            
            var absLength = Math.abs(length);
            if (str.length >= absLength) {
                return str;
            }
            
            var prepend = (absLength === length) ? true : false,
                out = new Array(absLength - str.length);
            
            for (var i = 0, len = out.length; i < len; i++) {
                out[i] = pad;
            }
            
            if (prepend) {
                out.push(str);
            } else {
                out.unshift(str);
            }
            return out.join("");
        },
        
        format: function format(str, args) {
            /*jshint unused:false*/
            return str.replace(/\{(\d+)\}/g, function(s, n) {
                return args[parseInt(n, 10)];
            });
        },
        
        camelToDash: function camelToDash(str) {
            return str.replace(/[A-Z]/g, function(match) { return "-" + match.toLowerCase(); });
        },
        
        dashToCamel: function dashToCamer(str) {
            return str.replace(/-(.)/g, function(match) { return match[1].toUpperCase(); });
        },
        
        capitalize: function capitalize(str) {
            return str.charAt(0).toUpperCase() + str.slice(1);
        }
    };
})(lib);

(function(lib, undefined) {
    /*global lib*/
    "use strict";
    
    lib.date = {
        parseISOString: function parseISOString(str) {
            var parsed = Date.parse(str);
            if (!isNaN(parsed)) {
                return new Date(parsed);
            }
            
            var match = str.match(/\d+/g),
                date = new Date(match[0], parseInt(match[1], 10) - 1, match[2], match[3], match[4], match[5], match[6]),
                offset = (new Date()).getTimezoneOffset(),
                offsetAbs = Math.abs(offset),
                offsetSign = (offsetAbs === offset) ? -1 : 1,
                offsetHours = (offsetAbs - (offsetAbs % 60)) / 60,
                offsetMinutes = offsetAbs - offsetHours * 60;
            date.setHours(date.getHours() + offsetHours * offsetSign);
            date.setMinutes(date.getMinutes() + offsetMinutes * offsetSign);
            return date;
        },
        
        toISOString: function toISOString(date) {
            /*jshint laxcomma:true*/
            if ("toISOString" in date) {
                return date.toISOString();
            } else {
                return [date.getUTCFullYear(), "-"
                      , lib.util.padding(date.getUTCMonth() + 1, 0, 2), "-"
                      , lib.util.padding(date.getUTCDate(), 0, 2), "T"
                      , lib.util.padding(date.getUTCHours(), 0, 2), ":"
                      , lib.util.padding(date.getUTCMinutes(), 0, 2), ":"
                      , lib.util.padding(date.getUTCSeconds(), 0, 2), "."
                      , lib.util.padding(date.getUTCMilliseconds(), 0, 3), "Z"].join("");
            }
        }
    };
})(lib);

/*! JSON v3.2.3 | http://bestiejs.github.com/json3 | Copyright 2012, Kit Cambridge | http://kit.mit-license.org */
(function () {
  /*jshint eqeqeq:false*/
  // Convenience aliases.
  var getClass = {}.toString, isProperty, forEach, undef;

  // Detect the `define` function exposed by asynchronous module loaders and set
  // up the internal `JSON3` namespace. The strict equality check for `define`
  // is necessary for compatibility with the RequireJS optimizer (`r.js`).
  var isLoader = typeof define === "function" && define.amd, JSON3 = typeof exports == "object" && exports;

  // A JSON source string used to test the native `stringify` and `parse`
  // implementations.
  var serialized = '{"A":[1,true,false,null,"\\u0000\\b\\n\\f\\r\\t"]}';

  // Feature tests to determine whether the native `JSON.stringify` and `parse`
  // implementations are spec-compliant. Based on work by Ken Snyder.
  var stringifySupported, Escapes, toPaddedString, quote, serialize;
  var parseSupported, fromCharCode, Unescapes, abort, lex, get, walk, update, Index, Source;

  // Test the `Date#getUTC*` methods. Based on work by @Yaffle.
  var value = new Date(-3509827334573292), floor, Months, getDay;

  try {
    // The `getUTCFullYear`, `Month`, and `Date` methods return nonsensical
    // results for certain dates in Opera >= 10.53.
    value = value.getUTCFullYear() == -109252 && value.getUTCMonth() === 0 && value.getUTCDate() == 1 &&
      // Safari < 2.0.2 stores the internal millisecond time value correctly,
      // but clips the values returned by the date methods to the range of
      // signed 32-bit integers ([-2 ** 31, 2 ** 31 - 1]).
      value.getUTCHours() == 10 && value.getUTCMinutes() == 37 && value.getUTCSeconds() == 6 && value.getUTCMilliseconds() == 708;
  } catch (exception) {}

  // Define additional utility methods if the `Date` methods are buggy.
  if (!value) {
    floor = Math.floor;
    // A mapping between the months of the year and the number of days between
    // January 1st and the first of the respective month.
    Months = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
    // Internal: Calculates the number of days between the Unix epoch and the
    // first day of the given month.
    getDay = function (year, month) {
      return Months[month] + 365 * (year - 1970) + floor((year - 1969 + (month = +(month > 1))) / 4) - floor((year - 1901 + month) / 100) + floor((year - 1601 + month) / 400);
    };
  }

  // Export JSON 3 for asynchronous module loaders, CommonJS environments, web
  // browsers, and JavaScript engines. Credits: Oyvind Sean Kinsey.
  if (isLoader || JSON3) {
    if (isLoader) {
      // Export for asynchronous module loaders. The `JSON3` namespace is
      // redefined because module loaders do not provide the `exports` object.
      define("json", (JSON3 = {}));
    }
    if (typeof JSON == "object" && JSON) {
      // Delegate to the native `stringify` and `parse` implementations in
      // asynchronous module loaders and CommonJS environments.
      JSON3.stringify = JSON.stringify;
      JSON3.parse = JSON.parse;
    }
  } else {
    // Export for browsers and JavaScript engines.
    JSON3 = this.JSON || (this.JSON = {});
  }

  // Test `JSON.stringify`.
  if ((stringifySupported = typeof JSON3.stringify == "function" && !getDay)) {
    // A test function object with a custom `toJSON` method.
    (value = function () {
      return 1;
    }).toJSON = value;
    try {
      stringifySupported =
        // Firefox 3.1b1 and b2 serialize string, number, and boolean
        // primitives as object literals.
        JSON3.stringify(0) === "0" &&
        // FF 3.1b1, b2, and JSON 2 serialize wrapped primitives as object
        // literals.
        JSON3.stringify(new Number()) === "0" &&
        JSON3.stringify(new String()) == '""' &&
        // FF 3.1b1, 2 throw an error if the value is `null`, `undefined`, or
        // does not define a canonical JSON representation (this applies to
        // objects with `toJSON` properties as well, *unless* they are nested
        // within an object or array).
        JSON3.stringify(getClass) === undef &&
        // IE 8 serializes `undefined` as `"undefined"`. Safari 5.1.2 and FF
        // 3.1b3 pass this test.
        JSON3.stringify(undef) === undef &&
        // Safari 5.1.2 and FF 3.1b3 throw `Error`s and `TypeError`s,
        // respectively, if the value is omitted entirely.
        JSON3.stringify() === undef &&
        // FF 3.1b1, 2 throw an error if the given value is not a number,
        // string, array, object, Boolean, or `null` literal. This applies to
        // objects with custom `toJSON` methods as well, unless they are nested
        // inside object or array literals. YUI 3.0.0b1 ignores custom `toJSON`
        // methods entirely.
        JSON3.stringify(value) === "1" &&
        JSON3.stringify([value]) == "[1]" &&
        // Prototype <= 1.6.1 serializes `[undefined]` as `"[]"` instead of
        // `"[null]"`.
        JSON3.stringify([undef]) == "[null]" &&
        // YUI 3.0.0b1 fails to serialize `null` literals.
        JSON3.stringify(null) == "null" &&
        // FF 3.1b1, 2 halts serialization if an array contains a function:
        // `[1, true, getClass, 1]` serializes as "[1,true,],". These versions
        // of Firefox also allow trailing commas in JSON objects and arrays.
        // FF 3.1b3 elides non-JSON values from objects and arrays, unless they
        // define custom `toJSON` methods.
        JSON3.stringify([undef, getClass, null]) == "[null,null,null]" &&
        // Simple serialization test. FF 3.1b1 uses Unicode escape sequences
        // where character escape codes are expected (e.g., `\b` => `\u0008`).
        JSON3.stringify({ "result": [value, true, false, null, "\0\b\n\f\r\t"] }) == serialized &&
        // FF 3.1b1 and b2 ignore the `filter` and `width` arguments.
        JSON3.stringify(null, value) === "1" &&
        JSON3.stringify([1, 2], null, 1) == "[\n 1,\n 2\n]" &&
        // JSON 2, Prototype <= 1.7, and older WebKit builds incorrectly
        // serialize extended years.
        JSON3.stringify(new Date(-8.64e15)) == '"-271821-04-20T00:00:00.000Z"' &&
        // The milliseconds are optional in ES 5, but required in 5.1.
        JSON3.stringify(new Date(8.64e15)) == '"+275760-09-13T00:00:00.000Z"' &&
        // Firefox <= 11.0 incorrectly serializes years prior to 0 as negative
        // four-digit years instead of six-digit years. Credits: @Yaffle.
        JSON3.stringify(new Date(-621987552e5)) == '"-000001-01-01T00:00:00.000Z"' &&
        // Safari <= 5.1.5 and Opera >= 10.53 incorrectly serialize millisecond
        // values less than 1000. Credits: @Yaffle.
        JSON3.stringify(new Date(-1)) == '"1969-12-31T23:59:59.999Z"';
    } catch (exception) {
      stringifySupported = false;
    }
  }

  // Test `JSON.parse`.
  if (typeof JSON3.parse == "function") {
    try {
      // FF 3.1b1, b2 will throw an exception if a bare literal is provided.
      // Conforming implementations should also coerce the initial argument to
      // a string prior to parsing.
      if (JSON3.parse("0") === 0 && !JSON3.parse(false)) {
        // Simple parsing test.
        value = JSON3.parse(serialized);
        if ((parseSupported = value.A.length == 5 && value.A[0] == 1)) {
          try {
            // Safari <= 5.1.2 and FF 3.1b1 allow unescaped tabs in strings.
            parseSupported = !JSON3.parse('"\t"');
          } catch (exception) {}
          if (parseSupported) {
            try {
              // FF 4.0 and 4.0.1 allow leading `+` signs, and leading and
              // trailing decimal points. FF 4.0, 4.0.1, and IE 9 also allow
              // certain octal literals.
              parseSupported = JSON3.parse("01") != 1;
            } catch (exception) {}
          }
        }
      }
    } catch (exception) {
      parseSupported = false;
    }
  }

  // Clean up the variables used for the feature tests.
  value = serialized = null;

  if (!stringifySupported || !parseSupported) {
    // Internal: Determines if a property is a direct property of the given
    // object. Delegates to the native `Object#hasOwnProperty` method.
    if (!(isProperty = {}.hasOwnProperty)) {
      isProperty = function (property) {
        var members = {}, constructor;
        if ((members.__proto__ = null, members.__proto__ = {
          // The *proto* property cannot be set multiple times in recent
          // versions of Firefox and SeaMonkey.
          "toString": 1
        }, members).toString != getClass) {
          // Safari <= 2.0.3 doesn't implement `Object#hasOwnProperty`, but
          // supports the mutable *proto* property.
          isProperty = function (property) {
            // Capture and break the object's prototype chain (see section 8.6.2
            // of the ES 5.1 spec). The parenthesized expression prevents an
            // unsafe transformation by the Closure Compiler.
            var original = this.__proto__, result = property in (this.__proto__ = null, this);
            // Restore the original prototype chain.
            this.__proto__ = original;
            return result;
          };
        } else {
          // Capture a reference to the top-level `Object` constructor.
          constructor = members.constructor;
          // Use the `constructor` property to simulate `Object#hasOwnProperty` in
          // other environments.
          isProperty = function (property) {
            var parent = (this.constructor || constructor).prototype;
            return property in this && !(property in parent && this[property] === parent[property]);
          };
        }
        members = null;
        return isProperty.call(this, property);
      };
    }

    // Internal: Normalizes the `for...in` iteration algorithm across
    // environments. Each enumerated key is yielded to a `callback` function.
    forEach = function (object, callback) {
      var size = 0, Properties, members, property, forEach;

      // Tests for bugs in the current environment's `for...in` algorithm. The
      // `valueOf` property inherits the non-enumerable flag from
      // `Object.prototype` in older versions of IE, Netscape, and Mozilla.
      (Properties = function () {
        this.valueOf = 0;
      }).prototype.valueOf = 0;

      // Iterate over a new instance of the `Properties` class.
      members = new Properties();
      for (property in members) {
        // Ignore all properties inherited from `Object.prototype`.
        if (isProperty.call(members, property)) {
          size++;
        }
      }
      Properties = members = null;

      // Normalize the iteration algorithm.
      if (!size) {
        // A list of non-enumerable properties inherited from `Object.prototype`.
        members = ["valueOf", "toString", "toLocaleString", "propertyIsEnumerable", "isPrototypeOf", "hasOwnProperty", "constructor"];
        // IE <= 8, Mozilla 1.0, and Netscape 6.2 ignore shadowed non-enumerable
        // properties.
        forEach = function (object, callback) {
          var isFunction = getClass.call(object) == "[object Function]", property, length;
          for (property in object) {
            // Gecko <= 1.0 enumerates the `prototype` property of functions under
            // certain conditions; IE does not.
            if (!(isFunction && property == "prototype") && isProperty.call(object, property)) {
              callback(property);
            }
          }
          // Manually invoke the callback for each non-enumerable property.
          for (length = members.length; property = members[--length]; isProperty.call(object, property) && callback(property));
        };
      } else if (size == 2) {
        // Safari <= 2.0.4 enumerates shadowed properties twice.
        forEach = function (object, callback) {
          // Create a set of iterated properties.
          var members = {}, isFunction = getClass.call(object) == "[object Function]", property;
          for (property in object) {
            // Store each property name to prevent double enumeration. The
            // `prototype` property of functions is not enumerated due to cross-
            // environment inconsistencies.
            if (!(isFunction && property == "prototype") && !isProperty.call(members, property) && (members[property] = 1) && isProperty.call(object, property)) {
              callback(property);
            }
          }
        };
      } else {
        // No bugs detected; use the standard `for...in` algorithm.
        forEach = function (object, callback) {
          var isFunction = getClass.call(object) == "[object Function]", property, isConstructor;
          for (property in object) {
            if (!(isFunction && property == "prototype") && isProperty.call(object, property) && !(isConstructor = property === "constructor")) {
              callback(property);
            }
          }
          // Manually invoke the callback for the `constructor` property due to
          // cross-environment inconsistencies.
          if (isConstructor || isProperty.call(object, (property = "constructor"))) {
            callback(property);
          }
        };
      }
      return forEach(object, callback);
    };

    // Public: Serializes a JavaScript `value` as a JSON string. The optional
    // `filter` argument may specify either a function that alters how object and
    // array members are serialized, or an array of strings and numbers that
    // indicates which properties should be serialized. The optional `width`
    // argument may be either a string or number that specifies the indentation
    // level of the output.
    if (!stringifySupported) {
      // Internal: A map of control characters and their escaped equivalents.
      Escapes = {
        "\\": "\\\\",
        '"': '\\"',
        "\b": "\\b",
        "\f": "\\f",
        "\n": "\\n",
        "\r": "\\r",
        "\t": "\\t"
      };

      // Internal: Converts `value` into a zero-padded string such that its
      // length is at least equal to `width`. The `width` must be <= 6.
      toPaddedString = function (width, value) {
        // The `|| 0` expression is necessary to work around a bug in
        // Opera <= 7.54u2 where `0 == -0`, but `String(-0) !== "0"`.
        return ("000000" + (value || 0)).slice(-width);
      };

      // Internal: Double-quotes a string `value`, replacing all ASCII control
      // characters (characters with code unit values between 0 and 31) with
      // their escaped equivalents. This is an implementation of the
      // `Quote(value)` operation defined in ES 5.1 section 15.12.3.
      quote = function (value) {
        var result = '"', index = 0, symbol;
        for (; symbol = value.charAt(index); index++) {
          // Escape the reverse solidus, double quote, backspace, form feed, line
          // feed, carriage return, and tab characters.
          result += '\\"\b\f\n\r\t'.indexOf(symbol) > -1 ? Escapes[symbol] :
            // If the character is a control character, append its Unicode escape
            // sequence; otherwise, append the character as-is.
            symbol < " " ? "\\u00" + toPaddedString(2, symbol.charCodeAt(0).toString(16)) : symbol;
        }
        return result + '"';
      };

      // Internal: Recursively serializes an object. Implements the
      // `Str(key, holder)`, `JO(value)`, and `JA(value)` operations.
      serialize = function (property, object, callback, properties, whitespace, indentation, stack) {
        var value = object[property], className, year, month, date, time, hours, minutes, seconds, milliseconds, results, element, index, length, prefix, any;
        if (typeof value == "object" && value) {
          className = getClass.call(value);
          if (className == "[object Date]" && !isProperty.call(value, "toJSON")) {
            if (value > -1 / 0 && value < 1 / 0) {
              // Dates are serialized according to the `Date#toJSON` method
              // specified in ES 5.1 section 15.9.5.44. See section 15.9.1.15
              // for the ISO 8601 date time string format.
              if (getDay) {
                // Manually compute the year, month, date, hours, minutes,
                // seconds, and milliseconds if the `getUTC*` methods are
                // buggy. Adapted from @Yaffle's `date-shim` project.
                date = floor(value / 864e5);
                for (year = floor(date / 365.2425) + 1970 - 1; getDay(year + 1, 0) <= date; year++);
                for (month = floor((date - getDay(year, 0)) / 30.42); getDay(year, month + 1) <= date; month++);
                date = 1 + date - getDay(year, month);
                // The `time` value specifies the time within the day (see ES
                // 5.1 section 15.9.1.2). The formula `(A % B + B) % B` is used
                // to compute `A modulo B`, as the `%` operator does not
                // correspond to the `modulo` operation for negative numbers.
                time = (value % 864e5 + 864e5) % 864e5;
                // The hours, minutes, seconds, and milliseconds are obtained by
                // decomposing the time within the day. See section 15.9.1.10.
                hours = floor(time / 36e5) % 24;
                minutes = floor(time / 6e4) % 60;
                seconds = floor(time / 1e3) % 60;
                milliseconds = time % 1e3;
              } else {
                year = value.getUTCFullYear();
                month = value.getUTCMonth();
                date = value.getUTCDate();
                hours = value.getUTCHours();
                minutes = value.getUTCMinutes();
                seconds = value.getUTCSeconds();
                milliseconds = value.getUTCMilliseconds();
              }
              // Serialize extended years correctly.
              value = (year <= 0 || year >= 1e4 ? (year < 0 ? "-" : "+") + toPaddedString(6, year < 0 ? -year : year) : toPaddedString(4, year)) +
                "-" + toPaddedString(2, month + 1) + "-" + toPaddedString(2, date) +
                // Months, dates, hours, minutes, and seconds should have two
                // digits; milliseconds should have three.
                "T" + toPaddedString(2, hours) + ":" + toPaddedString(2, minutes) + ":" + toPaddedString(2, seconds) +
                // Milliseconds are optional in ES 5.0, but required in 5.1.
                "." + toPaddedString(3, milliseconds) + "Z";
            } else {
              value = null;
            }
          } else if (typeof value.toJSON == "function" && ((className != "[object Number]" && className != "[object String]" && className != "[object Array]") || isProperty.call(value, "toJSON"))) {
            // Prototype <= 1.6.1 adds non-standard `toJSON` methods to the
            // `Number`, `String`, `Date`, and `Array` prototypes. JSON 3
            // ignores all `toJSON` methods on these objects unless they are
            // defined directly on an instance.
            value = value.toJSON(property);
          }
        }
        if (callback) {
          // If a replacement function was provided, call it to obtain the value
          // for serialization.
          value = callback.call(object, property, value);
        }
        if (value === null) {
          return "null";
        }
        className = getClass.call(value);
        if (className == "[object Boolean]") {
          // Booleans are represented literally.
          return "" + value;
        } else if (className == "[object Number]") {
          // JSON numbers must be finite. `Infinity` and `NaN` are serialized as
          // `"null"`.
          return value > -1 / 0 && value < 1 / 0 ? "" + value : "null";
        } else if (className == "[object String]") {
          // Strings are double-quoted and escaped.
          return quote(value);
        }
        // Recursively serialize objects and arrays.
        if (typeof value == "object") {
          // Check for cyclic structures. This is a linear search; performance
          // is inversely proportional to the number of unique nested objects.
          for (length = stack.length; length--;) {
            if (stack[length] === value) {
              // Cyclic structures cannot be serialized by `JSON.stringify`.
              throw TypeError();
            }
          }
          // Add the object to the stack of traversed objects.
          stack.push(value);
          results = [];
          // Save the current indentation level and indent one additional level.
          prefix = indentation;
          indentation += whitespace;
          if (className == "[object Array]") {
            // Recursively serialize array elements.
            for (index = 0, length = value.length; index < length; any || (any = true), index++) {
              element = serialize(index, value, callback, properties, whitespace, indentation, stack);
              results.push(element === undef ? "null" : element);
            }
            return any ? (whitespace ? "[\n" + indentation + results.join(",\n" + indentation) + "\n" + prefix + "]" : ("[" + results.join(",") + "]")) : "[]";
          } else {
            // Recursively serialize object members. Members are selected from
            // either a user-specified list of property names, or the object
            // itself.
            forEach(properties || value, function (property) {
              var element = serialize(property, value, callback, properties, whitespace, indentation, stack);
              if (element !== undef) {
                // According to ES 5.1 section 15.12.3: "If `gap` {whitespace}
                // is not the empty string, let `member` {quote(property) + ":"}
                // be the concatenation of `member` and the `space` character."
                // The "`space` character" refers to the literal space
                // character, not the `space` {width} argument provided to
                // `JSON.stringify`.
                results.push(quote(property) + ":" + (whitespace ? " " : "") + element);
              }
              any || (any = true);
            });
            return any ? (whitespace ? "{\n" + indentation + results.join(",\n" + indentation) + "\n" + prefix + "}" : ("{" + results.join(",") + "}")) : "{}";
          }
          // Remove the object from the traversed object stack.
          stack.pop();
        }
      };

      // Public: `JSON.stringify`. See ES 5.1 section 15.12.3.
      JSON3.stringify = function (source, filter, width) {
        var whitespace, callback, properties, index, length, value;
        if (typeof filter == "function" || typeof filter == "object" && filter) {
          if (getClass.call(filter) == "[object Function]") {
            callback = filter;
          } else if (getClass.call(filter) == "[object Array]") {
            // Convert the property names array into a makeshift set.
            properties = {};
            for (index = 0, length = filter.length; index < length; value = filter[index++], ((getClass.call(value) == "[object String]" || getClass.call(value) == "[object Number]") && (properties[value] = 1)));
          }
        }
        if (width) {
          if (getClass.call(width) == "[object Number]") {
            // Convert the `width` to an integer and create a string containing
            // `width` number of space characters.
            if ((width -= width % 1) > 0) {
              for (whitespace = "", width > 10 && (width = 10); whitespace.length < width; whitespace += " ");
            }
          } else if (getClass.call(width) == "[object String]") {
            whitespace = width.length <= 10 ? width : width.slice(0, 10);
          }
        }
        // Opera <= 7.54u2 discards the values associated with empty string keys
        // (`""`) only if they are used directly within an object member list
        // (e.g., `!("" in { "": 1})`).
        return serialize("", (value = {}, value[""] = source, value), callback, properties, whitespace, "", []);
      };
    }

    // Public: Parses a JSON source string.
    if (!parseSupported) {
      fromCharCode = String.fromCharCode;
      // Internal: A map of escaped control characters and their unescaped
      // equivalents.
      Unescapes = {
        "\\": "\\",
        '"': '"',
        "/": "/",
        "b": "\b",
        "t": "\t",
        "n": "\n",
        "f": "\f",
        "r": "\r"
      };

      // Internal: Resets the parser state and throws a `SyntaxError`.
      abort = function() {
        Index = Source = null;
        throw SyntaxError();
      };

      // Internal: Returns the next token, or `"$"` if the parser has reached
      // the end of the source string. A token may be a string, number, `null`
      // literal, or Boolean literal.
      lex = function () {
        var source = Source, length = source.length, symbol, value, begin, position, sign;
        while (Index < length) {
          symbol = source.charAt(Index);
          if ("\t\r\n ".indexOf(symbol) > -1) {
            // Skip whitespace tokens, including tabs, carriage returns, line
            // feeds, and space characters.
            Index++;
          } else if ("{}[]:,".indexOf(symbol) > -1) {
            // Parse a punctuator token at the current position.
            Index++;
            return symbol;
          } else if (symbol == '"') {
            // Advance to the next character and parse a JSON string at the
            // current position. String tokens are prefixed with the sentinel
            // `@` character to distinguish them from punctuators.
            for (value = "@", Index++; Index < length;) {
              symbol = source.charAt(Index);
              if (symbol < " ") {
                // Unescaped ASCII control characters are not permitted.
                abort();
              } else if (symbol == "\\") {
                // Parse escaped JSON control characters, `"`, `\`, `/`, and
                // Unicode escape sequences.
                symbol = source.charAt(++Index);
                if ('\\"/btnfr'.indexOf(symbol) > -1) {
                  // Revive escaped control characters.
                  value += Unescapes[symbol];
                  Index++;
                } else if (symbol == "u") {
                  // Advance to the first character of the escape sequence.
                  begin = ++Index;
                  // Validate the Unicode escape sequence.
                  for (position = Index + 4; Index < position; Index++) {
                    symbol = source.charAt(Index);
                    // A valid sequence comprises four hexdigits that form a
                    // single hexadecimal value.
                    if (!(symbol >= "0" && symbol <= "9" || symbol >= "a" && symbol <= "f" || symbol >= "A" && symbol <= "F")) {
                      // Invalid Unicode escape sequence.
                      abort();
                    }
                  }
                  // Revive the escaped character.
                  value += fromCharCode("0x" + source.slice(begin, Index));
                } else {
                  // Invalid escape sequence.
                  abort();
                }
              } else {
                if (symbol == '"') {
                  // An unescaped double-quote character marks the end of the
                  // string.
                  break;
                }
                // Append the original character as-is.
                value += symbol;
                Index++;
              }
            }
            if (source.charAt(Index) == '"') {
              Index++;
              // Return the revived string.
              return value;
            }
            // Unterminated string.
            abort();
          } else {
            // Parse numbers and literals.
            begin = Index;
            // Advance the scanner's position past the sign, if one is
            // specified.
            if (symbol == "-") {
              sign = true;
              symbol = source.charAt(++Index);
            }
            // Parse an integer or floating-point value.
            if (symbol >= "0" && symbol <= "9") {
              // Leading zeroes are interpreted as octal literals.
              if (symbol == "0" && (symbol = source.charAt(Index + 1), symbol >= "0" && symbol <= "9")) {
                // Illegal octal literal.
                abort();
              }
              sign = false;
              // Parse the integer component.
              for (; Index < length && (symbol = source.charAt(Index), symbol >= "0" && symbol <= "9"); Index++);
              // Floats cannot contain a leading decimal point; however, this
              // case is already accounted for by the parser.
              if (source.charAt(Index) == ".") {
                position = ++Index;
                // Parse the decimal component.
                for (; position < length && (symbol = source.charAt(position), symbol >= "0" && symbol <= "9"); position++);
                if (position == Index) {
                  // Illegal trailing decimal.
                  abort();
                }
                Index = position;
              }
              // Parse exponents.
              symbol = source.charAt(Index);
              if (symbol == "e" || symbol == "E") {
                // Skip past the sign following the exponent, if one is
                // specified.
                symbol = source.charAt(++Index);
                if (symbol == "+" || symbol == "-") {
                  Index++;
                }
                // Parse the exponential component.
                for (position = Index; position < length && (symbol = source.charAt(position), symbol >= "0" && symbol <= "9"); position++);
                if (position == Index) {
                  // Illegal empty exponent.
                  abort();
                }
                Index = position;
              }
              // Coerce the parsed value to a JavaScript number.
              return +source.slice(begin, Index);
            }
            // A negative sign may only precede numbers.
            if (sign) {
              abort();
            }
            // `true`, `false`, and `null` literals.
            if (source.slice(Index, Index + 4) == "true") {
              Index += 4;
              return true;
            } else if (source.slice(Index, Index + 5) == "false") {
              Index += 5;
              return false;
            } else if (source.slice(Index, Index + 4) == "null") {
              Index += 4;
              return null;
            }
            // Unrecognized token.
            abort();
          }
        }
        // Return the sentinel `$` character if the parser has reached the end
        // of the source string.
        return "$";
      };

      // Internal: Parses a JSON `value` token.
      get = function (value) {
        var results, any, key;
        if (value == "$") {
          // Unexpected end of input.
          abort();
        }
        if (typeof value == "string") {
          if (value.charAt(0) == "@") {
            // Remove the sentinel `@` character.
            return value.slice(1);
          }
          // Parse object and array literals.
          if (value == "[") {
            // Parses a JSON array, returning a new JavaScript array.
            results = [];
            for (;; any || (any = true)) {
              value = lex();
              // A closing square bracket marks the end of the array literal.
              if (value == "]") {
                break;
              }
              // If the array literal contains elements, the current token
              // should be a comma separating the previous element from the
              // next.
              if (any) {
                if (value == ",") {
                  value = lex();
                  if (value == "]") {
                    // Unexpected trailing `,` in array literal.
                    abort();
                  }
                } else {
                  // A `,` must separate each array element.
                  abort();
                }
              }
              // Elisions and leading commas are not permitted.
              if (value == ",") {
                abort();
              }
              results.push(get(value));
            }
            return results;
          } else if (value == "{") {
            // Parses a JSON object, returning a new JavaScript object.
            results = {};
            for (;; any || (any = true)) {
              value = lex();
              // A closing curly brace marks the end of the object literal.
              if (value == "}") {
                break;
              }
              // If the object literal contains members, the current token
              // should be a comma separator.
              if (any) {
                if (value == ",") {
                  value = lex();
                  if (value == "}") {
                    // Unexpected trailing `,` in object literal.
                    abort();
                  }
                } else {
                  // A `,` must separate each object member.
                  abort();
                }
              }
              // Leading commas are not permitted, object property names must be
              // double-quoted strings, and a `:` must separate each property
              // name and value.
              if (value == "," || typeof value != "string" || value.charAt(0) != "@" || lex() != ":") {
                abort();
              }
              results[value.slice(1)] = get(lex());
            }
            return results;
          }
          // Unexpected token encountered.
          abort();
        }
        return value;
      };

      // Internal: Updates a traversed object member.
      update = function(source, property, callback) {
        var element = walk(source, property, callback);
        if (element === undef) {
          delete source[property];
        } else {
          source[property] = element;
        }
      };

      // Internal: Recursively traverses a parsed JSON object, invoking the
      // `callback` function for each value. This is an implementation of the
      // `Walk(holder, name)` operation defined in ES 5.1 section 15.12.2.
      walk = function (source, property, callback) {
        var value = source[property], length;
        if (typeof value == "object" && value) {
          if (getClass.call(value) == "[object Array]") {
            for (length = value.length; length--;) {
              update(value, length, callback);
            }
          } else {
            // `forEach` can't be used to traverse an array in Opera <= 8.54,
            // as `Object#hasOwnProperty` returns `false` for array indices
            // (e.g., `![1, 2, 3].hasOwnProperty("0")`).
            forEach(value, function (property) {
              update(value, property, callback);
            });
          }
        }
        return callback.call(source, property, value);
      };

      // Public: `JSON.parse`. See ES 5.1 section 15.12.2.
      JSON3.parse = function (source, callback) {
        Index = 0;
        Source = source;
        var result = get(lex());
        // If a JSON string contains multiple tokens, it is invalid.
        if (lex() != "$") {
          abort();
        }
        // Reset the parser state.
        Index = Source = null;
        return callback && getClass.call(callback) == "[object Function]" ? walk((value = {}, value[""] = result, value), "", callback) : result;
      };
    }
  }
}).call(lib);

(function(lib, undefined) {
    /*global lib*/
    "use strict";
    
    lib.dom = {
        byId: function byId(id) {
            return lib.document.getElementById(id);
        },
        
        byTag: function byTag(name, element) {
            var elems = (element || lib.document).getElementsByTagName(name);
            return lib.dom.NodeList(elems);
        },
        
        byQuery: function byQuery(query, element) {
            return (element || lib.document).querySelector(query);
        },
        
        byQueryAll: function byQueryAll(query, element) {
            var elems = (element || lib.document).querySelectorAll(query);
            return lib.dom.NodeList(elems);
        },
        
        byClass: function byClass(klass, tag, element) {
            var i, elements, nodeName, returnElements,
                classes, classesToCheck, xhtmlNamespace, namespaceResolver, node, match;
            
            if (typeof tag === "object" && typeof element === "undefined") {
                element = tag;
                tag = undefined;
            }
            
            if (lib.document.getElementsByClassName) {
                elements = (element || lib.document).getElementsByClassName(klass);
                nodeName = tag && tag.toUpperCase();
                returnElements = [];
                for (i = 0; i < elements.length; i++) {
                    if (nodeName && nodeName !== elements[i].nodeName) {
                        continue;
                    }
                    returnElements.push(elements[i]);
                }
                
                return lib.dom.NodeList(returnElements);
            } else {
                tag = tag || "*";
                element = element || lib.document;
                
                if (lib.document.evaluate) {
                    classes = klass.split(" ");
                    classesToCheck = "";
                    xhtmlNamespace = "http://www.w3.org/1999/xhtml";
                    namespaceResolver = (lib.document.documentElement.namespaceURI === xhtmlNamespace) ?
                                            xhtmlNamespace : null;
                    returnElements = [];
                    
                    for (i = 0; i < classes.length; i++) {
                        classesToCheck += "[contains(concat(' ', @class, ' '), ' " + classes[i] + " ')]";
                    }
                    
                    try {
                        elements = lib.document.evaluate(".//" + tag + classesToCheck, element, namespaceResolver, 0, null);
                    } catch (e) {
                        elements = lib.document.evaluate(".//" + tag + classesToCheck, element, null, 0, null);
                    }
                    
                    /*jshint boss:true*/
                    while (node = elements.iterateNext()) {
                        returnElements.push(node);
                    }
                    
                    return lib.dom.NodeList(returnElements);
                } else {
                    classes = klass.split(" ");
                    classesToCheck = [];
                    elements = (tag === "*" && element.all) ? element.all : element.getElementsByTagName(tag);
                    returnElements = [];
                    
                    for (i = 0; i < classes.length; i++) {
                        classesToCheck.push(new RegExp("(^|\\s)" + classes[i] + "(\\s|$)"));
                    }
                    
                    for (i = 0; i < elements.length; i++) {
                        match = false;
                        for (var j = 0; j < classesToCheck.length; j++){
                            match = classesToCheck[j].test(elements[i].className);
                            if (!match) {
                                break;
                            }
                        }
                        if (match) {
                            returnElements.push(elements[i]);
                        }
                    }
                    
                    return lib.dom.NodeList(returnElements);
                }
            }
        },
        
        parent: function parent(withElement, element, klass, name) {
            /*jshint boss:true*/
            
            if ("boolean" !== typeof withElement) {
                name = klass;
                klass = element;
                element = withElement;
                withElement = false;
            }
            
            name = name && name.toUpperCase();
            
            do {
                if (!withElement) {
                    withElement = true;
                    continue;
                }
                
                if (klass && !this.hasClass(element, klass) || name && name !== element.nodeName) {
                    continue;
                } else {
                    break;
                }
            } while (element = element.parentNode);
            return element;
        },
        
        isChild: function isChild(element, parent) {
            while ((element = element.parentNode)) {
                if (element === parent) {
                    return true;
                }
            }
            return false;
        },
        
        prev: function prev(element, klass, name) {
            /*jshint curly:false*/
            
            name = name && name.toUpperCase();
            
            while ((element = element.previousSibling) &&
                   (element.nodeType !== 1 ||
                   klass && !this.hasClass(element, klass) ||
                   name && name !== element.nodeName));
            
            return element;
        },
        
        next: function next(element, klass, name) {
            /*jshint curly:false*/
            
            name = name && name.toUpperCase();
            
            while ((element = element.nextSibling) &&
                   (element.nodeType !== 1 ||
                   klass && !this.hasClass(element, klass) ||
                   name && name !== element.nodeName));
            
            return element;
        },
        
        create: function create(html) {
            var d = lib.document.createElement("div"), element;
            d.innerHTML = html;
            element = d.firstChild;
            d = null;
            return this.remove(element);
        },
        
        remove: function remove(element) {
            var p = this.parent(element);
            return p && p.removeChild(element);
        },
        
        before: function before(element, ref) {
            var p = this.parent(ref);
            return p && p.insertBefore(element, ref);
        },
        
        after: function after(element, ref) {
            var p = this.parent(ref);
            return p && p.insertBefore(element, ref.nextSibling);
        },
        
        hasClass: function hasClass(element, klass) {
            return (element.classList && element.classList.contains) ?
                    element.classList.contains(klass) :
                    new RegExp("(^|\\s)" + klass + "(\\s|$)").test(element.className);
        },
        
        addClass: function addClass(element, klass) {
            if (!this.hasClass(element, klass)) {
                if (element.classList && element.classList.add) {
                    element.classList.add(klass);
                } else {
                    element.className += (element.className ? " " : "") + klass;
                }
            }
            return element;
        },
        
        removeClass: function removeClass(element, klass) {
            if (this.hasClass(element, klass)) {
                if (element.classList && element.classList.remove) {
                    element.classList.remove(klass);
                } else {
                    element.className = element.className.replace(new RegExp("(^|\\s)" + klass + "(\\s|$)"), "$2");
                }
            }
            return element;
        },
        
        toggleClass: function toggleClass(element, klass) {
            if (element.classList && element.classList.toggle) {
                element.classList.toggle(klass);
            } else {
                if (this.hasClass(element, klass)) {
                    return this.removeClass(element, klass);
                } else {
                    return this.addClass(element, klass);
                }
            }
        },
        
        getStyle: function getStyle() {
            return this.style.get.apply(this, arguments);
        },
        
        style: {
            get: function get(element, property, pseudoElement) {
                var value = null, inline = false;
                if (lib.window && lib.window.getComputedStyle) {
                    value = lib.window.getComputedStyle(element, pseudoElement || null)[property];
                } else if (element.currentStyle) {
                    value = element.currentStyle[property];
                } else {
                    value = element.style[property];
                    inline = true;
                }
                
                if (!value && !inline) {
                    return element.style[property];
                } else {
                    return value;
                }
            },
            
            set: function set(element, style) {
                var rule, ruleProp;
                for (rule in style) {
                    if (style.hasOwnProperty(rule)) {
                        ruleProp = lib.string.dashToCamel(rule);
                        element.style[ruleProp] = style[rule];
                    }
                }
            }
        },
        
        ELEMENT_NODE: 1,
        ATTRIBUTE_NODE: 2,
        TEXT_NODE: 4,
        CDATA_SECTION_NODE: 8,
        ENTITY_REFERENCE_NODE: 16,
        ENTITY_NODE: 32,
        PROCESSING_INSTRUCTION_NODE: 64,
        COMMENT_NODE: 128,
        DOCUMENT_NODE: 256,
        DOCUMENT_TYPE_NODE: 512,
        DOCUMENT_FRAGMENT_NODE: 1024,
        NOTATION_NODE: 2048,
        
        isDOMNode: function isDOMNode(element) {
            var type = element && element.nodeType;
            return type && element.nodeType > 0 && element.nodeType < 13;
        },
        
        isTypeOf: function isTypeOf(element, type) {
            /*jshint bitwise:false*/
            
            if (!this.isDOMNode(element)) {
                return;
            }
            for (var i = 0, len = nodeTypesMap.length; i < len; i++) {
                if (element.nodeType === nodeTypesMap[i][0] && (type & nodeTypesMap[i][1])) {
                    return true;
                }
            }
            return false;
        },
        
        dataset: {
            get: function get(element, key) {
                if (lib.util.isArray(key)) {
                    var values = {};
                    lib.array.forEach(key, function(key) {
                        values[key] = lib.dom.dataset.get(element, key);
                    });
                    return values;
                }
                
                if (element.dataset) {
                    return element.dataset[key];
                } else {
                    key = lib.string.camelToDash(key);
                    return element.getAttribute("data-" + key);
                }
            },
            
            set: function set(element, key, value) {
                if (element.dataset) {
                    element.dataset[key] = value;
                } else {
                    key = lib.string.camelToDash(key);
                    element.setAttribute("data-" + key, value || "");
                }
            },
            
            remove: function remove(element, key) {
                if (element.dataset) {
                    delete element.dataset[key];
                } else {
                    key = lib.string.camelToDash(key);
                    element.removeAttribute("data-" + key);
                }
            }
        }
    };
    
    var nodeTypesMap = [
        [1, 1],
        [2, 2],
        [3, 4],
        [4, 8],
        [5, 16],
        [6, 32],
        [7, 64],
        [8, 128],
        [9, 256],
        [10, 512],
        [11, 1024],
        [12, 2048]
    ];
})(lib);

(function(lib, undefined) {
    /*global lib*/
    "use strict";
    
    function NodeList(elements) {
        /*jshint bitwise:false*/
        if (this === lib.dom) {
            return new NodeList(elements);
        }
        
        if (!elements) {
            return;
        }
        
        if (lib.dom.isTypeOf(elements, lib.dom.ELEMENT_NODE | lib.dom.DOCUMENT_NODE)) {
            this.push(elements);
        } else if (elements instanceof NodeList) {
            return elements;
        } else {
            elements = lib.array.toArray(elements);
            lib.array.forEach(elements, lib.bind(function(element) {
                if (lib.dom.isTypeOf(element, lib.dom.ELEMENT_NODE | lib.dom.DOCUMENT_NODE)) {
                    this.push(element);
                }
            }, this));
        }
    }
    
    lib.util.inherits(NodeList, Array);
    
    lib.extend(NodeList.prototype, {
        toString: function toString() {
            return this.join(", ");
        },
        
        valueOf: function valueOf() {
            return this;
        },
        
        item: function item(index) {
            return this[index];
        },
        
        /* array extensions */
        concat: function concat() {
            var args = lib.array.toArray(arguments);
            lib.array.forEach(args, lib.bind(function(arg) {
                lib.array.forEach(arg, lib.bind(function(elem) {
                    this.push(elem);
                }, this));
            }, this));
        },
        
        slice: function slice() {
            return new NodeList(Array.prototype.slice.apply(this, arguments));
        },
        
        toArray: function toArray() {
            return lib.array.toArray(this);
        },
        
        indexOf: function indexOf(object, fromIndex) {
            return lib.array.indexOf(this, object, fromIndex);
        },
        
        lastIndexOf: function lastIndexOf(object, fromIndex) {
            return lib.array.lastIndexOf(this, object, fromIndex);
        },
        
        inArray: function inArray(object) {
            return lib.array.inArray(this, object);
        },
        
        forEach: function forEach(callback, thisObject) {
            lib.array.forEach(this, callback, thisObject);
        },
        
        every: function every(callback, thisObject) {
            return lib.array.every(this, callback, thisObject);
        },
        
        some: function some(callback, thisObject) {
            return lib.array.some(this, callback, thisObject);
        },
        
        filter: function filter(callback, thisObject) {
            return new NodeList(lib.array.filter(this, callback, thisObject));
        },
        
        map: function map(callback, thisObject) {
            return new NodeList(lib.array.map(this, callback, thisObject));
        },
        
        reduce: function reduce(callback, initialValue) {
            return lib.array.reduce(this, callback, initialValue);
        },
        
        reduceRight: function reduceRight(callback, initialValue) {
            return lib.array.reduceRight(this, callback, initialValue);
        },
        
        /* dom helpers */
        byTag: function byTag(tag) {
            var out = new NodeList();
            this.forEach(function(elem) {
                out.concat(lib.dom.byTag(tag, elem));
            });
            return out;
        },
        
        byQuery: function byQuery(query) {
            var out = null;
            this.forEach(function(elem) {
                if (!out) {
                    out = lib.dom.byQuery(query, elem);
                }
            });
            return out;
        },
        
        byQueryAll: function byQueryAll(query) {
            var out = new NodeList();
            this.forEach(function(elem) {
                out.concat(lib.dom.byQueryAll(query, elem));
            });
            return out;
        },
        
        byClass: function byClass(klass, tag) {
            var out = new NodeList();
            this.forEach(function(elem) {
                out.concat(lib.dom.byClass(klass, tag, elem));
            });
            return out;
        },
        
        find: function find(klass, tag) {
            var nodeName, out;
            out = this;
            if (klass) {
                out = out.filter(function(elem) {
                    return lib.dom.hasClass(elem, klass);
                });
            }
            if (tag) {
                nodeName = tag && tag.toUpperCase();
                out = out.filter(function(elem) {
                    return nodeName === elem.nodeName;
                });
            }
            return out;
        }
    });
        
    lib.dom.NodeList = NodeList;
})(lib);

(function(lib, undefined) {
    /*global lib*/
    "use strict";
    
    var event = {
        add: function(target, type, callback) {
            var _type = type.toLowerCase();
            this.initEventProperty(target, type);
            target.__events[type].callbacks[lib.guid(callback)] = callback;
            
            if (this.w3c) {
                target.addEventListener(type, callback, false);
            } else if (this.ie) {
                target.__events[type].handle = null;
                target.__events[type].IECallbacks = target.__events[type].IECallbacks || { keys: [], callbacks: []};
                target.__events[type].hasAttribute = false;
                target.__events[type].supported = typeof target["on" + _type] === "object" ||
                                                  typeof target["on" + _type] === "function";
                
                if (target.__events[type].supported) {
                    if (target["on" + _type] !== null) {
                        this.addIEAttributeEvent(target, type);
                    }
                    
                    var _callback = lib.bind(function() {
                        var event;
                        if (typeof callback.attributeEvent === "undefined") {
                            event = fixIEEvent(lib.window.event, target);
                        } else {
                            event = fixIEEvent(lib.window.event, null);
                        }
                        
                        return callback.apply(target, [event]);
                    }, this);
                    target.__events[type].IECallbacks.keys.push(callback.__guid);
                    target.__events[type].IECallbacks.callbacks.push(_callback);
                    target.attachEvent("on" + type, _callback);
                } else {
                    target.__events[type].handle = function(event) {
                        this.event = extendIEEventSafe(this.event, event);
                        this.event = fixIEEvent(this.event);
                        return this.callback.apply(this.event.currentTarget, [this.event]);
                    };
                    
                    var _target = (target === lib.document) ? lib.document.documentElement : target;
                    if (typeof target.libEvent === "undefined") {
                        target.libEvent = 0;
                        if (target !== _target) {
                            _target.libEvent = 0;
                        }
                    }
                    
                    _target.attachEvent("onpropertychange", function(event) {
                        if (event.propertyName === "libEvent") {
                            if (target.__events[type].handle.event &&
                                target === target.__events[type].handle.event.currentTarget &&
                                target.__events[type].handle.dispatched === false) {
                                target.__events[type].handle.dispatched = true;
                                return lib.bind(target.__events[type].handle, target.__events[type].handle)(event);
                            }
                        }
                    });
                }
            }
        },
        
        initEventProperty: function(target, type) {
            if (typeof target.__events === "undefined") {
                target.__events = {};
            }
            if (typeof target.__events[type] === "undefined") {
                target.__events[type] = {};
            }
            if (typeof target.__events[type].callbacks === "undefined") {
                target.__events[type].callbacks = {};
            }
        },
        
        addIEAttributeEvent: function(target, type) {
            this.initEventProperty(target, type);
            target.__events[type].hasAttribute = true;
            
            var _type = type.toLowerCase(),
                e = target["on" + _type];
            target["on" + _type] = null;
            e.attributeEvent = true;
            this.add(target, type, e);
        },
        
        remove: function(target, type, callback) {
            var i, len, t;
            if (typeof type === "undefined") {
                for (t in target.__events) {
                    if (target.__events.hasOwnProperty(t)) {
                        this.remove(target, t);
                    }
                }
            }
            
            if (typeof target.__events === "object" && typeof target.__events[type] === "object") {
                if (typeof callback === "function") {
                    if (this.w3c) {
                        target.removeEventListener(type, callback, false);
                    } else if (this.ie && target.__events[type].supported) {
                        var _callback,
                            iec = target.__events[type].IECallbacks,
                            guid = callback.__guid;
                        for (i = 0, len = iec.keys.length; i < len; i++) {
                            if (iec.keys[i] === guid) {
                                _callback = iec.callbacks[i];
                                iec.keys.splice(i, 0);
                                iec.callbacks.splice(i, 0);
                                break;
                            }
                        }
                        target.detachEvent("on" + type, _callback);
                    }
                    delete target.__events[type].callbacks[callback.__guid];
                } else {
                    for (i in target.__events[type].callbacks) {
                        if (target.__events[type].callbacks.hasOwnProperty(i)) {
                            this.remove(target, type, target.__events[type].callbacks[i]);
                        }
                    }
                }
            }
        },
        
        dispatch: function(target, type, properties) {
            if (this.w3c) {
                switch (this.events[type]) {
                    case this.types.mouse:
                        return this.dispatchMouseEvent(target, type, properties);
                    case this.types.keyboard:
                        return this.dispatchKeyboardEvent(target, type, properties);
                    case this.types.html:
                        return this.dispatchHTMLEvent(target, type, properties);
                    case this.types.dom: // not implemented
                        break;
                    case this.types.wheel: // not implemented
                        break;
                    default:
                        return this.dispatchUIEvent(target, type, properties);
                }
            } else if (this.ie) {
                return this.dispatchIEEvent(target, type, properties);
            }
        },
        
        dispatchMouseEvent: function(target, type, properties) {
            properties = (typeof properties !== "undefined") ? properties : {};
            var eventProperties = {
                    bubbles: true,
                    cancelable: true,
                    detail: 1,
                    screenX: 0,
                    screenY: 0,
                    clientX: 0,
                    clientY: 0,
                    ctrlKey: false,
                    altKey: false,
                    shiftKey: false,
                    metaKey: false,
                    button: 0,
                    relatedTarget: null
                },
                customProperties = lib.object.subtract(properties, eventProperties);
            lib.extend(eventProperties, properties || {});
            
            var event = document.createEvent("MouseEvents");
            event.initMouseEvent(type, eventProperties.bubbles, eventProperties.cancelable, lib.window,
                eventProperties.detail, eventProperties.screenX, eventProperties.screenY, eventProperties.clientX,
                eventProperties.clientY, eventProperties.ctrlKey, eventProperties.altKey, eventProperties.shiftKey,
                eventProperties.metaKey, eventProperties.button, eventProperties.relatedTarget);
            lib.extend(event, customProperties);
            return target.dispatchEvent(event);
        },
        
        dispatchKeyboardEvent: function(target, type, properties) {
            properties = (typeof properties !== "undefined") ? properties : {};
            var eventProperties = {
                    bubbles: true,
                    cancelable: true,
                    ctrlKey: false,
                    altKey: false,
                    shiftKey: false,
                    metaKey: false,
                    keyCode: 9,
                    charCode: 0
                },
                customProperties = lib.object.subtract(properties, eventProperties);
            lib.extend(eventProperties, properties || {});
            
            var event = document.createEvent("KeyboardEvent");
            if (typeof event.initKeyboardEvent === "undefined" && event.initKeyEvent) {
                event.initKeyboardEvent = event.initKeyEvent;
            }
            
            event.initKeyboardEvent(type, eventProperties.bubbles, eventProperties.cancelable, lib.window,
                eventProperties.ctrlKey, eventProperties.altKey, eventProperties.shiftKey, eventProperties.metaKey,
                eventProperties.keyCode, eventProperties.charCode);
            lib.extend(event, customProperties);
            return target.dispatchEvent(event);
        },
        
        dispatchHTMLEvent: function(target, type, properties) {
            properties = (typeof properties !== "undefined") ? properties : {};
            var eventProperties = {
                    bubbles: true,
                    cancelable: true
                },
                customProperties = lib.object.subtract(properties, eventProperties);
            lib.extend(eventProperties, properties || {});
            
            var event = document.createEvent("HTMLEvents");
            event.initEvent(type, eventProperties.bubbles, eventProperties.cancelable);
            lib.extend(event, customProperties);
            return target.dispatchEvent(event);
        },
        
        dispatchUIEvent: function(target, type, properties) {
            properties = (typeof properties !== "undefined") ? properties : {};
            var eventProperties = {
                    bubbles: true,
                    cancelable: true,
                    detail: null
                },
                customProperties = lib.object.subtract(properties, eventProperties);
            lib.extend(eventProperties, properties || {});
            
            var event = document.createEvent("UIEvents");
            event.initUIEvent(type, eventProperties.bubbles,
                              eventProperties.cancelable,
                              lib.window,
                              eventProperties.detail);
            lib.extend(event, customProperties);
            return target.dispatchEvent(event);
        },
        
        dispatchIEEvent: function(target, type, properties) {
            var event, _type = type.toLowerCase();
            if (typeof target.__events === "undefined") {
                if (typeof target["on" + _type] === "object" || typeof target["on" + _type] === "function") {
                    this.addIEAttributeEvent(target, type);
                } else {
                    return;
                }
            }
            
            if (typeof target.__events[type] === "undefined") {
                return;
            }
            
            properties = properties || {};
            if (target.__events[type].supported) {
                event = document.createEventObject();
                lib.extend(event, properties);
                return target.fireEvent("on" + type, event);
            } else {
                event = lib.extend(properties, {
                    target: target,
                    type: type,
                    currentTarget: target
                });
                
                while (target) {
                    if (target.__events && target.__events[type]) {
                        for (var i in target.__events[type].callbacks) {
                            if (typeof properties.safe === "boolean" && properties.safe === true) {
                                target.__events[type].handle.callback = target.__events[type].callbacks[i];
                                target.__events[type].handle.event = event;
                                target.__events[type].handle.dispatched = false;
                                
                                if (event.currentTarget === document) {
                                    document.documentElement.libEvent++;
                                } else {
                                    event.currentTarget.libEvent++;
                                }
                            } else {
                                
                                if (target.__events[type].callbacks[i].call(
                                        target, fixIEEvent(event, target)) === false) {
                                    event.preventDefault();
                                    event.stopPropagation();
                                }
                            }
                        }
                    }
                    target = event.currentTarget = (!event.cancelBubble && target.parentNode);
                }
                return (event.returnValue !== false);
            }
        },
        
        preventDefault: function preventDefault(event) {
            event.preventDefault();
            return false;
        },
        
        w3c: (document.addEventListener) ? true : false,
        ie: (document.attachEvent && !document.addEventListener) ? true : false,
        
        types: {
            mouse: 1,
            keyboard: 2,
            html: 3,
            dom: 4,
            wheel: 5
        }
    };
    
    event.events = {
        click: event.types.mouse,
        dblclick: event.types.mouse,
        mousedown: event.types.mouse,
        mouseenter: event.types.mouse,
        mouseleave: event.types.mouse,
        mouseup: event.types.mouse,
        mouseover: event.types.mouse,
        mousemove: event.types.mouse,
        mouseout: event.types.mouse,
        keypress: event.types.keyboard,
        keydown: event.types.keyboard,
        keyup: event.types.keyboard,
        load: event.types.html,
        unload: event.types.html,
        abort: event.types.html,
        error: event.types.html,
        resize: event.types.html,
        scroll: event.types.html,
        select: event.types.html,
        change: event.types.html,
        submit: event.types.html,
        reset: event.types.html,
        focus: event.types.html,
        blur: event.types.html,
        DOMFocusIn: event.types.dom,
        DOMFocusOut: event.types.dom,
        DOMActivate: event.types.dom,
        DOMSubtreeModified: event.types.dom,
        DOMNodeInserted: event.types.dom,
        DOMNodeRemoved: event.types.dom,
        DOMNodeRemovedFromDocument: event.types.dom,
        DOMNodeInsertedIntoDocument: event.types.dom,
        DOMAttrModified: event.types.dom,
        DOMCharacterDataModified: event.types.dom,
        mousewheel: event.types.wheel,
        DOMMouseScroll: event.types.wheel
    };
    
    function fixIEEvent(event) {
        event.target = event.target || event.srcElement;
        event.currentTarget = (arguments[1] && arguments[1].nodeName) ? arguments[1] :
                                  (arguments[1] === null) ? null : event.currentTarget;
        
        if (arguments[1] && arguments[1].nodeName && event.toElement && event.toElement.nodeName) {
            event.relatedTarget = (event.toElement === event.target) ? event.fromElement : event.toElement;
        }
        
        event.preventDefault = function() {
            event.returnValue = false;
        };
            
        event.stopPropagation = function() {
            event.cancelBubble = true;
        };
        
        return event;
    }
    
    function extendIEEventSafe(target) {
        var props = ["altKey", "attrChange", "attrName", "bubbles", "button", "cancelable", "charCode",
                    "clientX", "clientY", "ctrlKey", "currentTarget", "data", "detail", "eventPhase",
                    "fromElement", "handler", "keyCode", "layerX", "layerY", "metaKey", "newValue",
                    "offsetX", "offsetY", "originalTarget", "pageX", "pageY", "prevValue", "relatedNode",
                    "relatedTarget", "screenX", "screenY", "shiftKey", "srcElement", "target", "toElement",
                    "view", "wheelDelta", "which"];
        for (var i, k = 0; ++k < arguments.length;) {
            for (i in props) {
                if (typeof arguments[k][props[i]] !== "undefined") {
                    target[props[i]] = arguments[k][props[i]];
                }
            }
        }
        
        target.originalEvent = arguments[1];
        return target;
    }
    
    lib.event = {
        add: lib.bind(event.add, event),
        remove: lib.bind(event.remove, event),
        dispatch: lib.bind(event.dispatch, event),
        preventDefault: event.preventDefault
    };
})(lib);

(function(lib, undefined) {
    /*jshint noarg:false, strict: false*/
    /*global lib*/
    
    if (lib.isDOMReady) {
        return;
    }
    
    function onReady() {
        if (!lib.isDOMReady) {
            lib.isDOMReady = true;
            lib.event.dispatch(document, "DOMReady", { safe: true });
            lib.event.remove(lib.document, "libReady");
        }
    }
    
    if (document.readyState === "complete") { // already here!
        onReady();
    } else if (!window.opera && document.attachEvent) {
        // like IE
        
        // not an iframe...
        if (document.documentElement.doScroll && window === top) {
            (function callback() {
                try {
                    document.documentElement.doScroll("left");
                } catch(error) {
                    setTimeout(callback, 0);
                    return;
                }
                
                // and execute any waiting functions
                onReady();
            })();
        } else {
            // an iframe...
            document.attachEvent(
                "onreadystatechange",
                function callback() {
                    if (document.readyState === "complete") {
                        document.detachEvent("onreadystatechange", callback);
                        onReady();
                    }
                }
            );
        }
    } else if (document.readyState) {
        // like pre Safari
        (function callback() {
            if (/loaded|complete/.test(document.readyState)) {
                onReady();
            } else {
                setTimeout(callback, 0);
            }
        })();
    } else if (document.addEventListener) {
        // like Mozilla, Opera and recent webkit
        document.addEventListener( 
            "DOMContentLoaded",
            function callback() {
                document.removeEventListener("DOMContentLoaded", callback, false);
                onReady();
            },
            false
        );
    } else {
        throw new Error("Unable to bind lib ready listener to document.");
    }
})(lib);

(function(lib, undefined) {
    /*global lib*/
    "use strict";
    
    lib.dimensions = {
        get: function get(element) {
            var layoutViewport, scroll, rect;
            scroll = this.scroll();

            if ("undefined" === typeof element) {
                /* backwards compatibility */
                layoutViewport = this.layoutViewport();
                return {
                    innerWidth: layoutViewport.width,
                    innerHeight: layoutViewport.height,
                    scrollX: scroll.x,
                    scrollY: scroll.y
                }
            } else if (element) {
                rect = element.getBoundingClientRect();
                return {
                    width: rect.width || element.offsetWidth,
                    height: rect.height || element.offsetHeight,
                    left: rect.left + scroll.x,
                    top: rect.top + scroll.y,
                    right: rect.right + scroll.x,
                    bottom: rect.bottom + scroll.y
                };
            }
        },
        
        normalize: function normalize(dimensions, reference) {
            var left, top, width, height;
            left = dimensions.left - reference.left;
            top = dimensions.top - reference.top;
            width = dimensions.width;
            height = dimensions.height;
            return {
                left: left,
                top: top,
                right: left + width,
                bottom: top + height,
                width: width,
                height: height
            }
        },
        
        padding: function padding(element) {
            return this.getPropertyDimensions(element, "padding-{0}");
        },
        
        border: function border(element) {
            return this.getPropertyDimensions(element, "border-{0}-width");
        },
        
        margin: function margin(element) {
            return this.getPropertyDimensions(element, "margin-{0}");
        },
        
        getPropertyDimensions: function getPropertyDimensions(element, property) {
            var i, l, props, prop, out;
            props = ["left", "top", "right", "bottom"];
            out = {};
            for (i = 0, l = props.length; i < l; i++) {
                prop = props[i];
                out[prop] = parseInt(lib.dom.getStyle(element, lib.string.format(property, [prop])), 10);
            }
            return out;
        },
        
        layoutViewport: function layoutViewport() {
            return {
                width: lib.document.documentElement.clientWidth || document.body.clientWidth,
                height: lib.document.documentElement.clientHeight || document.body.clientHeight
            };
        },
        
        visualViewport: function visualViewport() {
            return {
                width: lib.window.innerWidth || document.documentElement.offsetWidth,
                height: lib.window.innerHeight || document.documentElement.offsetHeight
            };
        },
        
        scroll: function scroll() {
            return {
                x: lib.window.scrollX || lib.document.documentElement.scrollLeft,
                y: lib.window.scrollY || lib.document.documentElement.scrollTop
            };
        }
    };
})(lib);

if (!window.opera) { try { document.execCommand("BackgroundImageCache", false, true); } catch(e) {} }

(function(lib, undefined) {
    /*global lib*/
    "use strict";
    
    var vendors, lastTime;
    vendors = ["ms", "moz", "webkit", "o"];
    lastTime = 0;
    
    lib.tween = {
        // http://st-on-it.blogspot.com/2011/05/calculating-cubic-bezier-function.html
        Bezier: function Bezier(p1, p2, p3, p4) {
            // defining the bezier functions in the polynomial form
            var Cx = 3 * p1,
                Bx = 3 * (p3 - p1) - Cx,
                Ax = 1 - Cx - Bx,
                Cy = 3 * p2,
                By = 3 * (p4 - p2) - Cy,
                Ay = 1 - Cy - By;
            
            function bezierX(t) { return t * (Cx + t * (Bx + t * Ax)); }
            function bezierY(t) { return t * (Cy + t * (By + t * Ay)); }
            
            // using Newton's method to aproximate the parametric value of x for t
            function bezierXDerivative(t) { return Cx + t * (2 * Bx + 3 * Ax * t); }
            
            function findXFor(t) {
                var x = t, i = 0, z;
                
                while (i < 5) { // making 5 iterations max
                    z = bezierX(x) - t;
                    
                    if (Math.abs(z) < 1e-3) {
                        break; // if already got close enough
                    }
                    
                    x = x - z / bezierXDerivative(x);
                    i++;
                }
                return x;
            }
            
            return function findYFor(t) {
                return bezierY(findXFor(t));
            };
        },
        
        bezier: function bezier(p1, p2, p3, p4) {
            return new this.Bezier(p1, p2, p3, p4);
        },
        
        easing: {
            ease:       [0.25, 0.1, 0.25, 1.0],
            linear:     [0.0, 0.0, 1.0, 1.0],
            easeIn:     [0.42, 0, 1.0, 1.0],
            easeOut:    [0, 0, 0.58, 1.0],
            easeInOut:  [0.42, 0, 0.58, 1.0]
        },
        
        getRequestAnimationFrame: function getRequestAnimationFrame() {
            var rAF;
            rAF = lib.window.requestAnimationFrame;
            for (var i = 0; i < vendors.length && !rAF; i++) {
                rAF = lib.window[vendors[i] + "RequestAnimationFrame"];
            }
            
            if (rAF) {
                return rAF;
            } else {
                return function(callback) {
                    var currTime, timeToCall, id;
                    currTime = new Date().getTime();
                    timeToCall = Math.max(0, 16 - (currTime - lastTime));
                    id = lib.window.setTimeout(function() {
                        callback(currTime + timeToCall);
                    }, timeToCall);
                    lastTime = currTime + timeToCall;
                    return id;
                };
           }
        },
        
        getCancelAnimationFrame: function getCancelAnimationFrame() {
            var cAF;
            cAF = lib.window.cancelAnimationFrame;
            for (var i = 0; i < vendors.length && !cAF; i++) {
                cAF = lib.window[vendors[i] + "CancelAnimationFrame"] ||
                      lib.window[vendors[i] + "CancelRequestAnimationFrame"];
            }
            
            if (cAF) {
                return cAF;
            } else {
               return function(id) {
                   lib.window.clearTimeout(id);
               };
           }
        },
        
        run: function run(from, to, duration, easing, stepCallback, endCallback) {
            var startTime, easingFunction,
                isFunctionStepCallback, isFunctionEndCallback, requestAnimationFrame,
                rafPrevented, intervalFunction;
                
            isFunctionStepCallback = lib.util.isFunction(stepCallback);
            isFunctionEndCallback = lib.util.isFunction(endCallback);
            requestAnimationFrame = this.getRequestAnimationFrame();
            rafPrevented = false;
            
            if (typeof easing === "string" && this.easing[easing]) {
                easingFunction = this.bezier.apply(this, this.easing[easing]);
            } else if (lib.util.isArray(easing) && easing.length === 4) {
                easingFunction = this.bezier.apply(this, easing);
            } else {
                easingFunction = this.bezier.apply(this, this.easing.ease);
            }
            
            (function intervalFunction() {
                /*jshint validthis:true */
                var time, deltaTime, fraqTime, end, delta, rafHandle;
                
                if (!startTime) {
                    startTime = +new Date();
                    requestAnimationFrame(intervalFunction);
                    return;
                }
                
                time = +new Date();
                deltaTime = time - startTime;
                fraqTime = easingFunction(deltaTime / duration);
                end = (duration - deltaTime < 13) ? true : false; // --OMG-OPTIMIZE
                delta = (to - from) * fraqTime;
                delta = from + delta;
                //delta = end ? to : delta <= to ? delta : to;
                delta = end ? to : delta;
                
                if (end) {
                    if (isFunctionEndCallback) {
                        endCallback.call(this, delta);
                    }
                    return;
                } else {
                    if (!rafPrevented) {
                        rafHandle = requestAnimationFrame(intervalFunction);
                    }
                }
                
                if (isFunctionStepCallback) {
                    rafPrevented = stepCallback.call(this, delta, rafHandle);
                    rafPrevented = (undefined === rafPrevented) ? false : !rafPrevented;
                }
                
            })();
        }
    };
})(lib);

(function(lib, undefined) {
    /*global lib*/
    "use strict";
    
    function Widget(element) {
        /*jshint bitwise:false*/
        this.__guid = lib.guid();
        this.__bound = {};
        
        if (lib.dom.isTypeOf(element, lib.dom.ELEMENT_NODE | lib.dom.DOCUMENT_NODE) || element === lib.window) {
            this.element = element;
        }
    }
    
    lib.extend(Widget.prototype, {
        _bind: function _bind(method) {
            this.__bound[method] = this[method];
        },
        
        dispose: function dispose() {
            /* must be implemented in widget */
        },
        
        call: function call(method) {
            var args = lib.array.toArray(arguments);
            args.shift();
            return this.apply(method, args);
        },
        
        apply: function apply(method, args) {
            var methodFunction = this.__bound[method];
            if (methodFunction) {
                return methodFunction.apply(this, args);
            } else {
                throw new Error("method " + method + " is not bound");
            }
        }
    });
    
    function WidgetFactory(widgetConstructor) {
        this.widgetConstructor = widgetConstructor;
        this.items = [];
        this.length = 0;
        this.name = lib.util.getFunctionName(this.widgetConstructor);
    }
    
    lib.extend(WidgetFactory.prototype, {
        run: function run(elements, properties) {
            /*jshint bitwise:false*/
            var widget;
            if (lib.dom.isTypeOf(elements, lib.dom.ELEMENT_NODE | lib.dom.DOCUMENT_NODE) || elements === lib.window) {
                elements = [elements];
            } else if (elements) {
                elements = lib.array.toArray(elements);
            } else {
                elements = [];
            }
            lib.array.forEach(elements, lib.bind(function(element) {
                widget = new this.widgetConstructor(element, properties);
                this.elementize(widget, element);
                this.items.push(widget);
                this.length++;
            }, this));
            
            return widget;
        },
        
        create: function create(elementize, properties) {
            if (elementize !== true && elementize !== false && arguments.length === 1) {
                properties = elementize;
                elementize = false;
            }
            
            var widget;
            if (elementize) {
                var element = lib.dom.create("<div>");
                widget = new this.widgetConstructor(element, properties);
                this.elementize(widget, element);
            } else {
                widget = new this.widgetConstructor(null, properties);
            }
            this.items.push(widget);
            this.length++;
            return widget;
        },
        
        destroy: function destroy(widget) {
            for (var i = 0, l = this.items.length; i < l; i++) {
                if (widget === this.items[i]) {
                    widget.dispose();
                    var type = lib.util.getType(widget);
                    if (widget.element && widget.element.__widgets) {
                        delete widget.element.__widgets[type];
                    }
                    this.items.splice(i, 1);
                    this.length--;
                }
            }
        },
        
        elementize: function elementize(widget, element) {
            if (!widget.element.__widgets) {
                widget.element.__widgets = {};
            }
            widget.element.__widgets[this.name] = widget;
        },
        
        item: function item(n) {
            return this.items[n] || null;
        },
        
        call: function call(element, method) {
            var args = lib.array.toArray(arguments);
            args.shift();
            if (lib.util.isFunction(method)) {
                args.shift();
            } else {
                if (method) {
                    args.push(method);
                }
                method = null;
            }
            return this.apply(element, method, args);
        },
        
        apply: function apply(element, method, args) {
            var widget;
            if ("string" === typeof element && !method) {
                return this.widgetConstructor[element].apply(this, args);
            } else {
                widget = lib.widget.get(element, this.name);
                return widget.apply(method, args);
            }
        }
    });
    
    lib.widget = {
        Widget: Widget,
        
        create: function create(constructor, prototype) {
            if (1 === arguments.length && lib.util.isObject(constructor)) {
                prototype = constructor;
                constructor = prototype.constructor;
                delete prototype.constructor;
            }
            
            lib.util.inherits(constructor, Widget);
            lib.extend(constructor.prototype, lib.widget.helpers);
            lib.extend(constructor.prototype, prototype);
            return new WidgetFactory(constructor);
        },
        
        get: function get(element, name) {
            if (lib.dom.isTypeOf(element, lib.dom.ELEMENT_NODE) && element.__widgets) {
                name = (name instanceof WidgetFactory) ? name.name : name;
                return element.__widgets[name] || null;
            } else {
                return null;
            }
        }
    };
    
})(lib);

(function(lib, undefined) {
    /*global lib*/
    "use strict";
    
    lib.widget.helpers = {};
    
    lib.extend(lib.widget.helpers, {
        _addEvent: function _addEvent(target, type, callback) {
            var bound = lib.bind(callback, this);
            if (!this.__events) {
                this.__events = [];
            }
            
            this.__events.push([target, type, callback, bound]);
            lib.event.add(target, type, bound);
        },
        
        _removeEvent: function _removeEvent(target, type, callback) {
            if (this.__events) {
                var events = this.__events;
                lib.array.forEach(events, function(event, i) {
                    var match = true;
                    if (target) {
                        match = (match && target === event[0]);
                    }
                    if (type) {
                        match = (match && type === event[1]);
                    }
                    if (callback) {
                        match = (match && callback === event[2]);
                    }
                    
                    if (match) {
                        lib.event.remove(event[0], event[1], event[3]);
                        events[i] = null;
                    }
                });
                this.__events = lib.array.filter(events, function(event) {
                    return event !== null;
                });
            }
        },
        
        _dispatchEvent: function _dispatchEvent(type, args) {
            lib.event.dispatch(this.element, type, args);
        },
        
        _dispose: function _dispose() {
            this._removeEvent();
            if ("__events" in this) {
                delete this.__events;
            }
            delete this.element;
        },
        
        _elementize: function _elementize(element) {
            var type = lib.util.getType(this);
            if (!element.__widgets) {
                element.__widgets = {};
            }
            if (!element.__widgets[type]) {
                element.__widgets[type] = this;
                this.element = element;
            }
        }
    });
})(lib);
