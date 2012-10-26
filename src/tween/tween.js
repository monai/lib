(function(lib, undefined) {
    /*global lib*/
    "use strict";
    
    var vendors, lastTime;
    vendors = ["ms", "moz", "webkit", "o"];
    lastTime = 0;
    
    lib.tween = {
        // http://st-on-it.blogspot.com/2011/05/calculating-cubic-bezier-function.html
        Bezier: function Bezier(p1, p2, p3, p4) {
            // defining the bezier functions in the polynomial form
            var Cx = 3 * p1,
                Bx = 3 * (p3 - p1) - Cx,
                Ax = 1 - Cx - Bx,
                Cy = 3 * p2,
                By = 3 * (p4 - p2) - Cy,
                Ay = 1 - Cy - By;
            
            function bezierX(t) { return t * (Cx + t * (Bx + t * Ax)); }
            function bezierY(t) { return t * (Cy + t * (By + t * Ay)); }
            
            // using Newton's method to aproximate the parametric value of x for t
            function bezierXDerivative(t) { return Cx + t * (2 * Bx + 3 * Ax * t); }
            
            function findXFor(t) {
                var x = t, i = 0, z;
                
                while (i < 5) { // making 5 iterations max
                    z = bezierX(x) - t;
                    
                    if (Math.abs(z) < 1e-3) {
                        break; // if already got close enough
                    }
                    
                    x = x - z / bezierXDerivative(x);
                    i++;
                }
                return x;
            }
            
            return function findYFor(t) {
                return bezierY(findXFor(t));
            };
        },
        
        bezier: function bezier(p1, p2, p3, p4) {
            return new this.Bezier(p1, p2, p3, p4);
        },
        
        easing: {
            ease:       [0.25, 0.1, 0.25, 1.0],
            linear:     [0.0, 0.0, 1.0, 1.0],
            easeIn:     [0.42, 0, 1.0, 1.0],
            easeOut:    [0, 0, 0.58, 1.0],
            easeInOut:  [0.42, 0, 0.58, 1.0]
        },
        
        getRequestAnimationFrame: function getRequestAnimationFrame() {
            var rAF;
            rAF = lib.window.requestAnimationFrame;
            for (var i = 0; i < vendors.length && !rAF; i++) {
                rAF = lib.window[vendors[i] + "RequestAnimationFrame"];
            }
            
            if (rAF) {
                return rAF;
            } else {
                return function(callback) {
                    var currTime, timeToCall, id;
                    currTime = new Date().getTime();
                    timeToCall = Math.max(0, 16 - (currTime - lastTime));
                    id = lib.window.setTimeout(function() {
                        callback(currTime + timeToCall);
                    }, timeToCall);
                    lastTime = currTime + timeToCall;
                    return id;
                };
           }
        },
        
        getCancelAnimationFrame: function getCancelAnimationFrame() {
            var cAF;
            cAF = lib.window.cancelAnimationFrame;
            for (var i = 0; i < vendors.length && !cAF; i++) {
                cAF = lib.window[vendors[i] + "CancelAnimationFrame"] ||
                      lib.window[vendors[i] + "CancelRequestAnimationFrame"];
            }
            
            if (cAF) {
                return cAF;
            } else {
               return function(id) {
                   lib.window.clearTimeout(id);
               };
           }
        },
        
        run: function run(from, to, duration, easing, stepCallback, endCallback) {
            var startTime, easingFunction,
                isFunctionStepCallback, isFunctionEndCallback, requestAnimationFrame,
                rafPrevented, intervalFunction;
                
            isFunctionStepCallback = lib.util.isFunction(stepCallback);
            isFunctionEndCallback = lib.util.isFunction(endCallback);
            requestAnimationFrame = this.getRequestAnimationFrame();
            rafPrevented = false;
            
            if (typeof easing === "string" && this.easing[easing]) {
                easingFunction = this.bezier.apply(this, this.easing[easing]);
            } else if (lib.util.isArray(easing) && easing.length === 4) {
                easingFunction = this.bezier.apply(this, easing);
            } else {
                easingFunction = this.bezier.apply(this, this.easing.ease);
            }
            
            (function intervalFunction() {
                /*jshint validthis:true */
                var time, deltaTime, fraqTime, end, delta, rafHandle;
                
                if (!startTime) {
                    startTime = +new Date();
                    requestAnimationFrame(intervalFunction);
                    return;
                }
                
                time = +new Date();
                deltaTime = time - startTime;
                fraqTime = easingFunction(deltaTime / duration);
                end = (duration - deltaTime < 13) ? true : false; // --OMG-OPTIMIZE
                delta = (to - from) * fraqTime;
                delta = from + delta;
                //delta = end ? to : delta <= to ? delta : to;
                delta = end ? to : delta;
                
                if (end) {
                    if (isFunctionEndCallback) {
                        endCallback.call(this, delta);
                    }
                    return;
                } else {
                    if (!rafPrevented) {
                        rafHandle = requestAnimationFrame(intervalFunction);
                    }
                }
                
                if (isFunctionStepCallback) {
                    rafPrevented = stepCallback.call(this, delta, rafHandle);
                    rafPrevented = (undefined === rafPrevented) ? false : !rafPrevented;
                }
                
            })();
        }
    };
})(lib);
