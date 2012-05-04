(function(lib, undefined) {
    function Benchmark(name, start) {
        if (this == lib.util) return new Benchmark(name, start);
        
        this.name = name;
        this.startTime = null;
        this.endTime = null;
        if (start || typeof start == "undefined") this.start();
    };
    
    lib.extend(Benchmark.prototype, {
        start: function start() {
            this.startTime = (new Date()).getTime();
        },
        
        stop: function stop() {
            this.endTime = (new Date()).getTime();
            return this.endTime - this.startTime;
        },
        
        log: function log() {
            var t = this.stop();
            lib.log(this.name + ": " + t + "ms");
        }
    });
    
    lib.util.Benchmark = Benchmark;
    
})(lib);
