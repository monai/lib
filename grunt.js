/*global module:false*/
module.exports = function(grunt) {
    /*jshint laxcomma:true*/
    // Project configuration.
    
    "use strict";
    
    grunt.initConfig({
        pkg: "<json:package.json>",
        
        meta: {
            banner: "/*! <%= pkg.name %> - <%= pkg.description %> - <%= pkg.homepage %> | License: <%= pkg.license %> */"
        },
        
        lint: {
            files: ["grunt.js", "src/**/*.js"]
        },
        
        jshint: {
            options: {
                forin: true,
                noarg: true,
                noempty: true,
                eqeqeq: true,
                bitwise: true,
                strict: true,
                undef: true,
                unused: true,
                curly: true,
                browser: true,
                devel: true,
                indent: 4
            },
            
            globals: {
                lib: true,
                log: true
            }
        },
        
        concat: {
            dist: {
                src: [
                      "<banner:meta.banner>"
                    , "src/core/lib.js"
                    , "src/util/util.js"
                    , "src/util/Benchmark.js"
                    , "src/util/Bindable.js"
                    , "src/javascript/object.js"
                    , "src/javascript/array.js"
                    , "src/javascript/string.js"
                    , "src/javascript/date.js"
                    , "src/javascript/JSON.js"
                    , "src/dom/dom.js"
                    , "src/dom/NodeList.js"
                    , "src/event/event.js"
                    , "src/browser/ready.js"
                    , "src/browser/dimensions.js"
                    , "src/browser/ie.js"
                    , "src/tween/tween.js"
                    , "src/widget/widget.js"
                    , "src/widget/helpers.js"
                    , "src/widget/Model.js"
                    ],
                dest: "dist/<%= pkg.name %>.js"
            },
            
            after: {
                src: ["<banner:meta.banner>", "dist/<%= pkg.name %>.min.js"],
                dest: "dist/<%= pkg.name %>.min.js"
            }
        },
        
        min: {
            dist: {
                src: ["<banner:meta.banner>", "<config:concat.dist.dest>"],
                dest: "dist/<%= pkg.name %>.min.js"
            }
        },
        
        watch: {
            dist: {
                files: "<config:concat.dist.src>",
                tasks: "concat:dist"
            }
        },
        
        closureCompiler: {
            dist: {
                closureCompiler: "build/google-compiler-20120710.jar",
                js: "<config:concat.dist.dest>",
                output_file: "dist/<%= pkg.name %>.min.js",
                options: {
                    compilation_level: "ADVANCED_OPTIMIZATIONS",
                    language_in: "ECMASCRIPT5_STRICT"
                }
            }
        }
    });
    
    grunt.loadNpmTasks("grunt-closure-tools");

    // Default task.
    grunt.registerTask("default", "concat:dist closureCompiler concat:after");
};





























