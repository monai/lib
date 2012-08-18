(function(window, undefined) {
    "use strict";
    
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
            if (!object) {
                return ++lib.guid.id;
            }
            if (!object.__guid) {
                object.__guid = lib.guid.id++;
            }
            return object.__guid;
        }
    };
    
    lib.log.output = [];
    lib.guid.id = 1;
    
    if (!window.lib) {
        window.lib = lib;
    }
    if (!window.log) {
        window.log = log;
    }
})(window);
