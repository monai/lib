/*! lib - A JavaScript Library - http://github.com/monai/lib | MIT license */

(function(window, undefined) {
    "use strict";
    
    var lib, readyQueue;
    
    function log() {
        try {
            window.console.log.apply(window.console, arguments)
        } catch (ex) {
            var args;
            
            if (!log.output) {
                log.output = [];
            }
            
            args = Array.prototype.slice.call(arguments, 0);
            args = args.join(", ");
            log.output.push(args);
            
            window.clearTimeout(log.timer);
            log.timer = window.setTimeout(function () {
                var t = log.output.join("\r\n");
                log.output = [];
                alert(t);
            }, 1000);
        }
    }
    
    function inspect(object) {
        var o = [];
        for (var i in object) {
            if (Object.prototype.hasOwnProperty.call(object, i)) {
                o.push([i, ": ", object[i]].join(""));
            }
        }
        return o.join("\r\n");
    }
    
    readyQueue = [];
    
    lib = {
        log: log,
        
        inspect: inspect,
        
        window: window,
        
        document: window && window.document,
        
        isReady: false,
        
        ready: function ready(callback) {
            if (callback === undefined) {
                this.isReady = true;
                for (var i = 0, l = readyQueue.length; i < l; i++) {
                    readyQueue[i].call(this.window);
                }
                readyQueue.length = 0;
            } else if (typeof callback === "function") {
                if (!this.isReady) {
                    readyQueue.push(callback);
                } else {
                    callback.call(this.window);
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
                object.__guid = ++lib.guid.id;
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
            if (object === undefined) {
                return "undefined";
            } else if (object === null) {
                return "null";
            } else if (object === true || object === false) {
                return "boolean";
            } else if (typeof object === "string") {
                return "string";
            } else if (typeof object === "number") {
                return "number";
            } else if (string === "[object Arguments]" || !!(op.hasOwnProperty.call(object, "callee"))) {
                return "Arguments";
            } else {
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
            var name = func.toString();
            if (/^function (\S+?)\(/m.test(name)) {
                return RegExp.$1;
            }
            return undefined;
        },
        
        getConstructorName: function getConstructorName(object) {
            if (object && object.constructor) {
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
                while (/\s/.test(str.charAt(--i))) {};
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
                while (/\s/.test(str.charAt(--i))) {};
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
                   name && name !== element.nodeName)) {};
            
            return element;
        },
        
        next: function next(element, klass, name) {
            /*jshint curly:false*/
            
            name = name && name.toUpperCase();
            
            while ((element = element.nextSibling) &&
                   (element.nodeType !== 1 ||
                   klass && !this.hasClass(element, klass) ||
                   name && name !== element.nodeName)) {};
            
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
            var p = element.parentNode;
            return p && p.removeChild(element);
        },
        
        before: function before(element, ref) {
            var p = ref.parentNode;
            return p && p.insertBefore(element, ref);
        },
        
        after: function after(element, ref) {
            var p = ref.parentNode;
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
            var refLeft, refTop, left, top, width, height;
            refLeft = ("x" in reference) ? reference.x : reference.left;
            refTop = ("y" in reference) ? reference.y : reference.top;
            
            if ("x" in dimensions && "y" in dimensions) {
                return {
                    x: dimensions.x - refLeft,
                    y: dimensions.y - refTop
                }
            } else {
                left = dimensions.left - refLeft;
                top = dimensions.top - refTop;
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
