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
