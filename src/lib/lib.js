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
