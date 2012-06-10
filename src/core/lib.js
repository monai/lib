(function(window, undefined) {
    var ua = navigator.userAgent.toLowerCase(),
        
        log = function log() {
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
            
            window: window, // for legacy compatibility
            
            document: window && window.document || document,
            
            isReady: false,
            
            ready: function(callback) {
                if (typeof callback != "function") return;
                if (!lib.isReady) {
                    lib.event.add(document, "libReady", lib.bind(callback, window));
                } else {
                    callback();
                }
            },
            
            env: function env() {
                var nanArray = [0, NaN],
                    opera = (/opera[\s\/]([\w\.]+)/.exec(ua) || nanArray)[1],
                    ie = opera ? NaN : (/msie ([\w\.]+)/.exec(ua) || nanArray)[1],
                    gecko = (/rv:([\w\.]+).*gecko\//.exec(ua) || nanArray)[1],
                    webkit = (/applewebkit\/([\w\.]+)/.exec(ua) || nanArray)[1],
                    khtml = (/khtml\/([\w\.]+)/.exec(ua) || nanArray)[1];
                
                return {
                    gecko   : parseFloat(gecko),
                    ie      : parseFloat(ie),
                    opera   : parseFloat(opera),
                    webkit  : parseFloat(webkit),
                    khtml   : parseFloat(khtml),
                    version : ie || gecko || webkit || opera || khtml,
                    standardsMode : this.d.compatMode != "BackCompat" && (!ie || ie >= 6)
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
    
    (function() {
        if (lib.isReady) return;
        
        function onReady() {
            if (!lib.isReady) {
                lib.isReady = true;
                lib.event.dispatch(document, "libReady", {safe: true});
            }
        };
        
        if (document.readyState == "complete") { // already here!
            onReady();
        } else if (lib.env.ie && document.attachEvent) {
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
    })();
})(window);
