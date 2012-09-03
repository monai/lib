(function(lib, undefined) {
    /*global lib*/
    "use strict";
    
    lib.dom = {
        byId: function byId(id) {
            return lib.document.getElementById(id);
        },
        
        byTag: function byTag(name, element) {
            var elems = (element || lib.document).getElementsByTagName(name);
            return lib.dom.NodeList(elems);
        },
        
        byQuery: function byQuery(query, element) {
            return (element || lib.document).querySelector(query);
        },
        
        byQueryAll: function byQueryAll(query, element) {
            var elems = (element || lib.document).querySelectorAll(query);
            return lib.dom.NodeList(elems);
        },
        
        byClass: function byClass(klass, tag, element) {
            var i, elements, nodeName, returnElements,
                classes, classesToCheck, xhtmlNamespace, namespaceResolver, node, match;
            
            if (typeof tag === "object" && typeof element === "undefined") {
                element = tag;
                tag = undefined;
            }
            
            if (lib.document.getElementsByClassName) {
                elements = (element || lib.document).getElementsByClassName(klass);
                nodeName = tag && tag.toUpperCase();
                returnElements = [];
                for (i = 0; i < elements.length; i++) {
                    if (nodeName && nodeName !== elements[i].nodeName) {
                        continue;
                    }
                    returnElements.push(elements[i]);
                }
                
                return lib.dom.NodeList(returnElements);
            } else {
                tag = tag || "*";
                element = element || lib.document;
                
                if (lib.document.evaluate) {
                    classes = klass.split(" ");
                    classesToCheck = "";
                    xhtmlNamespace = "http://www.w3.org/1999/xhtml";
                    namespaceResolver = (lib.document.documentElement.namespaceURI === xhtmlNamespace) ?
                                            xhtmlNamespace : null;
                    returnElements = [];
                    
                    for (i = 0; i < classes.length; i++) {
                        classesToCheck += "[contains(concat(' ', @class, ' '), ' " + classes[i] + " ')]";
                    }
                    
                    try {
                        elements = lib.document.evaluate(".//" + tag + classesToCheck, element, namespaceResolver, 0, null);
                    } catch (e) {
                        elements = lib.document.evaluate(".//" + tag + classesToCheck, element, null, 0, null);
                    }
                    
                    /*jshint boss:true*/
                    while (node = elements.iterateNext()) {
                        returnElements.push(node);
                    }
                    
                    return lib.dom.NodeList(returnElements);
                } else {
                    classes = klass.split(" ");
                    classesToCheck = [];
                    elements = (tag === "*" && element.all) ? element.all : element.getElementsByTagName(tag);
                    returnElements = [];
                    
                    for (i = 0; i < classes.length; i++) {
                        classesToCheck.push(new RegExp("(^|\\s)" + classes[i] + "(\\s|$)"));
                    }
                    
                    for (i = 0; i < elements.length; i++) {
                        match = false;
                        for (var j = 0; j < classesToCheck.length; j++){
                            match = classesToCheck[j].test(elements[i].className);
                            if (!match) {
                                break;
                            }
                        }
                        if (match) {
                            returnElements.push(elements[i]);
                        }
                    }
                    
                    return lib.dom.NodeList(returnElements);
                }
            }
        },
        
        parent: function parent(withElement, element, klass, name) {
            /*jshint boss:true*/
            
            if ("boolean" !== typeof withElement) {
                name = klass;
                klass = element;
                element = withElement;
                withElement = false;
            }
            
            name = name && name.toUpperCase();
            
            do {
                if (!withElement) {
                    withElement = true;
                    continue;
                }
                
                if (klass && this.hasClass(element, klass) || name === element.nodeName) {
                    return element;
                }
            } while (element = element.parentNode);
            
            return null;
        },
        
        isChild: function isChild(element, parent) {
            while ((element = element.parentNode)) {
                if (element === parent) {
                    return true;
                }
            }
            return false;
        },
        
        prev: function prev(element, klass, name) {
            /*jshint curly:false*/
            
            name = name && name.toUpperCase();
            
            while ((element = element.previousSibling) &&
                   (element.nodeType !== 1 ||
                   klass && !this.hasClass(element, klass) ||
                   name && name !== element.nodeName));
            
            return element;
        },
        
        next: function next(element, klass, name) {
            /*jshint curly:false*/
            
            name = name && name.toUpperCase();
            
            while ((element = element.nextSibling) &&
                   (element.nodeType !== 1 ||
                   klass && !this.hasClass(element, klass) ||
                   name && name !== element.nodeName));
            
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
        
        before: function before(element, ref) {
            var p = this.parent(ref);
            return p && p.insertBefore(element, ref);
        },
        
        after: function after(element, ref) {
            var p = this.parent(ref);
            return p && p.insertBefore(element, ref.nextSibling);
        },
        
        hasClass: function hasClass(element, klass) {
            return (element.classList && element.classList.contains) ?
                    element.classList.contains(klass) :
                    new RegExp("(^|\\s)" + klass + "(\\s|$)").test(element.className);
        },
        
        addClass: function addClass(element, klass) {
            if (!this.hasClass(element, klass)) {
                if (element.classList && element.classList.add) {
                    element.classList.add(klass);
                } else {
                    element.className += (element.className ? " " : "") + klass;
                }
            }
            return element;
        },
        
        removeClass: function removeClass(element, klass) {
            if (this.hasClass(element, klass)) {
                if (element.classList && element.classList.remove) {
                    element.classList.remove(klass);
                } else {
                    element.className = element.className.replace(new RegExp("(^|\\s)" + klass + "(\\s|$)"), "$2");
                }
            }
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
            if (!(lib.util.isObject(element) &&
                ("nodeType" in element || typeof element.nodeType === "number"))) {
                return false;
            }
            return element.nodeType > 0 && element.nodeType < 13;
        },
        
        isTypeOf: function isTypeOf(element, type) {
            /*jshint bitwise:false*/
            
            if (!this.isDOMNode(element)) {
                return;
            }
            for (var i = 0, len = nodeTypesMap.length; i < len; i++) {
                if (element.nodeType === nodeTypesMap[i][0] && ((type | nodeTypesMap[i][1])) === type) {
                    return true;
                }
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
                }
                
                if (element.dataset) {
                    return element.dataset[key];
                } else {
                    key = lib.string.camelToDash(key);
                    return element.getAttribute("data-" + key);
                }
            },
            
            set: function set(element, key, value) {
                if (element.dataset) {
                    element.dataset[key] = value;
                } else {
                    key = lib.string.camelToDash(key);
                    element.setAttribute("data-" + key, value || "");
                }
            },
            
            remove: function remove(element, key) {
                if (element.dataset) {
                    delete element.dataset[key];
                } else {
                    key = lib.string.camelToDash(key);
                    element.removeAttribute("data-" + key);
                }
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
    ];
})(lib);
