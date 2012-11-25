/*global module:false*/
module.exports = function(grunt) {
    /*jshint laxcomma:true*/
    // Project configuration.
    
    "use strict";
    
    grunt.initConfig({
        pkg: "<json:package.json>",
        
        meta: {
            banner: "/*! <%= pkg.name %> - <%= pkg.description %> - <%= pkg.homepage %> | <%= pkg.license %> license */"
        },
        
        concat: {
            dist: {
                src: [
                      "<banner:meta.banner>"
                    , "src/lib/lib.js"
                    , "src/util/util.js"
                    , "src/util/Benchmark.js"
                    , "src/lang/object.js"
                    , "src/lang/array.js"
                    , "src/lang/string.js"
                    , "src/lang/date.js"
                    , "src/dom/dom.js"
                    , "src/dom/NodeList.js"
                    , "src/event/event.js"
                    , "src/dimensions/dimensions.js"
                    , "src/tween/tween.js"
                    , "src/widget/widget.js"
                    , "src/widget/helpers.js"
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
                closureCompiler: "build/compiler.jar",
                js: "<config:concat.dist.dest>",
                output_file: "dist/<%= pkg.name %>.min.js",
                options: {
                    compilation_level: "SIMPLE_OPTIMIZATIONS",
                    language_in: "ECMASCRIPT5_STRICT",
                    output_wrapper: "'(function(undefined){%output%}).call(this);'"
                }
            }
        }
    });
    
    grunt.loadNpmTasks("grunt-closure-tools");

    // Default task.
    grunt.registerTask("default", "concat:dist closureCompiler concat:after");
};
