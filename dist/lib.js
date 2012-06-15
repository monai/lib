/*
Copyright (c) 2012 https://github.com/monai/

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
(function(window, undefined) {
        var log = function log() {
            if (window.console && window.console.log && window.console.log.apply) {
                window.console.log.apply(window.console, arguments);
            } else {
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
                o.push(i + ": " + object[i]);
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
                } else if (typeof callback == "function") {
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
                for (var i, k = 0, len = arguments.length; ++k < len;)
                    for (i in arguments[k]) target[i] = arguments[k][i];
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
                if (!object) return ++lib.guid.id;
                if (!object.__guid) object.__guid = lib.guid.id++;
                return object.__guid;
            }
        };
    
    lib.log.output = [];
    lib.guid.id = 1;
    
    if (!window.lib) window.lib = lib;
    if (!window.log) window.log = log;
})(window);
(function(lib, undefined) {
    
    lib.util = {
        getType: function getType(object) {
            var op = Object.prototype,
                string = op.toString.call(object);
            
            if (object === null) {
                return "null";
            } else if (object === true || object === false) {
                return "boolean";
            } else if (string == "[object Array]") {
                return "Array";
            } else if (string == "[object Arguments]" || !!(op.hasOwnProperty.call(object, "callee"))) {
                return "Arguments";
            } else if (string == "[object Function]") {
                return "Function";
            } else if (string == "[object String]") {
                return "String";
            } else if (string == "[object Number]") {
                return "Number";
            } else if (string == "[object Date]") {
                return "Date";
            } else if (string == "[object RegExp]") {
                return "RegExp";
            } else if (typeof object == "object") {
                return this.getFunctionName(object.constructor);
            }
        },
        
        isObject: function isObject(object) {
            return object === Object(object);
        },
        
        isArray: function isArray(object) {
            return this.getType(object) == "Array";
        },
        
        isArguments: function isArguments(object) {
            return this.getType(object) == "Arguments";
        },
        
        isFunction: function isFunction(object) {
            return this.getType(object) == "Function";
        },
        
        isString: function isString(object) {
            return this.getType(object) == "String";
        },
        
        isNumber: function isNumber(object) {
            return this.getType(object) == "Number";
        },
        
        isDate: function isDate(object) {
            return this.getType(object) == "Date";
        },
        
        isRegExp: function isRegExp(object) {
            return this.getType(object) == "RegExp";
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
(function(lib, undefined) {
    function Benchmark(name, start) {
        if (this == lib.util) return new Benchmark(name, start);
        
        this.name = name;
        this.startTime = null;
        this.endTime = null;
        if (start || typeof start == "undefined") this.start();
    };
    
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
    function Bindable(value) {
        if (this == lib.util) return new Bindable(value);
        
        this.__guid = lib.guid();
        this._bound = [];
        
        this.value = value;
    };
    
    lib.extend(Bindable.prototype, {
        toString: function toString() {
            return "[object Bindable]";
        },
        
        valueOf: function valueOf() {
            return this.get();
        },
        
        get: function get() {
            return this.value;
        },
        
        set: function set(value) {
            var oldValue = this.value;
            this.value = value;
            
            lib.array.forEach(this._bound, lib.bind(function(callback) {
                if (lib.util.isArray(callback)) {
                    callback[0][callback[1]] = this.value;
                } else {
                    callback.call(this, this.value, oldValue);
                }
            }, this));
            
            return this;
        },
        
        bind: function bind(target, property) {
            if (target && typeof property == "string") {
                this._bound.push([target, property]);
            } else if (lib.util.isFunction(target)) {
                this._bound.push(target);
            }
        },
        
        unbind: function unbind(target, property) {
            if (target) {
                var bound = this._bound,
                    test;
                for (var i = 0, l = bound.length; i < l; i++) {
                    if (bound[i] === target || bound[i][0] === target && bound[i][1] === property) {
                        bound.splice(i, 1);
                        break;
                    }
                }
            } else {
                this._bound = [];
            }
        }
    });
    
    lib.util.Bindable = Bindable;
    
})(lib);
(function(lib, undefined) {
    lib.object = {
        keys: function keys(object) {
            if ("keys" in Object) {
                return Object.keys(object);
            } else {
                var keys = [];
                for (var i in object) keys.push(i);
                return keys;
            }
        },
        
        createFromTemplate: function createFromTemplate(template, object) {
            object = (object) ? object : {};
            var path = template.split(".");
            
            (function iterate(parent, path) {
                if (!parent[path[0]]) parent[path[0]] = {};
                if (path.length > 1) iterate(parent[path[0]], path.splice(1));
            })(object, path);
            
            return object;
        },
        
        subtract: function subtract(minuend, subtrahend) {
            var difference = {};
            for (var i in minuend) {
                if (typeof subtrahend[i] == "undefined") {
                    difference[i] = minuend[i];
                }
            }
            return difference;
        }
    };
})(lib);
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
        
        indexOf: function indexOf(array, object) {
            for (var i = 0, len = array.length; i < len; i++) {
                if (array[i] === object) return i;
            }
            return -1;
        },
        
        lastIndexOf: function lastIndexOf(array, object) {
            for (var len = array.length, i = len - 1; i >= 0; i--) {
                if (array[i] === object) return i;
            }
            return -1;
        },
        
        inArray: function inArray(array, object) {
            return (this.indexOf(array, object) > -1) ? true : false;
        },
        
        forEach: function forEach(array, callback, thisObject) {
            if (typeof callback != "function") throw new TypeError(callback + " is not a function");
            
            if ("forEach" in array) {
                array.forEach(callback, thisObject || lib.window);
            } else {
                for (var i = 0, len = array.length; i < len; i++) {
                    callback.call(thisObject || lib.window, array[i], i, array);
                }
            }
        },
        
        every: function every(array, callback, thisObject) {
            if (typeof callback != "function") throw new TypeError(callback + " is not a function");
            
            if ("every" in array) {
                return array.every(callback, thisObject || lib.window);
            } else {
                for (var i = 0, len = array.length; i < len; i++) {
                    if (i in array && !callback.call(thisObject || lib.window, array[i], i, array)) return false;
                }
                return true;
            }
        },
        
        some: function some(array, callback, thisObject) {
            if (typeof callback != "function") throw new TypeError(callback + " is not a function");
            
            if ("some" in array) {
                return array.some(callback, thisObject || lib.window);
            } else {
                for (var i = 0, len = array.length; i < len; i++) {
                    if (i in array && callback.call(thisObject || lib.window, array[i], i, array)) return true;
                }
                return false;
            }
        },
        
        filter: function filter(array, callback, thisObject) {
            if (typeof callback != "function") throw new TypeError(callback + " is not a function");
            
            if ("filter" in array) {
                return array.filter(callback, thisObject || lib.window);
            } else {
                var out = [];
                for (var i = 0, len = array.length; i < len; i++) {
                    if (i in array) {
                        if (callback.call(thisObject || lib.window, array[i], i, array)) out.push(array[i]);
                    }
                }
                return out;
            }
        },
        
        map: function map(array, callback, thisObject) {
            if (typeof callback != "function") throw new TypeError(callback + " is not a function");
            
            if ("map" in array) {
                return array.map(callback, thisObject || lib.window);
            } else {
                var len = array.length,
                    out = new Array(len);
                for (var i = 0; i < len; i++) {
                    if (i in array) out[i] = callback.call(thisObject || lib.window, array[i], i, array);
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
                    if (i in array) out = callback.call(lib.window, out, array[i], i, array);
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
                    if (i in array) out = callback.call(lib.window, out, array[i], i, array);
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
(function(lib, undefined) {
    lib.string = {
        trim: function trim(str) {
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
            if ("trimRight" in String) {
                return String.trimRight(str);
            } else {
                var i = str.length;
                while (/\s/.test(str.charAt(--i)));
                return str.slice(0, i + 1);
            }
        },
        
        padding: function padding(str, pad, length) {
            if (typeof str != "string") str = str.toString();
            
            var absLength = Math.abs(length);
            if (str.length >= absLength) return str;
            
            var prepend = (absLength == length) ? true : false,
                out = new Array(absLength - str.length);
            
            for (var i = 0, len = out.length; i < len; i++) out[i] = pad;
            
            if (prepend) {
                out.push(str);
            } else {
                out.unshift(str);
            }
            return out.join("");
        },
        
        format: function format(str, args) {
            return str.replace(/\{(\d+)\}/g, function(s, n) {
                return args[parseInt(n)];
            });
        }
    };
})(lib);
(function(lib, undefined) {
    lib.date = {
        parseISOString: function parseISOString(str) {
            var parsed = Date.parse(str);
            if (!isNaN(parsed)) return new Date(parsed);
            
            var match = str.match(/\d+/g),
                date = new Date(match[0], parseInt(match[1], 10) - 1, match[2], match[3], match[4], match[5], match[6]),
                offset = (new Date()).getTimezoneOffset(),
                offsetAbs = Math.abs(offset),
                offsetSign = (offsetAbs == offset) ? -1 : 1,
                offsetHours = (offsetAbs - (offsetAbs % 60)) / 60,
                offsetMinutes = offsetAbs - offsetHours * 60;
            date.setHours(date.getHours() + offsetHours * offsetSign);
            date.setMinutes(date.getMinutes() + offsetMinutes * offsetSign);
            return date;
        },
        
        toISOString: function toISOString(date) {
            if ("toISOString" in date) {
                return date.toISOString();
            } else {
                return date.getUTCFullYear() + "-"
                     + lib.util.padding(date.getUTCMonth() + 1, 0, 2) + "-"
                     + lib.util.padding(date.getUTCDate(), 0, 2) + "T"
                     + lib.util.padding(date.getUTCHours(), 0, 2) + ":"
                     + lib.util.padding(date.getUTCMinutes(), 0, 2) + ":"
                     + lib.util.padding(date.getUTCSeconds(), 0, 2) + "."
                     + lib.util.padding(date.getUTCMilliseconds(), 0, 3) + "Z";
            }
        }
    };
})(lib);
(function(lib, undefined) {
    lib.JSON = {
        parse: function parse(str) {
            if (JSON && "parse" in JSON) {
                return JSON.parse(str);
            } else {
                if (typeof str != "string" && typeof str != "undefined") return str;
                
                var canEval = (/^[\],:{}\s]*$/.test(
                    str.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, "@")
                    .replace(/\"[^\"\\\n\r]*\"|true|false|null|-?\d+(?:\.\d*)?(:?[eE][+\-]?\d+)?/g, "]")
                    .replace(/(?:^|:|,)(?:\s*\[)+/g, "")
                ));
                if (canEval) {
                    return (new Function("return (" + str + ")"))();
                } else {
                    throw new SyntaxError("Invalid JSON");
                }
            }
        },
        
        stringify: function stringify(object) {
            function stringify(object) {
                if (lib.util.getType(object) == "array") {
                    var type = {
                        start : "[",
                        end : "]",
                        showKeys : false
                    };
                } else {
                    var type = {
                        start : "{",
                        end : "}",
                        showKeys : true
                    };
                }
                
                var serial = [type.start],
                    len = 1,
                    dataType,
                    notFirst = false;
                
                for (var key in object) {
                    dataType = lib.util.getType(object[key]);
                    
                    if (dataType != "undefined") {
                        if (notFirst) {
                            serial[len++] = ",";
                        }
                        notFirst = true;
                        
                        if (type.showKeys) {
                            serial[len++] = "\"";
                            serial[len++] = key;
                            serial[len++] = "\"";
                            serial[len++] = ":";
                        }
                        
                        switch (dataType) {
                            case "Function":
                                throw new TypeError("Cannot stringify function to JSON");
                                break;
                            case "String":
                            default:
                                serial[len++] = "\"";
                                serial[len++] = object[key];
                                serial[len++] = "\"";
                                break;
                            case "Number":
                            case "Boolean":
                                serial[len++] = object[key];
                                break;
                            case "Object":
                            case "Array":
                                serial[len++] = stringify(object[key]);
                                break;
                            case "null":
                                serial[len++] = null;
                                break;
                        }
                    }
                }
                serial[len++] = type.end;
                return serial.join("");
            }
            
            var type = lib.util.getType(object);
            
            if (type == "Object" || type == "Array") {
                return stringify(object);
            } else {
                throw new TypeError("Cannot stringify function to JSON");
            }
        }
    };
})(lib);
(function(lib, undefined) {
    lib.dom = {
        byId: function byId(id) {
            return lib.document.getElementById(id);
        },
        
        byTag: function byTag(name, element) {
            return (element || lib.document).getElementsByTagName(name);
        },
        
        byClass: function byClass(klass, tag, element) {
            if (typeof tag == "object" && typeof element == "undefined") {
                element = tag;
                tag = undefined;
            }
            
            if (lib.document.getElementsByClassName) {
                var elements = (element || lib.document).getElementsByClassName(klass),
                    nodeName = tag ? new RegExp("\\b" + tag + "\\b", "i") : null,
                    returnElements = [];
                for (var i = 0; i < elements.length; i++)
                    if (!nodeName || nodeName.test(elements[i].nodeName))
                        returnElements.push(elements[i]);
                
                return returnElements;
            } else {
                tag = tag || "*";
                element = element || lib.document;
                
                if (lib.document.evaluate) {
                    var classes = klass.split(" "),
                        classesToCheck = "",
                        xhtmlNamespace = "http://www.w3.org/1999/xhtml",
                        namespaceResolver = (lib.document.documentElement.namespaceURI === xhtmlNamespace)
                                            ? xhtmlNamespace : null,
                        returnElements = [],
                        elements,
                        node;
                    
                    for (var i = 0; i < classes.length; i++)
                        classesToCheck += "[contains(concat(' ', @class, ' '), ' " + classes[i] + " ')]";
                    
                    try {
                        elements = lib.document.evaluate(".//" + tag + classesToCheck, element, namespaceResolver, 0, null);
                    } catch (e) {
                        elements = lib.document.evaluate(".//" + tag + classesToCheck, element, null, 0, null);
                    }
                    
                    while (node = elements.iterateNext())
                        returnElements.push(node);
                    
                    return returnElements;
                } else {
                    var classes = klass.split(" "),
                        classesToCheck = [],
                        elements = (tag === "*" && element.all) ? element.all : element.getElementsByTagName(tag),
                        current,
                        returnElements = [],
                        match;
                    for (var i = 0; i < classes.length; i++)
                        classesToCheck.push(new RegExp("(^|\\s)" + classes[i] + "(\\s|$)"));
                    
                    for (var i = 0; i < elements.length; i++) {
                        match = false;
                        for (var j = 0; j < classesToCheck.length; j++){
                            match = classesToCheck[j].test(elements[i].className);
                            if (!match)
                                break;
                        }
                        if (match)
                            returnElements.push(elements[i]);
                    }
                    
                    return returnElements;
                }
            }
        },
        
        parent: function parent(element, klass, name) {
            klass = klass && new RegExp("(^|\\s)" + klass + "(\\s|$)");
            name = name && name.toUpperCase();
            
            while ((element = element.parentNode)
                && (klass && !klass.test(element.className)
                    || name && name != element.nodeName));
            
            return element;
        },
        
        isChild: function isChild(element, parent) {
            while ((element = element.parentNode)) {
                if (element === parent) return true;
            }
            return false;
        },
        
        prev: function prev(element, klass, name) {
            klass = klass && new RegExp("(^|\\s)" + klass + "(\\s|$)");
            name = name && name.toUpperCase();
            
            while ((element = element.previousSibling)
                && (element.nodeType != 1
                    || klass && !klass.test(element.className)
                    || name && name != element.nodeName));
            
            return element;
        },
        
        next: function next(element, klass, name) {
            klass = klass && new RegExp("(^|\\s)" + klass + "(\\s|$)");
            name = name && name.toUpperCase();
            
            while ((element = element.nextSibling)
                && (element.nodeType != 1
                    || klass && !klass.test(element.className)
                    || name && name != element.nodeName));
            
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
        
        before: function before(element, before) {
            var p = this.parent(before);
            return p && p.insertBefore(element, before);
        },
        
        after: function after(element, after) {
            var p = this.parent(after);
            return p && p.insertBefore(element, after.nextSibling);
        },
        
        hasClass: function hasClass(element, klass) {
            return (element.classList && element.classList.contains)
                    ? element.classList.contains(klass)
                    : new RegExp("(^|\\s)" + klass + "(\\s|$)").test(element.className);
        },
        
        addClass: function addClass(element, klass) {
            if (!this.hasClass(element, klass)) {
                if (element.classList && element.classList.add) element.classList.add(klass);
                else element.className += (element.className ? " " : "") + klass;
            }
            return element;
        },
        
        removeClass: function removeClass(element, klass) {
            if (element.classList && element.classList.remove) element.classList.remove(klass);
            else element.className = element.className.replace(new RegExp("(^|\\s)" + klass + "(\\s|$)"), "$2");
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
        
        getStyle: function getStyle(element, property, pseudoElement) {
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
            if (!(element || "nodeType" in element || typeof element.nodeType == "number")) return false;
            return element.nodeType > 0 && element.nodeType < 13;
        },
        
        isTypeOf: function isTypeOf(element, type) {
            if (!this.isDOMNode(element)) return;
            for (var i = 0, len = nodeTypesMap.length; i < len; i++) {
                if (element.nodeType == nodeTypesMap[i][0] && (type | nodeTypesMap[i][1]) == type) return true;
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
                };
                
                if (element.dataset) return element.dataset[key];
                else return element.getAttribute("data-" + key);
            },
            
            set: function set(element, key, value) {
                if (element.dataset) element.dataset[key] = value;
                else element.setAttribute("data-" + key, value || "");
            },
            
            remove: function remove(element, key) {
                if (element.dataset) delete element.dataset[key];
                else element.removeAttribute("data-" + key);
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
    ]
})(lib);
(function(lib, undefined) {
    function NodeList(elements) {
        if (this == lib.dom) return new NodeList(elements);
        
        this.items = [];
        this.length = 0;
        
        if (!elements) return;
        
        elements = lib.array.toArray(elements);
        
        for (var i = 0; i < elements.length; i++) {
            if (elements[i].nodeType && lib.array.inArray([1, 9], elements[i].nodeType)) {
                this.length = this.push(elements[i]);
            }
        }
    };
    
    lib.extend(NodeList.prototype, {
        toString: function toString() {
            return this.items.join(", ");
        },
        
        valueOf: function valueOf() {
            return this;
        },
        
        length: 0,
        
        item: function item(index) {
            return this.items[index];
        },
        
        push: function push(node) {
            return this.length = this.items.push(node);
        },
        
        pop: function pop() {
            var node = this.items.pop();
            this.length = this.items.length;
            return node;
        },
        
        unshift: function unshift(node) {
            return this.length = this.items.unshift(node);
        },
        
        shift: function shift() {
            var node = this.items.shift();
            this.length = this.items.length;
            return node;
        },
        
        reverse: function reverse() {
            this.items.reverse();
            return this;
        },
        
        sort: function sort(callback) {
            this.items.sort(callback);
            return this;
        },
        
        splice: function splice() {
            var out = Array.prototype.splice.apply(this.items, arguments);
            clean.call(this);
            this.length = this.items.length;
            return new NodeList(out);
        },
        
        concat: function concat() {
            var out = this.items;
            for (var i = 0; i < arguments.length; i++) {
                if (arguments[i] instanceof NodeList) {
                    for (var j = 0; j < arguments[i].length; j++) {
                        out.push(arguments[i].item(j));
                    }
                }
            }
            return new NodeList(out);
        },
        
        subtract: function subtract() {
            var outPrev = this.items,
                outCurr = [];
            for (var i = 0; i < arguments.length; i++) {
                if (arguments[i] instanceof NodeList) {
                    for (var j = 0; j < outPrev.length; j++) {
                        var found = false;
                        for (var k = 0; k < arguments[i].length; k++) {
                            if (outPrev[j] == arguments[i].item(k)) {
                                found = true;
                            }
                        }
                        if (!found) outCurr.push(outPrev[j]);
                    }
                    outPrev = outCurr;
                    outCurr = [];
                }
            }
            return new NodeList(outPrev);
        },
        
        slice: function slice(begin, end) {
            var out = this.items.slice(begin, end);
            return new NodeList(out);
        },
        
        toArray: function toArray() {
            var out = new Array(this.items.length);
            for (var i = 0; i < this.items.length; i++) {
                out[i] = this.items[i];
            }
            return out;
        },
        
        forEach: function forEach(callback, thisObject) {
            lib.array.forEach(this.items, callback, thisObject)
        },
        
        every: function every(callback, thisObject) {
            return lib.array.every(this.items, callback, thisObject)
        },
        
        some: function some(callback, thisObject) {
            return lib.array.some(this.items, callback, thisObject);
        },
        
        filter: function filter(callback, thisObject) {
            return lib.array.filter(this.items, callback, thisObject);
        },
        
        map: function map(callback, thisObject) {
            return lib.array.map(this.items, callback, thisObject)
        },
        
        byTag: function byTag(tag) {
            var out = [];
            for (var i = 0; i < this.items.length; i++) {
                var elems = lib.dom.byTag(tag, this.items[i]);
                for (var j = 0; j < elems.length; j++) {
                    out.push(elems[j]);
                }
            }
            
            return new NodeList(out);
        },
        
        byClass: function byClass(klass, tag) {
            var out = [];
            for (var i = 0; i < this.items.length; i++) {
                var elems = lib.dom.byClass(klass, tag, this.items[i]);
                for (var j = 0; j < elems.length; j++) {
                    out.push(elems[j]);
                }
            }
            
            return new NodeList(out);
        }
    });
    
    function clean() {
        var out = [];
        for (var i = 0; i < this.items.length; i++) {
            if (this.items[i].nodeType && lib.array.inArray([1, 9], this.items[i].nodeType)) {
                out.push(this.items[i]);
            }
        }
        this.items = out;
    }
    
    lib.dom.NodeList = NodeList;
})(lib);
﻿(function(lib, undefined) {
    var event = {
        add: function(target, type, callback) {
            var _type = type.toLowerCase();
            this.initEventProperty(target, type);
            target.__events[type].callbacks[lib.guid(callback)] = callback;
            
            if (this.w3c) {
                target.addEventListener(type, callback, false);
            } else if (this.ie) {
                target.__events[type].handle = null;
                target.__events[type].IECallbacks = {};
                target.__events[type].hasAttribute = false;
                target.__events[type].supported = typeof target["on" + _type] == "object"
                                                 || typeof target["on" + _type] == "function";
                
                if (target.__events[type].supported) {
                    if (target["on" + _type] !== null) this.addIEAttributeEvent(target, type);
                    
                    var _callback = lib.bind(function() {
                        if (typeof callback.attributeEvent == "undefined") {
                            var event = fixIEEvent(lib.window.event, target);
                        } else {
                            var event = fixIEEvent(lib.window.event, null);
                        }
                        
                        return callback.apply(target, [event]);
                    }, this);
                    target.__events[type].IECallbacks[callback._guid] = _callback;
                    target.attachEvent("on" + type, _callback);
                } else {
                    target.__events[type].handle = function(event) {
                        this.event = extendIEEventSafe(this.event, event);
                        this.event = fixIEEvent(this.event);
                        return this.callback.apply(this.event.currentTarget, [this.event]);
                    };
                    
                    var _target = (target == lib.document) ? lib.document.documentElement : target;
                    if (typeof target.libEvent == "undefined") {
                        target.libEvent = 0;
                        if (target != _target) _target.libEvent = 0;
                    }
                    
                    _target.attachEvent("onpropertychange", function(event) {
                        if (event.propertyName == "libEvent") {
                            if (target.__events[type].handle.event
                                && target == target.__events[type].handle.event.currentTarget
                                && target.__events[type].handle.dispatched === false) {
                                target.__events[type].handle.dispatched = true;
                                return lib.bind(target.__events[type].handle, target.__events[type].handle)(event);
                            }
                        }
                    });
                }
            }
        },
        
        initEventProperty: function(target, type) {
            if (typeof target.__events == "undefined") target.__events = {};
            if (typeof target.__events[type] == "undefined") target.__events[type] = {};
            if (typeof target.__events[type].callbacks == "undefined") target.__events[type].callbacks = {};
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
            if (typeof type == "undefined") {
                for (type in target.__events) {
                    this.remove(target, type);
                }
            }
            
            if (typeof target.__events == "object" && typeof target.__events[type] == "object") {
                if (typeof callback == "function") {
                    if (this.w3c) {
                        target.removeEventListener(type, callback, false);
                    } else if (this.ie && target.__events[type].supported) {
                        var _callback = target.__events[type].IECallbacks[callback.__guid];
                        target.detachEvent("on" + type, _callback);
                        delete target.__events[type].IECallbacks[callback.__guid];
                    }
                    delete target.__events[type].callbacks[callback.__guid];
                } else {
                    for (i in target.__events[type].callbacks) {
                        this.remove(target, type, target.__events[type].callbacks[i]);
                    }
                }
            }
        },
        
        dispatch: function(target, type, properties) {
            if (this.w3c) {
                switch (this.events[type]) {
                    case this.types.mouse:
                        return this.dispatchMouseEvent(target, type, properties);
                        break;
                    case this.types.keyboard:
                        return this.dispatchKeyboardEvent(target, type, properties);
                        break;
                    case this.types.html:
                        return this.dispatchHTMLEvent(target, type, properties);
                        break;
                    case this.types.dom: // not implemented
                    case this.types.wheel: // not implemented
                    default:
                        return this.dispatchUIEvent(target, type, properties);
                        break;
                }
            } else if (this.ie) {
                return this.dispatchIEEvent(target, type, properties);
            }
        },
        
        dispatchMouseEvent: function(target, type, properties) {
            if (typeof properties == "undefined") var properties = {};
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
            if (typeof properties == "undefined") var properties = {};
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
            if (typeof event.initKeyboardEvent == "undefined" && event.initKeyEvent) {
                event.initKeyboardEvent = event.initKeyEvent;
            }
            
            event.initKeyboardEvent(type, eventProperties.bubbles, eventProperties.cancelable, lib.window,
                eventProperties.ctrlKey, eventProperties.altKey, eventProperties.shiftKey, eventProperties.metaKey,
                eventProperties.keyCode, eventProperties.charCode);
            lib.extend(event, customProperties);
            return target.dispatchEvent(event);
        },
        
        dispatchHTMLEvent: function(target, type, properties) {
            if (typeof properties == "undefined") var properties = {};
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
            if (typeof properties == "undefined") var properties = {};
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
            var _type = type.toLowerCase();
            if (typeof target.__events == "undefined") {
                if (typeof target["on" + _type] == "object" || typeof target["on" + _type] == "function") {
                    this.addIEAttributeEvent(target, type);
                } else {
                    return;
                }
            }
            
            if (typeof target.__events[type] == "undefined") return;
            
            properties = properties || {};
            if (target.__events[type].supported) {
                var event = document.createEventObject();
                lib.extend(event, properties);
                return target.fireEvent("on" + type, event);
            } else {
                var event = lib.extend(properties, {
                    target: target,
                    type: type,
                    currentTarget: target
                });
                
                while (target) {
                    if (target.__events && target.__events[type]) {
                        for (var i in target.__events[type].callbacks) {
                            if (typeof properties.safe == "boolean" && properties.safe === true) {
                                target.__events[type].handle.callback = target.__events[type].callbacks[i];
                                target.__events[type].handle.event = event;
                                target.__events[type].handle.dispatched = false;
                                
                                if (event.currentTarget == document) {
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
                    target = event.currentTarget = !event.cancelBubble && target.parentNode;
                }
                return !(event.returnValue === false);
            }
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
        event.currentTarget = (arguments[1] && arguments[1].nodeName)
                              ? arguments[1]
                              : (arguments[1] === null)
                                ? null : event.currentTarget;
        
        if (arguments[1] && arguments[1].nodeName && event.toElement && event.toElement.nodeName) {
            event.relatedTarget = (event.toElement == event.target) ? event.fromElement : event.toElement;
        }
        
        event.preventDefault = function() {
            event.returnValue = false;
        };
            
        event.stopPropagation = function() {
            event.cancelBubble = true;
        };
        
        return event;
    };
    
    function extendIEEventSafe(target) {
        var props = ["altKey", "attrChange", "attrName", "bubbles", "button", "cancelable", "charCode",
                    "clientX", "clientY", "ctrlKey", "currentTarget", "data", "detail", "eventPhase",
                    "fromElement", "handler", "keyCode", "layerX", "layerY", "metaKey", "newValue",
                    "offsetX", "offsetY", "originalTarget", "pageX", "pageY", "prevValue", "relatedNode",
                    "relatedTarget", "screenX", "screenY", "shiftKey", "srcElement", "target", "toElement",
                    "view", "wheelDelta", "which"];
        for (var i, k = 0; ++k < arguments.length;) {
            for (i in props) {
                if (!(typeof arguments[k][props[i]] == "undefined"))
                target[props[i]] = arguments[k][props[i]];
            }
        }
        
        target.originalEvent = arguments[1];
        return target;
    };
    
    lib.event = {
        add: lib.bind(event.add, event),
        remove: lib.bind(event.remove, event),
        dispatch: lib.bind(event.dispatch, event),
        support: testSupport,
        compat: {
            DOMAttrModified: DOMAttrModified
        }
    }
    
    function testSupport(type) {
        if (typeof type != "string") return null;
        switch (type) {
            case "DOMAttrModified":
                return testDOMAttrModified();
                break;
            default:
                return null;
                break;
        }
    };
    
    function testDOMAttrModified() {
        if (event.w3c) {
            var capable = false,
                div = document.createElement("div");
            div.addEventListener("DOMAttrModified", function(event) {
                if (event && event.target && event.target === div)
                    capable = true;
            }, false);
            div.style.display = "none";
            return capable;
        } else {
            return true;
        }
    };
    
    // Webkit DOMAttrModified workaround
    function DOMAttrModified(target, path) {
        if (!event.w3c) return;
        
        event.initEventProperty(target, "DOMAttrModified");
        if (typeof target.__events["DOMAttrModified"].oldProperties == "undefined")
            target.__events["DOMAttrModified"].oldProperties = {};
        
        var array = path.split("."),
            last = array[array.length -1];
        
        function find() {
            var newValue = target[array[0]];
            for (var i = 1; i < array.length; i++) {
                newValue = newValue[array[i]];
            }
            return newValue;
        }
        
        var guid = lib.guid(),
            prevValue = target.__events["DOMAttrModified"].oldProperties[guid] = find(),
            interval = lib.window.setInterval(function() {
            var newValue = find();
            if (prevValue !== newValue) {
                event.dispatch(target, "DOMAttrModified", {
                    MODIFICATION: 1,
                    ADDITION: 2,
                    REMOVAL: 3,
                    attrChange: 1,
                    attrName: path,
                    newValue: newValue,
                    prevValue: prevValue,
                    compat: {
                        stop: function() {
                            lib.window.clearInterval(interval);
                            delete target.__events["DOMAttrModified"].oldProperties[guid];
                        }
                    }
                });
                prevValue = newValue;
            }
        }, 15);
    };
})(lib);
(function(lib, undefined) {
    if (lib.isDOMReady) return;
    
    function onReady() {
        if (!lib.isDOMReady) {
            lib.isDOMReady = true;
            lib.event.dispatch(document, "DOMReady", { safe: true });
            lib.event.remove(lib.document, "libReady");
        }
    };
    
    if (document.readyState == "complete") { // already here!
        onReady();
    } else if (!window.opera && document.attachEvent) {
        // like IE
        
        // not an iframe...
        if (document.documentElement.doScroll && window == top) {
            (function() {
                try {
                    document.documentElement.doScroll("left");
                } catch(error) {
                    setTimeout(arguments.callee, 0);
                    return;
                }
                
                // and execute any waiting functions
                onReady();
            })();
        } else {
            // an iframe...
            document.attachEvent(
                "onreadystatechange",
                function() {
                    if (document.readyState == "complete") {
                        document.detachEvent("onreadystatechange", arguments.callee);
                        onReady();
                    }
                }
            );
        }
    } else if (document.readyState) {
        // like pre Safari
        (function() {
            if (/loaded|complete/.test(document.readyState)) {
                onReady();
            } else {
                setTimeout(arguments.callee, 0);
            }
        })();
    } else if (document.addEventListener) {
        // like Mozilla, Opera and recent webkit
        document.addEventListener( 
            "DOMContentLoaded",
            function() {
                document.removeEventListener("DOMContentLoaded", arguments.callee, false);
                onReady();
            },
            false
        );
    } else {
        throw new Error("Unable to bind lib ready listener to document.");
    }
})(lib);
(function(lib, undefined) {
    lib.dimensions = {
        CONTENT: 1,
        BORDER: 2,
        
        get: function get(element, boxType) {
            return {
                innerWidth: lib.window.innerWidth || lib.document.documentElement.offsetWidth,
                innerHeight: lib.window.innerHeight || lib.document.documentElement.offsetHeight,
                scrollWidth: null,
                scrollHeight: null,
                scrollX: lib.window.scrollX || lib.document.documentElement.scrollLeft,
                scrollY: lib.window.scrollY || lib.document.documentElement.scrollTop
            };
        },
        
        center: function center(element, referenceElement, direction) {
            
        },
        
        centerVertical: function centerVertical(element, referenceElement) {
            
        },
        
        centerHorizontal: function centerHorizontal(element, referenceElement) {
            
        }
    };
})(lib);
if (!window.opera) try { document.execCommand("BackgroundImageCache", false, true); } catch(e) {};
(function(lib, undefined) {
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
                    
                    if (Math.abs(z) < 1e-3) break; // if already got close enough
                    
                    x = x - z / bezierXDerivative(x);
                    i++;
                }
                return x;
            };
            
            return function findYFor(t) {
                return bezierY(findXFor(t));
            }
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
            return lib.window.requestAnimationFrame
                || lib.window.mozRequestAnimationFrame
                || lib.window.webkitRequestAnimationFrame
                || lib.window.msRequestAnimationFrame
                || lib.window.oRequestAnimationFrame;
        },
        
        run: function run(from, to, duration, easing, stepCallback, endCallback) {
            var startTime,
                intervalHandle,
                easingFunction,
                isFunctionStepCallback = lib.util.isFunction(stepCallback),
                isFunctionEndCallback = lib.util.isFunction(endCallback),
                requestAnimationFrame = this.getRequestAnimationFrame();
            
            if (typeof easing == "string" && this.easing[easing]) {
                easingFunction = this.bezier.apply(this, this.easing[easing]);
            } else if (lib.util.isArray(easing) && easing.length == 4) {
                easingFunction = this.bezier.apply(this, easing);
            } else {
                easingFunction = this.bezier.apply(this, this.easing.ease);
            }
            
            function intervalFunction() {
                if (!startTime) {
                    startTime = +new Date;
                    if (requestAnimationFrame) requestAnimationFrame(intervalFunction);
                    return;
                }
                
                var time = +new Date,
                    deltaTime = time - startTime,
                    fraqTime = easingFunction(deltaTime / duration),
                    end = (duration - deltaTime < 13) ? true : false, // --OMG-OPTIMIZE
                    delta = (to - from) * fraqTime,
                    delta = from + delta;
                    //delta = end ? to : delta <= to ? delta : to;
                    delta = end ? to : delta;
                if (isFunctionStepCallback) stepCallback.call(this, delta);
                if (end) {
                    if (isFunctionEndCallback) endCallback.call(this, delta);
                    if (!requestAnimationFrame) lib.window.clearInterval(intervalHandle);
                    return;
                } else {
                    if (requestAnimationFrame) requestAnimationFrame(intervalFunction);
                }
            }
            
            if (requestAnimationFrame) {
                requestAnimationFrame(intervalFunction);
            } else {
                intervalHandle = lib.window.setInterval(intervalFunction, 13);
            }
        }
    };
})(lib);
(function(lib, undefined) {
    function Widget(element) {
        this.__bound = {};
        
        if (lib.dom.isTypeOf(element, lib.dom.ELEMENT_NODE)) {
            this.element = element;
            this.element.__widgets = {};
            this.element.__widgets[lib.util.getType(this)] = this;
        }
    };
    
    lib.extend(Widget.prototype, {
        bind: function bind(method) {
            this.__bound[method] = this[method];
        }
    });
    
    function WidgetRunner(widgetConstructor, bind) {
        this.widgetConstructor = widgetConstructor;
        this.items = [];
        this.length = 0;
        this.name = lib.util.getFunctionName(this.widgetConstructor);
    };
    
    lib.extend(WidgetRunner.prototype, {
        run: function run(elements) {
            elements = lib.util.isArray(elements) ? lib.array.toArray(elements) : [elements];
            lib.array.forEach(elements, lib.bind(function(element) {
                this.items.push(new this.widgetConstructor(element));
                this.length++;
            }, this));
        },
        
        item: function item(n) {
            return this.items[n] || null;
        },
        
        call: function call(element, method) {
            var args = lib.array.toArray(arguments);
            args.shift();
            args.shift();
            return this.apply(element, method, args);
        },
        
        apply: function apply(element, method, args) {
            var widget = lib.widget.get(element, this.name),
                method = widget.__bound[method];
            if (lib.util.isFunction(method)) return method.apply(widget, args);
        }
    });
    
    lib.widget = {
        Widget: Widget,
        
        create: function create(constructor, prototype) {
            lib.util.inherits(constructor, Widget);
            lib.extend(constructor.prototype, prototype);
            return new WidgetRunner(constructor);
        },
        
        get: function get(element, name) {
            if (lib.dom.isTypeOf(element, lib.dom.ELEMENT_NODE) && element.__widgets) {
                name = (name instanceof WidgetRunner) ? name.name : name;
                return element.__widgets[name] || null;
            } else {
                return null;
            }
        }
    };
    
})(lib);
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
