(function(lib, undefined) {
    lib.dimensions = {
        CONTENT: 1,
        BORDER: 2,
        
        get: function get(element, boxType) {
            return {
                innerWidth: window.innerWidth || document.documentElement.offsetWidth,
                innerHeight: window.innerHeight || document.documentElement.offsetHeight,
                scrollWidth: null,
                scrollHeight: null,
                scrollX: window.scrollX || document.documentElement.scrollLeft,
                scrollY: window.scrollY || document.documentElement.scrollTop
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
