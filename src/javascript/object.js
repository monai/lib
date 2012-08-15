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
