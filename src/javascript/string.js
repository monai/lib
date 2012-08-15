(function(lib, undefined) {
    /*global lib*/
    "use strict";
    
    lib.string = {
        trim: function trim(str) {
            /*jshint curly:false*/
            
            if ("trim" in String) {
                return String.trim(str);
            } else {
                str = str.replace(/^\s\s*/, "");
                var i = str.length;
                while (/\s/.test(str.charAt(--i)));
                return str.slice(0, i + 1);
            }
        },
        
        trimLeft: function trimLeft(str) {
            if ("trimLeft" in String) {
                return String.trimLeft(str);
            } else {
                return str.replace(/^\s\s*/, "");
            }
        },
        
        trimRight: function trimRight(str) {
            /*jshint curly:false*/
            
            if ("trimRight" in String) {
                return String.trimRight(str);
            } else {
                var i = str.length;
                while (/\s/.test(str.charAt(--i)));
                return str.slice(0, i + 1);
            }
        },
        
        padding: function padding(str, pad, length) {
            if (typeof str !== "string") {
                str = str.toString();
            }
            
            var absLength = Math.abs(length);
            if (str.length >= absLength) {
                return str;
            }
            
            var prepend = (absLength === length) ? true : false,
                out = new Array(absLength - str.length);
            
            for (var i = 0, len = out.length; i < len; i++) {
                out[i] = pad;
            }
            
            if (prepend) {
                out.push(str);
            } else {
                out.unshift(str);
            }
            return out.join("");
        },
        
        format: function format(str, args) {
            /*jshint unused:false*/
            return str.replace(/\{(\d+)\}/g, function(s, n) {
                return args[parseInt(n, 10)];
            });
        },
        
        camelToDash: function camelToDash(str) {
            return str.replace(/[A-Z]/g, function(match) { return "-" + match.toLowerCase(); });
        },
        
        dashToCamel: function dashToCamer(str) {
            return str.replace(/-(.)/g, function(match) { return match[1].toUpperCase(); });
        }
    };
})(lib);
