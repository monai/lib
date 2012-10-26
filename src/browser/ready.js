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
