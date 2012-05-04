(function(lib, undefined) {
    function NodeList(elements) {
        if (this == lib.dom) return new NodeList(elements);
        
        this.items = [];
        this.length = 0;
        
        if (!elements) return;
        
        elements = lib.array.toArray(elements);
        
        for (var i = 0; i < elements.length; i++) {
            if (elements[i].nodeType && lib.array.inArray([1, 9], elements[i].nodeType)) {
                this.length = this.push(elements[i]);
            }
        }
    };
    
    lib.extend(NodeList.prototype, {
        toString: function toString() {
            return this.items.join(", ");
        },
        
        valueOf: function valueOf() {
            return this;
        },
        
        length: 0,
        
        item: function item(index) {
            return this.items[index];
        },
        
        push: function push(node) {
            return this.length = this.items.push(node);
        },
        
        pop: function pop() {
            var node = this.items.pop();
            this.length = this.items.length;
            return node;
        },
        
        unshift: function unshift(node) {
            return this.length = this.items.unshift(node);
        },
        
        shift: function shift() {
            var node = this.items.shift();
            this.length = this.items.length;
            return node;
        },
        
        reverse: function reverse() {
            this.items.reverse();
            return this;
        },
        
        sort: function sort(callback) {
            this.items.sort(callback);
            return this;
        },
        
        splice: function splice() {
            var out = Array.prototype.splice.apply(this.items, arguments);
            clean.call(this);
            this.length = this.items.length;
            return new NodeList(out);
        },
        
        concat: function concat() {
            var out = this.items;
            for (var i = 0; i < arguments.length; i++) {
                if (arguments[i] instanceof NodeList) {
                    for (var j = 0; j < arguments[i].length; j++) {
                        out.push(arguments[i].item(j));
                    }
                }
            }
            return new NodeList(out);
        },
        
        subtract: function subtract() {
            var outPrev = this.items,
                outCurr = [];
            for (var i = 0; i < arguments.length; i++) {
                if (arguments[i] instanceof NodeList) {
                    for (var j = 0; j < outPrev.length; j++) {
                        var found = false;
                        for (var k = 0; k < arguments[i].length; k++) {
                            if (outPrev[j] == arguments[i].item(k)) {
                                found = true;
                            }
                        }
                        if (!found) outCurr.push(outPrev[j]);
                    }
                    outPrev = outCurr;
                    outCurr = [];
                }
            }
            return new NodeList(outPrev);
        },
        
        slice: function slice(begin, end) {
            var out = this.items.slice(begin, end);
            return new NodeList(out);
        },
        
        toArray: function toArray() {
            var out = new Array(this.items.length);
            for (var i = 0; i < this.items.length; i++) {
                out[i] = this.items[i];
            }
            return out;
        },
        
        forEach: function forEach(callback, thisObject) {
            lib.array.forEach(this.items, callback, thisObject)
        },
        
        every: function every(callback, thisObject) {
            return lib.array.every(this.items, callback, thisObject)
        },
        
        some: function some(callback, thisObject) {
            return lib.array.some(this.items, callback, thisObject);
        },
        
        filter: function filter(callback, thisObject) {
            return lib.array.filter(this.items, callback, thisObject);
        },
        
        map: function map(callback, thisObject) {
            return lib.array.map(this.items, callback, thisObject)
        },
        
        byTag: function byTag(tag) {
            var out = [];
            for (var i = 0; i < this.items.length; i++) {
                var elems = lib.dom.byTag(tag, this.items[i]);
                for (var j = 0; j < elems.length; j++) {
                    out.push(elems[j]);
                }
            }
            
            return new NodeList(out);
        },
        
        byClass: function byClass(klass, tag) {
            var out = [];
            for (var i = 0; i < this.items.length; i++) {
                var elems = lib.dom.byClass(klass, tag, this.items[i]);
                for (var j = 0; j < elems.length; j++) {
                    out.push(elems[j]);
                }
            }
            
            return new NodeList(out);
        }
    });
    
    function clean() {
        var out = [];
        for (var i = 0; i < this.items.length; i++) {
            if (this.items[i].nodeType && lib.array.inArray([1, 9], this.items[i].nodeType)) {
                out.push(this.items[i]);
            }
        }
        this.items = out;
    }
    
    lib.dom.NodeList = NodeList;
})(lib);
