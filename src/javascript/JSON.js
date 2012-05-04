(function(lib, undefined) {
    lib.JSON = {
        parse: function parse(str) {
            if (JSON && "parse" in JSON) {
                return JSON.parse(str);
            } else {
                if (typeof str != "string" && typeof str != "undefined") return str;
                
                var canEval = (/^[\],:{}\s]*$/.test(
                    str.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, "@")
                    .replace(/\"[^\"\\\n\r]*\"|true|false|null|-?\d+(?:\.\d*)?(:?[eE][+\-]?\d+)?/g, "]")
                    .replace(/(?:^|:|,)(?:\s*\[)+/g, "")
                ));
                if (canEval) {
                    return (new Function("return (" + str + ")"))();
                } else {
                    throw new SyntaxError("Invalid JSON");
                }
            }
        },
        
        stringify: function stringify(object) {
            function stringify(object) {
                if (lib.util.getType(object) == "array") {
                    var type = {
                        start : "[",
                        end : "]",
                        showKeys : false
                    };
                } else {
                    var type = {
                        start : "{",
                        end : "}",
                        showKeys : true
                    };
                }
                
                var serial = [type.start],
                    len = 1,
                    dataType,
                    notFirst = false;
                
                for (var key in object) {
                    dataType = lib.util.getType(object[key]);
                    
                    if (dataType != "undefined") {
                        if (notFirst) {
                            serial[len++] = ",";
                        }
                        notFirst = true;
                        
                        if (type.showKeys) {
                            serial[len++] = "\"";
                            serial[len++] = key;
                            serial[len++] = "\"";
                            serial[len++] = ":";
                        }
                        
                        switch (dataType) {
                            case "Function":
                                throw new TypeError("Cannot stringify function to JSON");
                                break;
                            case "String":
                            default:
                                serial[len++] = "\"";
                                serial[len++] = object[key];
                                serial[len++] = "\"";
                                break;
                            case "Number":
                            case "Boolean":
                                serial[len++] = object[key];
                                break;
                            case "Object":
                            case "Array":
                                serial[len++] = stringify(object[key]);
                                break;
                            case "null":
                                serial[len++] = null;
                                break;
                        }
                    }
                }
                serial[len++] = type.end;
                return serial.join("");
            }
            
            var type = lib.util.getType(object);
            
            if (type == "Object" || type == "Array") {
                return stringify(object);
            } else {
                throw new TypeError("Cannot stringify function to JSON");
            }
        }
    };
})(lib);
