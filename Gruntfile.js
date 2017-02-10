module.exports = function (grunt) {

  "use strict";

  // Load grunt tasks from NPM packages
  require("load-grunt-tasks")(grunt);

  //grunt.loadNpmTasks("grunt-stylesheets");
  grunt.loadNpmTasks("grunt-contrib-sass");
  grunt.loadNpmTasks("grunt-contrib-uglify");
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks("grunt-contrib-connect");
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-jsdoc');
 // grunt.loadNpmTasks('grunt-svgstore');


  var target = "dist";

  grunt.initConfig({
    jsdoc: {
      dist: {
        src: ['src/javascripts/**/*.js', 'README.md'],
        options: {
          destination : 'doc',
          template : "node_modules/ink-docstrap/template",
          configure : "node_modules/ink-docstrap/template/jsdoc.conf.json"
        }
      }
    },


    pkg: grunt.file.readJSON('package.json'),

    concat: {
      ixtaat: {
        src: [
          'src/javascripts/ixtaat.base.js',
          'src/javascripts/ixtaat.extensions.js',
          'src/javascripts/ixtaat.objects.js',
          'src/javascripts/ixtaat.baseobjects.js',
          'src/javascripts/ixtaat.widgets.js',
        ],
        dest: 'dist/javascripts/ixtaat.js',
      },

      i18n : {
        files : {
          'dist/javascripts/i18n/de.js': 'src/javascripts/i18n/de.js'
        }
      },

    },
    sass: {
      dist: {
        options: {
          style: "expanded",
          compass: true
        },
        files: {
          "dist/stylesheets/ixtaat.css": "src/stylesheets/ixtaat.scss",
        }
      },
      dev: {
        options: {
          style: "compressed",
          compass: true
        },
        files: {
          "dist/stylesheets/ixtaat.min.css": "src/stylesheets/ixtaat.scss",
        }
      },
    },

    uglify: {
      dev: {
        options: {
          preserveComments: false,
          report: "min",
          beautify: {
            "ascii_only": true
          },
          banner: "/*! ixtaat v<%= pkg.version %> | " +
          "(c) H-DV | ixtaat.com/license */",
          compress: {
            "hoist_funs": false,
            loops: false,
            unused: false
          }
        },
        files: {
          "dist/javascripts/ixtaat.min.js": ["dist/javascripts/ixtaat.js"],
          "dist/javascripts/i18n/de.min.js": ["dist/javascripts/i18n/de.js"]
        }
      }
    },

    copy: {
      fonts: {
        files: [
          // includes files within path
          {
            expand: true,
            flatten: true,
            src: ['assets/fonts/*'],
            dest: 'dist/stylesheets/',
            filter: 'isFile'
          },
        ]
      }
    },

    npmcopy: {
      all: {
        options: {
          destPrefix: "external"
        },
        files: {
          "sizzle/dist": "sizzle/dist",
          "sizzle/LICENSE.txt": "sizzle/LICENSE.txt",
          "qunit/qunit.js": "qunitjs/qunit/qunit.js",
          "qunit/qunit.css": "qunitjs/qunit/qunit.stylesheets",
          "qunit/LICENSE.txt": "qunitjs/LICENSE.txt",
          "font-awesome/scss": "font-awesome/scss",
          "font-awesome/fonts": "font-awesome/fonts",
          "normalize-scss/": "normalize-scss"
        }
      }
    },

    connect: {
      server: {
        options: {
          open: {
            target: 'http://127.0.0.1:8000'
          },
          keepalive: true
        }
      }
    },
    watch: {
      js: {
        files: "src/javascripts/**/*.js",
        tasks: ["concat", "uglify:*"]
      },

      scss: {
        files: "src/stylesheets/**/*.scss",
        tasks: ["sass:*"]
      }
    }
  });

  grunt.registerTask("pack", ["concat", "sass:*", "uglify:*", "copy"]);
  grunt.registerTask("default", ["dev"]);
  grunt.registerTask("dev", ["pack", "connect:server"]);
};
