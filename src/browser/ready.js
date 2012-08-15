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
                    if (document.readyState === "complete") {
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
