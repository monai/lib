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
                var events = this.__events;
                lib.array.forEach(events, function(event, i) {
                    var match = true;
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
                        lib.event.remove(event[0], event[1], event[3]);
                        events[i] = null;
                    }
                });
                this.__events = lib.array.filter(events, function(event) {
                    return event !== null;
                });
            }
        },
        
        _dispatchEvent: function _dispatchEvent(type, args) {
            lib.event.dispatch(this.element, type, args);
        },
        
        _dispose: function _dispose() {
            this._removeEvent();
            if ("__events" in this) {
                delete this.__events;
            }
            delete this.element;
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
