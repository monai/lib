(function(lib, undefined) {
    lib.dom = {
        byId: function byId(id) {
            return lib.document.getElementById(id);
        },
        
        byTag: function byTag(name, element) {
            return (element || lib.document).getElementsByTagName(name);
        },
        
        byQuery: function byQuery(query, element) {
            return (element || lib.document).querySelector(name);
        },
        
        byQueryAll: function byQueryAll(query, element) {
            return (element || lib.document).querySelectorAll(name);
        },
        
        byClass: function byClass(klass, tag, element) {
            if (typeof tag == "object" && typeof element == "undefined") {
                element = tag;
                tag = undefined;
            }
            
            if (lib.document.getElementsByClassName) {
                var elements = (element || lib.document).getElementsByClassName(klass),
                    nodeName = tag ? new RegExp("\\b" + tag + "\\b", "i") : null,
                    returnElements = [];
                for (var i = 0; i < elements.length; i++)
                    if (!nodeName || nodeName.test(elements[i].nodeName))
                        returnElements.push(elements[i]);
                
                return returnElements;
            } else {
                tag = tag || "*";
                element = element || lib.document;
                
                if (lib.document.evaluate) {
                    var classes = klass.split(" "),
                        classesToCheck = "",
                        xhtmlNamespace = "http://www.w3.org/1999/xhtml",
                        namespaceResolver = (lib.document.documentElement.namespaceURI === xhtmlNamespace)
                                            ? xhtmlNamespace : null,
                        returnElements = [],
                        elements,
                        node;
                    
                    for (var i = 0; i < classes.length; i++)
                        classesToCheck += "[contains(concat(' ', @class, ' '), ' " + classes[i] + " ')]";
                    
                    try {
                        elements = lib.document.evaluate(".//" + tag + classesToCheck, element, namespaceResolver, 0, null);
                    } catch (e) {
                        elements = lib.document.evaluate(".//" + tag + classesToCheck, element, null, 0, null);
                    }
                    
                    while (node = elements.iterateNext())
                        returnElements.push(node);
                    
                    return returnElements;
                } else {
                    var classes = klass.split(" "),
                        classesToCheck = [],
                        elements = (tag === "*" && element.all) ? element.all : element.getElementsByTagName(tag),
                        current,
                        returnElements = [],
                        match;
                    for (var i = 0; i < classes.length; i++)
                        classesToCheck.push(new RegExp("(^|\\s)" + classes[i] + "(\\s|$)"));
                    
                    for (var i = 0; i < elements.length; i++) {
                        match = false;
                        for (var j = 0; j < classesToCheck.length; j++){
                            match = classesToCheck[j].test(elements[i].className);
                            if (!match)
                                break;
                        }
                        if (match)
                            returnElements.push(elements[i]);
                    }
                    
                    return returnElements;
                }
            }
        },
        
        parent: function parent(element, klass, name) {
            klass = klass && new RegExp("(^|\\s)" + klass + "(\\s|$)");
            name = name && name.toUpperCase();
            
            while ((element = element.parentNode)
                && (klass && !klass.test(element.className)
                    || name && name != element.nodeName));
            
            return element;
        },
        
        isChild: function isChild(element, parent) {
            while ((element = element.parentNode)) {
                if (element === parent) return true;
            }
            return false;
        },
        
        prev: function prev(element, klass, name) {
            klass = klass && new RegExp("(^|\\s)" + klass + "(\\s|$)");
            name = name && name.toUpperCase();
            
            while ((element = element.previousSibling)
                && (element.nodeType != 1
                    || klass && !klass.test(element.className)
                    || name && name != element.nodeName));
            
            return element;
        },
        
        next: function next(element, klass, name) {
            klass = klass && new RegExp("(^|\\s)" + klass + "(\\s|$)");
            name = name && name.toUpperCase();
            
            while ((element = element.nextSibling)
                && (element.nodeType != 1
                    || klass && !klass.test(element.className)
                    || name && name != element.nodeName));
            
            return element;
        },
        
        create: function create(html) {
            var d = lib.document.createElement("div"), element;
            d.innerHTML = html;
            element = d.firstChild;
            d = null;
            return this.remove(element);
        },
        
        remove: function remove(element) {
            var p = this.parent(element);
            return p && p.removeChild(element);
        },
        
        before: function before(element, before) {
            var p = this.parent(before);
            return p && p.insertBefore(element, before);
        },
        
        after: function after(element, after) {
            var p = this.parent(after);
            return p && p.insertBefore(element, after.nextSibling);
        },
        
        hasClass: function hasClass(element, klass) {
            return (element.classList && element.classList.contains)
                    ? element.classList.contains(klass)
                    : new RegExp("(^|\\s)" + klass + "(\\s|$)").test(element.className);
        },
        
        addClass: function addClass(element, klass) {
            if (!this.hasClass(element, klass)) {
                if (element.classList && element.classList.add) element.classList.add(klass);
                else element.className += (element.className ? " " : "") + klass;
            }
            return element;
        },
        
        removeClass: function removeClass(element, klass) {
            if (element.classList && element.classList.remove) element.classList.remove(klass);
            else element.className = element.className.replace(new RegExp("(^|\\s)" + klass + "(\\s|$)"), "$2");
            return element;
        },
        
        toggleClass: function toggleClass(element, klass) {
            if (element.classList && element.classList.toggle) {
                element.classList.toggle(klass);
            } else {
                if (this.hasClass(element, klass)) {
                    return this.removeClass(element, klass);
                } else {
                    return this.addClass(element, klass);
                }
            }
        },
        
        getStyle: function getStyle(element, property, pseudoElement) {
            var value = null, inline = false;
            if (lib.window && lib.window.getComputedStyle) {
                value = lib.window.getComputedStyle(element, pseudoElement || null)[property];
            } else if (element.currentStyle) {
                value = element.currentStyle[property];
            } else {
                value = element.style[property];
                inline = true;
            }
            
            if (!value && !inline) {
                return element.style[property];
            } else {
                return value;
            }
        },
        
        ELEMENT_NODE: 1,
        ATTRIBUTE_NODE: 2,
        TEXT_NODE: 4,
        CDATA_SECTION_NODE: 8,
        ENTITY_REFERENCE_NODE: 16,
        ENTITY_NODE: 32,
        PROCESSING_INSTRUCTION_NODE: 64,
        COMMENT_NODE: 128,
        DOCUMENT_NODE: 256,
        DOCUMENT_TYPE_NODE: 512,
        DOCUMENT_FRAGMENT_NODE: 1024,
        NOTATION_NODE: 2048,
        
        isDOMNode: function isDOMNode(element) {
            if (!(element || "nodeType" in element || typeof element.nodeType == "number")) return false;
            return element.nodeType > 0 && element.nodeType < 13;
        },
        
        isTypeOf: function isTypeOf(element, type) {
            if (!this.isDOMNode(element)) return;
            for (var i = 0, len = nodeTypesMap.length; i < len; i++) {
                if (element.nodeType == nodeTypesMap[i][0] && (type | nodeTypesMap[i][1]) == type) return true;
            }
            return false;
        },
        
        dataset: {
            get: function get(element, key) {
                if (lib.util.isArray(key)) {
                    var values = {};
                    lib.array.forEach(key, function(key) {
                        values[key] = lib.dom.dataset.get(element, key);
                    });
                    return values;
                };
                
                if (element.dataset) return element.dataset[key];
                else return element.getAttribute("data-" + key);
            },
            
            set: function set(element, key, value) {
                if (element.dataset) element.dataset[key] = value;
                else element.setAttribute("data-" + key, value || "");
            },
            
            remove: function remove(element, key) {
                if (element.dataset) delete element.dataset[key];
                else element.removeAttribute("data-" + key);
            }
        }
    };
    
    var nodeTypesMap = [
        [1, 1],
        [2, 2],
        [3, 4],
        [4, 8],
        [5, 16],
        [6, 32],
        [7, 64],
        [8, 128],
        [9, 256],
        [10, 512],
        [11, 1024],
        [12, 2048]
    ]
})(lib);
