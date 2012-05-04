(function(lib, undefined) {
    lib.object = {
        keys: function keys(object) {
            if ("keys" in Object) {
                return Object.keys(object);
            } else {
                var keys = [];
                for (var i in object) keys.push(i);
                return keys;
            }
        },
        
        createFromTemplate: function createFromTemplate(template, object) {
            object = (object) ? object : {};
            var path = template.split(".");
            
            (function iterate(parent, path) {
                if (!parent[path[0]]) parent[path[0]] = {};
                if (path.length > 1) iterate(parent[path[0]], path.splice(1));
            })(object, path);
            
            return object;
        },
        
        subtract: function subtract(minuend, subtrahend) {
            var difference = {};
            for (var i in minuend) {
                if (typeof subtrahend[i] == "undefined") {
                    difference[i] = minuend[i];
                }
            }
            return difference;
        }
    };
})(lib);
