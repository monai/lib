(function(lib, undefined) {
    /*global lib*/
    "use strict";
    
    lib.widget.helpers = {};
    
    lib.extend(lib.widget.helpers, {
        _addEvent: function _addEvent(target, type, callback) {
            var bound = lib.bind(callback, this);
            if (!this.__events) {
                this.__events = [];
            }
            
            this.__events.push([target, type, callback, bound]);
            lib.event.add(target, type, bound);
        },
        
        _removeEvent: function _removeEvent(target, type, callback) {
            if (this.__events) {
                lib.array.forEach(this.__events, function(event, i, array) {
                    var match = true, hit = false;
                    if (target) {
                        match = (match && target === event[0]);
                    }
                    if (type) {
                        match = (match && type === event[1]);
                    }
                    if (callback) {
                        match = (match && callback === event[2]);
                    }
                    
                    if (match) {
                        if (!hit) {
                            hit = true;
                            lib.event.remove(event[0], event[1], event[3]);
                        }
                        
                        array.splice(i, 0);
                    }
                });
            }
        },
        
        _dispatchEvent: function _dispatchEvent(type, args) {
            lib.event.dispatch(this.element, type, args);
        },
        
        _dispose: function _dispose() {
            this._removeEvent();
            if (this.element.__events) {
                delete this.element.__events;
            }
        },
        
        _elementize: function _elementize(element) {
            var type = lib.util.getType(this);
            if (!element.__widgets) {
                element.__widgets = {};
            }
            if (!element.__widgets[type]) {
                element.__widgets[type] = this;
                this.element = element;
            }
        }
    });
})(lib);
