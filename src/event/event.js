(function(lib, undefined) {
    /*global lib*/
    "use strict";
    
    var event = {
        add: function(target, type, callback) {
            var _type = type.toLowerCase();
            this.initEventProperty(target, type);
            target.__events[type].callbacks[lib.guid(callback)] = callback;
            
            if (this.w3c) {
                target.addEventListener(type, callback, false);
            } else if (this.ie) {
                target.__events[type].handle = null;
                target.__events[type].IECallbacks = target.__events[type].IECallbacks || { keys: [], callbacks: []};
                target.__events[type].hasAttribute = false;
                target.__events[type].supported = typeof target["on" + _type] === "object" ||
                                                  typeof target["on" + _type] === "function";
                
                if (target.__events[type].supported) {
                    if (target["on" + _type] !== null) {
                        this.addIEAttributeEvent(target, type);
                    }
                    
                    var _callback = lib.bind(function() {
                        var event;
                        if (typeof callback.attributeEvent === "undefined") {
                            event = fixIEEvent(lib.window.event, target);
                        } else {
                            event = fixIEEvent(lib.window.event, null);
                        }
                        
                        return callback.apply(target, [event]);
                    }, this);
                    target.__events[type].IECallbacks.keys.push(callback.__guid);
                    target.__events[type].IECallbacks.callbacks.push(_callback);
                    target.attachEvent("on" + type, _callback);
                } else {
                    target.__events[type].handle = function(event) {
                        this.event = extendIEEventSafe(this.event, event);
                        this.event = fixIEEvent(this.event);
                        return this.callback.apply(this.event.currentTarget, [this.event]);
                    };
                    
                    var _target = (target === lib.document) ? lib.document.documentElement : target;
                    if (typeof target.libEvent === "undefined") {
                        target.libEvent = 0;
                        if (target !== _target) {
                            _target.libEvent = 0;
                        }
                    }
                    
                    _target.attachEvent("onpropertychange", function(event) {
                        if (event.propertyName === "libEvent") {
                            if (target.__events[type].handle.event &&
                                target === target.__events[type].handle.event.currentTarget &&
                                target.__events[type].handle.dispatched === false) {
                                target.__events[type].handle.dispatched = true;
                                return lib.bind(target.__events[type].handle, target.__events[type].handle)(event);
                            }
                        }
                    });
                }
            }
        },
        
        initEventProperty: function(target, type) {
            if (typeof target.__events === "undefined") {
                target.__events = {};
            }
            if (typeof target.__events[type] === "undefined") {
                target.__events[type] = {};
            }
            if (typeof target.__events[type].callbacks === "undefined") {
                target.__events[type].callbacks = {};
            }
        },
        
        addIEAttributeEvent: function(target, type) {
            this.initEventProperty(target, type);
            target.__events[type].hasAttribute = true;
            
            var _type = type.toLowerCase(),
                e = target["on" + _type];
            target["on" + _type] = null;
            e.attributeEvent = true;
            this.add(target, type, e);
        },
        
        remove: function(target, type, callback) {
            var i, len, t;
            if (typeof type === "undefined") {
                for (t in target.__events) {
                    if (target.__events.hasOwnProperty(t)) {
                        this.remove(target, t);
                    }
                }
            }
            
            if (typeof target.__events === "object" && typeof target.__events[type] === "object") {
                if (typeof callback === "function") {
                    if (this.w3c) {
                        target.removeEventListener(type, callback, false);
                    } else if (this.ie && target.__events[type].supported) {
                        var _callback,
                            iec = target.__events[type].IECallbacks,
                            guid = callback.__guid;
                        for (i = 0, len = iec.keys.length; i < len; i++) {
                            if (iec.keys[i] === guid) {
                                _callback = iec.callbacks[i];
                                iec.keys.splice(i, 0);
                                iec.callbacks.splice(i, 0);
                                break;
                            }
                        }
                        target.detachEvent("on" + type, _callback);
                    }
                    delete target.__events[type].callbacks[callback.__guid];
                } else {
                    for (i in target.__events[type].callbacks) {
                        if (target.__events[type].callbacks.hasOwnProperty(i)) {
                            this.remove(target, type, target.__events[type].callbacks[i]);
                        }
                    }
                }
            }
        },
        
        dispatch: function(target, type, properties) {
            if (this.w3c) {
                switch (this.events[type]) {
                    case this.types.mouse:
                        return this.dispatchMouseEvent(target, type, properties);
                    case this.types.keyboard:
                        return this.dispatchKeyboardEvent(target, type, properties);
                    case this.types.html:
                        return this.dispatchHTMLEvent(target, type, properties);
                    case this.types.dom: // not implemented
                        break;
                    case this.types.wheel: // not implemented
                        break;
                    default:
                        return this.dispatchUIEvent(target, type, properties);
                }
            } else if (this.ie) {
                return this.dispatchIEEvent(target, type, properties);
            }
        },
        
        dispatchMouseEvent: function(target, type, properties) {
            properties = (typeof properties !== "undefined") ? properties : {};
            var eventProperties = {
                    bubbles: true,
                    cancelable: true,
                    detail: 1,
                    screenX: 0,
                    screenY: 0,
                    clientX: 0,
                    clientY: 0,
                    ctrlKey: false,
                    altKey: false,
                    shiftKey: false,
                    metaKey: false,
                    button: 0,
                    relatedTarget: null
                },
                customProperties = lib.object.subtract(properties, eventProperties);
            lib.extend(eventProperties, properties || {});
            
            var event = document.createEvent("MouseEvents");
            event.initMouseEvent(type, eventProperties.bubbles, eventProperties.cancelable, lib.window,
                eventProperties.detail, eventProperties.screenX, eventProperties.screenY, eventProperties.clientX,
                eventProperties.clientY, eventProperties.ctrlKey, eventProperties.altKey, eventProperties.shiftKey,
                eventProperties.metaKey, eventProperties.button, eventProperties.relatedTarget);
            lib.extend(event, customProperties);
            return target.dispatchEvent(event);
        },
        
        dispatchKeyboardEvent: function(target, type, properties) {
            properties = (typeof properties !== "undefined") ? properties : {};
            var eventProperties = {
                    bubbles: true,
                    cancelable: true,
                    ctrlKey: false,
                    altKey: false,
                    shiftKey: false,
                    metaKey: false,
                    keyCode: 9,
                    charCode: 0
                },
                customProperties = lib.object.subtract(properties, eventProperties);
            lib.extend(eventProperties, properties || {});
            
            var event = document.createEvent("KeyboardEvent");
            if (typeof event.initKeyboardEvent === "undefined" && event.initKeyEvent) {
                event.initKeyboardEvent = event.initKeyEvent;
            }
            
            event.initKeyboardEvent(type, eventProperties.bubbles, eventProperties.cancelable, lib.window,
                eventProperties.ctrlKey, eventProperties.altKey, eventProperties.shiftKey, eventProperties.metaKey,
                eventProperties.keyCode, eventProperties.charCode);
            lib.extend(event, customProperties);
            return target.dispatchEvent(event);
        },
        
        dispatchHTMLEvent: function(target, type, properties) {
            properties = (typeof properties !== "undefined") ? properties : {};
            var eventProperties = {
                    bubbles: true,
                    cancelable: true
                },
                customProperties = lib.object.subtract(properties, eventProperties);
            lib.extend(eventProperties, properties || {});
            
            var event = document.createEvent("HTMLEvents");
            event.initEvent(type, eventProperties.bubbles, eventProperties.cancelable);
            lib.extend(event, customProperties);
            return target.dispatchEvent(event);
        },
        
        dispatchUIEvent: function(target, type, properties) {
            properties = (typeof properties !== "undefined") ? properties : {};
            var eventProperties = {
                    bubbles: true,
                    cancelable: true,
                    detail: null
                },
                customProperties = lib.object.subtract(properties, eventProperties);
            lib.extend(eventProperties, properties || {});
            
            var event = document.createEvent("UIEvents");
            event.initUIEvent(type, eventProperties.bubbles,
                              eventProperties.cancelable,
                              lib.window,
                              eventProperties.detail);
            lib.extend(event, customProperties);
            return target.dispatchEvent(event);
        },
        
        dispatchIEEvent: function(target, type, properties) {
            var event, _type = type.toLowerCase();
            if (typeof target.__events === "undefined") {
                if (typeof target["on" + _type] === "object" || typeof target["on" + _type] === "function") {
                    this.addIEAttributeEvent(target, type);
                } else {
                    return;
                }
            }
            
            if (typeof target.__events[type] === "undefined") {
                return;
            }
            
            properties = properties || {};
            if (target.__events[type].supported) {
                event = document.createEventObject();
                lib.extend(event, properties);
                return target.fireEvent("on" + type, event);
            } else {
                event = lib.extend(properties, {
                    target: target,
                    type: type,
                    currentTarget: target
                });
                
                while (target) {
                    if (target.__events && target.__events[type]) {
                        for (var i in target.__events[type].callbacks) {
                            if (typeof properties.safe === "boolean" && properties.safe === true) {
                                target.__events[type].handle.callback = target.__events[type].callbacks[i];
                                target.__events[type].handle.event = event;
                                target.__events[type].handle.dispatched = false;
                                
                                if (event.currentTarget === document) {
                                    document.documentElement.libEvent++;
                                } else {
                                    event.currentTarget.libEvent++;
                                }
                            } else {
                                
                                if (target.__events[type].callbacks[i].call(
                                        target, fixIEEvent(event, target)) === false) {
                                    event.preventDefault();
                                    event.stopPropagation();
                                }
                            }
                        }
                    }
                    target = event.currentTarget = (!event.cancelBubble && target.parentNode);
                }
                return (event.returnValue !== false);
            }
        },
        
        preventDefault: function preventDefault(event) {
            event.preventDefault();
            return false;
        },
        
        w3c: (document.addEventListener) ? true : false,
        ie: (document.attachEvent && !document.addEventListener) ? true : false,
        
        types: {
            mouse: 1,
            keyboard: 2,
            html: 3,
            dom: 4,
            wheel: 5
        }
    };
    
    event.events = {
        click: event.types.mouse,
        dblclick: event.types.mouse,
        mousedown: event.types.mouse,
        mouseenter: event.types.mouse,
        mouseleave: event.types.mouse,
        mouseup: event.types.mouse,
        mouseover: event.types.mouse,
        mousemove: event.types.mouse,
        mouseout: event.types.mouse,
        keypress: event.types.keyboard,
        keydown: event.types.keyboard,
        keyup: event.types.keyboard,
        load: event.types.html,
        unload: event.types.html,
        abort: event.types.html,
        error: event.types.html,
        resize: event.types.html,
        scroll: event.types.html,
        select: event.types.html,
        change: event.types.html,
        submit: event.types.html,
        reset: event.types.html,
        focus: event.types.html,
        blur: event.types.html,
        DOMFocusIn: event.types.dom,
        DOMFocusOut: event.types.dom,
        DOMActivate: event.types.dom,
        DOMSubtreeModified: event.types.dom,
        DOMNodeInserted: event.types.dom,
        DOMNodeRemoved: event.types.dom,
        DOMNodeRemovedFromDocument: event.types.dom,
        DOMNodeInsertedIntoDocument: event.types.dom,
        DOMAttrModified: event.types.dom,
        DOMCharacterDataModified: event.types.dom,
        mousewheel: event.types.wheel,
        DOMMouseScroll: event.types.wheel
    };
    
    function fixIEEvent(event) {
        event.target = event.target || event.srcElement;
        event.currentTarget = (arguments[1] && arguments[1].nodeName) ? arguments[1] :
                                  (arguments[1] === null) ? null : event.currentTarget;
        
        if (arguments[1] && arguments[1].nodeName && event.toElement && event.toElement.nodeName) {
            event.relatedTarget = (event.toElement === event.target) ? event.fromElement : event.toElement;
        }
        
        event.preventDefault = function() {
            event.returnValue = false;
        };
            
        event.stopPropagation = function() {
            event.cancelBubble = true;
        };
        
        return event;
    }
    
    function extendIEEventSafe(target) {
        var props = ["altKey", "attrChange", "attrName", "bubbles", "button", "cancelable", "charCode",
                    "clientX", "clientY", "ctrlKey", "currentTarget", "data", "detail", "eventPhase",
                    "fromElement", "handler", "keyCode", "layerX", "layerY", "metaKey", "newValue",
                    "offsetX", "offsetY", "originalTarget", "pageX", "pageY", "prevValue", "relatedNode",
                    "relatedTarget", "screenX", "screenY", "shiftKey", "srcElement", "target", "toElement",
                    "view", "wheelDelta", "which"];
        for (var i, k = 0; ++k < arguments.length;) {
            for (i in props) {
                if (typeof arguments[k][props[i]] !== "undefined") {
                    target[props[i]] = arguments[k][props[i]];
                }
            }
        }
        
        target.originalEvent = arguments[1];
        return target;
    }
    
    lib.event = {
        add: lib.bind(event.add, event),
        remove: lib.bind(event.remove, event),
        dispatch: lib.bind(event.dispatch, event),
        preventDefault: event.preventDefault
    };
})(lib);
