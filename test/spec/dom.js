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
        
        it("should return `lib.dom.NodeList`", function () {
            var ret = lib.dom.byTag();
            assert.instanceOf(ret, lib.dom.NodeList, "value is instance of `lib.dom.NodeList`");
        });
        
        it("should return empty collection if no argument is passed", function () {
            var ret = lib.dom.byTag();
            assert.lengthOf(ret, 0, "collection has length of 0");
        });
        
        it("should return collection with found elements", function () {
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
            assert.lengthOf(ret, 2, "collection has length of 2");
            lib.document.getElementsByTagName = byTag;
        });
        
        it("should return empty collection if no elements exists in DOM with given tag name", function () {
            var byTag = lib.document.getElementsByTagName;
            lib.document.getElementsByTagName = function () {
                return [];
            };
            var ret = lib.dom.byTag("name");
            assert.lengthOf(ret, 0, "collection has length of 0");
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
            assert.lengthOf(ret, 2, "collection has length of 2");
        });
    });
    
    describe("byQuery(query[, element])", function () {
        var _document;
        
        it("should return `null` if no argument is passed", function () {
            var ret = lib.dom.byQuery();
            assert.isNull(ret, "value is `null`");
        });
        
        it("should return `Element` if element was found in DOM by given query", function () {
            var byQuery = lib.document.querySelector;
            lib.document.querySelector = function (id) {
                return "elem";
            };
            var ret = lib.dom.byQuery("query");
            assert.equal(ret, "elem", "value equals 'elem'");
            lib.document.querySelector = byQuery;
        });
        
        it("should return `null` if element wasn't found in DOM by given query", function () {
            var byQuery = lib.document.querySelector;
            lib.document.querySelector = function (id) {
                return null;
            };
            var ret = lib.dom.byQuery("query");
            assert.isNull(ret, "value equals `null`");
            lib.document.querySelector = byQuery;
        });
        
        it("should perform search from given `element` if one is passed", function () {
            var elem = {
                querySelector: function () {
                    return "elem";
                }
            };
            var ret = lib.dom.byQuery("query", elem);
            assert.equal(ret, "elem", "value equals 'elem'");
        });
    });
    
    describe("byQueryAll(query[, element])", function () {
        var _document;
        
        it("should return `lib.dom.NodeList`", function () {
            var ret = lib.dom.byQueryAll();
            assert.instanceOf(ret, lib.dom.NodeList, "value is instance of `lib.dom.NodeList`");
        });
        
        it("should return empty collection if no argument is passed", function () {
            var ret = lib.dom.byQueryAll();
            assert.lengthOf(ret, 0, "collection has length of `0`");
        });
        
        it("should return collection with `Element` if element was found in DOM by given query", function () {
            var byQueryAll = lib.document.querySelectorAll;
            lib.document.querySelectorAll = function (id) {
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
            var ret = lib.dom.byQueryAll("query");
            assert.lengthOf(ret, 2, "collection has length of `2`");
            lib.document.querySelectorAll = byQueryAll;
        });
        
        it("should return empty collection if element wasn't found in DOM by given query", function () {
            var byQueryAll = lib.document.querySelectorAll;
            lib.document.querySelectorAll = function (id) {
                return [];
            };
            var ret = lib.dom.byQueryAll("query");
            assert.lengthOf(ret, 0, "collection has length of `0`");
            lib.document.querySelectorAll = byQueryAll;
        });
        
        it("should perform search from given `element` if one is passed", function () {
            var elem = {
                querySelectorAll: function () {
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
            var ret = lib.dom.byQueryAll("query", elem);
            assert.lengthOf(ret, 2, "collection has length of `2`");
        });
    });
    
    describe("byClass(klass[, tag[, element]])", function () {
        var _document;
        
        it("should return `lib.dom.NodeList`", function () {
            var ret = lib.dom.byClass();
            assert.instanceOf(ret, lib.dom.NodeList, "value is instance of `lib.dom.NodeList`");
        });
        
        it("should return empty collection if no argument is passed", function () {
            var ret = lib.dom.byClass();
            assert.lengthOf(ret, 0, "collection has length of `0`");
        });
        
        it("should return collection with `Element` if element was found in DOM by given class name", function () {
            var byClass = lib.document.getElementsByClassName;
            lib.document.getElementsByClassName = function (id) {
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
            var ret = lib.dom.byClass("class");
            assert.lengthOf(ret, 2, "collection has length of `2`");
            lib.document.getElementsByClassName = byClass;
        });
        
        it("should return empty collection if element wasn't found in DOM by given class name", function () {
            var byClass = lib.document.getElementsByClassName;
            lib.document.getElementsByClassName = function (id) {
                return [];
            };
            var ret = lib.dom.byClass("class");
            assert.lengthOf(ret, 0, "collection has length of `0`");
            lib.document.getElementsByClassName = byClass;
        });
        
        it("should perform search from given `element` if one is passed", function () {
            var elem = {
                getElementsByClassName: function () {
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
            var ret = lib.dom.byClass("class", elem);
            assert.lengthOf(ret, 2, "collection has length of `2`");
        });
        
        it("should filter results by tag name if one is passed", function () {
            var elem = {
                getElementsByClassName: function () {
                    return [
                        {
                            name: "ElementA",
                            nodeType: 1,
                            nodeName: "A"
                        },
                        {
                            name: "ElementB",
                            nodeType: 1,
                            nodeName: "B"
                        }
                    ];
                }
            };
            
            var ret = lib.dom.byClass("class", "a", elem);
            assert.lengthOf(ret, 1, "collection has length of `1`");
        });
    });
});
