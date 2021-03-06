describe("lib", function () {
    describe("~", function () {
        it("should be explosed to global object", function () {
            assert.isDefined(window.lib);
        });
    });

    describe("log([object, object, ...])", function () {
        it("should be exposed to global object", function () {
            assert.equal(window.log, lib.log);
        });
    });

    describe("inspect(object)", function () {
        it("should return empty string if no argument is passed", function () {
            var ret = lib.inspect();
            assert.equal(ret, "");
        });
        
        it("should return string representation of all key/value pairs of given object", function () {
            var object = {
                key: "val",
                foo: "bar"
            };
            var string = "key: val\r\nfoo: bar";
            var ret = lib.inspect(object);
            assert.equal(ret, string);
        });
    });

    describe("window", function () {
        it("should be equal to `window`", function () {
            assert.equal(lib.window, window);
        });
    });

    describe("document", function () {
        it("should be equal to `document`", function () {
            assert.equal(lib.document, document);
        });
    });

    describe("isReady", function () {
        it("should be false if `lib.ready()` wasn't been called", function () {
            assert.equal(lib.isReady, false);
        });

        it("should be true if `lib.ready()` is already called", function () {
            lib.ready();
            assert.equal(lib.isReady, true);
            lib.isReady = false;
        });
    });

    describe("ready([callback])", function () {
        it("should add callbacks to queue if `lib.isReady` equals `false`", function (done) {
            var n = 0;
            
            lib.ready(function () {
                n++;
            });
            lib.ready(function () {
                n++;
                assert.equal(n, 2);
                done();
            });
            
            lib.ready();
            lib.isReady = false;
        });
        
        it("should execute callback immediately if `lib.isReady` equals `true`", function (done) {
            var after = false;
            lib.ready();
            lib.ready(function () {
                assert.isFalse(after);
                done();
            });
            after = true;
            lib.isReady = false;
        });
    });

    describe("extend(target, [object, object, ...])", function () {
        it("should return `target` if no other arguments is passed", function () {
            var target = { key: "val" };
            var ret = lib.extend(target);
            assert.deepEqual(target, ret);
        });
        
        it("should copy own properties of 2nd and following arguments to the first one", function () {
            var target = {};
            lib.extend(target, { key: "val" }, { foo: "bar" });
            assert.equal(target.key, "val");
            assert.equal(target.foo, "bar");
        });
    });

    describe("bind(function, context)", function () {
        it("should return function bound to context object", function (done) {
            var context = {
                foo: "bar"
            };
            var bound = lib.bind(function () {
                assert.equal(this.foo, "bar");
                done();
            }, context);
            bound();
        });
    });

    describe("guid([object])", function () {
        it("id should be `Number`", function () {
            var guid = lib.guid();
            assert.isNumber(guid);
        });
        
        it("should return unique id if no argument is passed", function () {
            var guidA = lib.guid();
            var guidB = lib.guid();
            assert.notEqual(guidA, guidB);
        });
        
        it("should set propery `__guid` to passed object if it doesn't have one", function () {
            var object = {};
            lib.guid(object);
            assert.isNumber(object.__guid);
        });

        it("should return value of property `__guid` of passed object if it has one", function () {
            var object = {};
            var guid = lib.guid(object);
            var ret = lib.guid(object);
            assert.equal(ret, guid);
        });
    });
});
