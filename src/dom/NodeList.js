(function(lib, undefined) {
    /*global lib*/
    "use strict";
    
    function NodeList(elements) {
        if (this === lib.dom) {
            return new NodeList(elements);
        }
        
        if (!elements) {
            return;
        }
        
        if (lib.dom.isTypeOf(elements, lib.dom.ELEMENT_NODE | lib.dom.DOCUMENT_NODE)) {
            this.push(elements);
        } else if (elements instanceof NodeList) {
            return elements;
        } else {
            elements = lib.array.toArray(elements);
            lib.array.forEach(elements, lib.bind(function(element) {
                if (lib.dom.isTypeOf(element, lib.dom.ELEMENT_NODE | lib.dom.DOCUMENT_NODE)) {
                    this.push(element);
                }
            }, this));
        }
    }
    
    lib.util.inherits(NodeList, Array);
    
    lib.extend(NodeList.prototype, {
        toString: function toString() {
            return this.join(", ");
        },
        
        valueOf: function valueOf() {
            return this;
        },
        
        item: function item(index) {
            return this[index];
        },
        
        /* array extensions */
        concat: function concat() {
            var args = lib.array.toArray(arguments);
            lib.array.forEach(args, lib.bind(function(arg) {
                lib.array.forEach(arg, lib.bind(function(elem) {
                    this.push(elem);
                }, this));
            }, this));
        },
        
        slice: function slice() {
            return new NodeList(Array.prototype.slice.apply(this, arguments));
        },
        
        toArray: function toArray() {
            return lib.array.toArray(this);
        },
        
        indexOf: function indexOf(object, fromIndex) {
            return lib.array.indexOf(this, object, fromIndex);
        },
        
        lastIndexOf: function lastIndexOf(object, fromIndex) {
            return lib.array.lastIndexOf(this, object, fromIndex);
        },
        
        inArray: function inArray(object) {
            return lib.array.inArray(this, object);
        },
        
        forEach: function forEach(callback, thisObject) {
            lib.array.forEach(this, callback, thisObject);
        },
        
        every: function every(callback, thisObject) {
            return lib.array.every(this, callback, thisObject);
        },
        
        some: function some(callback, thisObject) {
            return lib.array.some(this, callback, thisObject);
        },
        
        filter: function filter(callback, thisObject) {
            return new NodeList(lib.array.filter(this, callback, thisObject));
        },
        
        map: function map(callback, thisObject) {
            return new NodeList(lib.array.map(this, callback, thisObject));
        },
        
        reduce: function reduce(callback, initialValue) {
            return lib.array.reduce(this, callback, initialValue);
        },
        
        reduceRight: function reduceRight(callback, initialValue) {
            return lib.array.reduceRight(this, callback, initialValue);
        },
        
        /* dom helpers */
        byTag: function byTag(tag) {
            var out = new NodeList();
            this.forEach(function(elem) {
                out.concat(lib.dom.byTag(tag, elem));
            });
            return out;
        },
        
        byQuery: function byQuery(query) {
            var out = null;
            this.forEach(function(elem) {
                if (!out) {
                    out = lib.dom.byQuery(query, elem);
                }
            });
            return out;
        },
        
        byQueryAll: function byQueryAll(query) {
            var out = new NodeList();
            this.forEach(function(elem) {
                out.concat(lib.dom.byQueryAll(query, elem));
            });
            return out;
        },
        
        byClass: function byClass(klass, tag) {
            var out = new NodeList();
            this.forEach(function(elem) {
                out.concat(lib.dom.byClass(klass, tag, elem));
            });
            return out;
        },
        
        find: function find(klass, tag) {
            var nodeName, out;
            out = this;
            if (klass) {
                out = out.filter(function(elem) {
                    return lib.dom.hasClass(elem, klass);
                });
            }
            if (tag) {
                nodeName = tag && tag.toUpperCase();
                out = out.filter(function(elem) {
                    return nodeName === elem.nodeName;
                });
            }
            return out;
        }
    });
        
    lib.dom.NodeList = NodeList;
})(lib);
