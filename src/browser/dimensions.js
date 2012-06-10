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
