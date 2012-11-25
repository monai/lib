describe("lib", function () {
    describe("this", function () {
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
        it("should print all objects key-value pairs", function () {
            var object = {
                key: "val",
                foo: "bar"
            };
            var string = "key: val\r\nfoo: bar";
            assert.equal(lib.inspect(object), string);
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
        it("should be false until `lib.ready()` wasn't called", function () {
            assert.equal(lib.isReady, false);
        });

        it("should be true after `lib.ready()` was called", function () {
            lib.ready();
            assert.equal(lib.isReady, true);
            lib.isReady = false;
        });
    });

    describe("ready([callback])", function () {
        it("should execute callback after `lib.ready()` was called", function (done) {
            var after = false;
            lib.ready(function () {
                assert.isTrue(after);
                done();
            });
            after = true;
            lib.ready();
            lib.isReady = false;
        });

        it("should execute callback immediately if `lib.ready()` is already called", function (done) {
            var after = false;
            lib.ready();
            lib.ready(function () {
                assert.isFalse(after);
                done();
            });
            after = true;
            lib.isReady = false;
        });

        it("should add callbacks to queue if `lib.ready` wasn't called", function (done) {
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
    });

    describe("extend(target, [object, object, ...])", function () {
        it("should copy own properties of 2nd+ arguments to the first one", function () {
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
        it("should set propery `__guid` to passed object it doesn't have one", function () {
            var object = {};
            lib.guid(object);
            assert.isNumber(object.__guid);
        });

        it("should return value of property `__guid` of passed object if it has one", function () {
            var object = {};
            var guid = lib.guid(object);
            assert.isDefined(object.__guid);
            assert.equal(lib.guid(object), guid);
        });

        it("should return unique id everytime called unless passed object has `__guid` property", function () {
            var object = {};
            var guid = lib.guid(object);
            assert.notEqual(lib.guid(), lib.guid());
            assert.notEqual(lib.guid({}), lib.guid());
            assert.equal(lib.guid(object), guid);
        });
    });
});
