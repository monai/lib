describe("lib.dom", function () {
    describe("byId(id)", function () {
        var _document;
        
        it("should return `null` if no argument is passed", function () {
            var ret = lib.dom.byId("id");
            assert.isNull(ret, "returned value is `null`");
        });
        
        it("should return `Element` if element with given `id` exists in DOM", function () {
            var byId = lib.document.getElementById;
            lib.document.getElementById = function (id) {
                return "elem";
            };
            var ret = lib.dom.byId("id");
            assert.equal(ret, "elem", "returned value equals 'elem'");
            lib.document.getElementById = byId;
        });
        
        it("should return `null` if element with given `id` doesn't exist in DOM", function () {
            var byId = lib.document.getElementById;
            lib.document.getElementById = function (id) {
                return null;
            };
            var ret = lib.dom.byId("id");
            assert.isNull(ret, "returned value equals `null`");
            lib.document.getElementById = byId;
        });
    });
    
    describe("byTag(name[, element])", function () {
        var _document, NodeList, elem;
        
        it("should return empty `lib.dom.NodeList` if no argument is passed", function () {
            var ret = lib.dom.byTag();
            assert.lengthOf(ret, 0, "`lib.dom.NodeList has length of 0");
        });
        
        it("should return `lib.dom.NodeList` with found elements", function () {
            var byTag = lib.document.getElementsByTagName;
            lib.document.getElementsByTagName = function () {
                return [
                    {
                        name: "ElementA",
                        nodeType: 1
                    },
                    {
                        name: "ElementB",
                        nodeType: 1
                    }
                ];
            };
            var ret = lib.dom.byTag("name");
            assert.lengthOf(ret, 2, "`lib.dom.NodeList has length of 2");
            lib.document.getElementsByTagName = byTag;
        });
        
        it("should return empty `lib.dom.NodeList` if no elements exists in DOM with given tag name", function () {
            var byTag = lib.document.getElementsByTagName;
            lib.document.getElementsByTagName = function () {
                return [];
            };
            var ret = lib.dom.byTag("name");
            assert.lengthOf(ret, 0, "`lib.dom.NodeList has length of 0");
            lib.document.getElementsByTagName = byTag;
        });
        
        it("should perform search from given `element` if one is passed", function () {
            var elem = {
                getElementsByTagName: function () {
                    return [
                        {
                            name: "ElementA",
                            nodeType: 1
                        },
                        {
                            name: "ElementB",
                            nodeType: 1
                        }
                    ];
                }
            };
            var ret = lib.dom.byTag("name", elem);
            assert.lengthOf(ret, 2, "`lib.dom.NodeList has length of 2");
        });
    });
    
    describe("byQuery(query[, element])", function () {
        var _document;
        
        it("should return `null` if no argument is passed", function () {
            var ret = lib.dom.byQuery("query");
            assert.isNull(ret, "returned value is `null`");
        });
        
        it("should return `Element` if element was found in DOM by given `query`", function () {
            var byQuery = lib.document.querySelector;
            lib.document.querySelector = function (id) {
                return "elem";
            };
            var ret = lib.dom.byQuery("query");
            assert.equal(ret, "elem", "returned value equals 'elem'");
            lib.document.querySelector = byQuery;
        });
        
        it("should return `null` if element wasn't found in DOM by given query", function () {
            var byQuery = lib.document.querySelector;
            lib.document.querySelector = function (id) {
                return null;
            };
            var ret = lib.dom.byQuery("query");
            assert.isNull(ret, "returned value equals `null`");
            lib.document.querySelector = byQuery;
        });
        
        it("should perform search from given `element` if one is passed", function () {
            var elem = {
                querySelector: function () {
                    return "elem";
                }
            };
            var ret = lib.dom.byQuery("query", elem);
            assert.equal(ret, "elem", "returned value equals 'elem'");
        });
    });
});
