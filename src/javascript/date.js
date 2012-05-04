(function(lib, undefined) {
    lib.date = {
        parseISOString: function parseISOString(str) {
            var parsed = Date.parse(str);
            if (!isNaN(parsed)) return new Date(parsed);
            
            var match = str.match(/\d+/g),
                date = new Date(match[0], parseInt(match[1], 10) - 1, match[2], match[3], match[4], match[5], match[6]),
                offset = (new Date()).getTimezoneOffset(),
                offsetAbs = Math.abs(offset),
                offsetSign = (offsetAbs == offset) ? -1 : 1,
                offsetHours = (offsetAbs - (offsetAbs % 60)) / 60,
                offsetMinutes = offsetAbs - offsetHours * 60;
            date.setHours(date.getHours() + offsetHours * offsetSign);
            date.setMinutes(date.getMinutes() + offsetMinutes * offsetSign);
            return date;
        },
        
        toISOString: function toISOString(date) {
            if ("toISOString" in date) {
                return date.toISOString();
            } else {
                return date.getUTCFullYear() + "-"
                     + lib.util.padding(date.getUTCMonth() + 1, 0, 2) + "-"
                     + lib.util.padding(date.getUTCDate(), 0, 2) + "T"
                     + lib.util.padding(date.getUTCHours(), 0, 2) + ":"
                     + lib.util.padding(date.getUTCMinutes(), 0, 2) + ":"
                     + lib.util.padding(date.getUTCSeconds(), 0, 2) + "."
                     + lib.util.padding(date.getUTCMilliseconds(), 0, 3) + "Z";
            }
        }
    };
})(lib);
