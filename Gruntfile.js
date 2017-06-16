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

  var railsPath = grunt.option('railsPath');

  var target = "dist";

  if (!railsPath) {
//    railsPath = "../../PartViewer/assets/"
    railsPath = "../davelon-core/app/assets/"
//    railsPath = "../../node/pingru/public/"
  }

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
          'src/javascripts/ixtaat.js',
        ],
        dest: 'dist/javascripts/ixtaat.full.js',
      },

      i18n : {
        files : {
          'dist/javascripts/i18n/de.js': 'src/javascripts/i18n/de.js'
        }
      },
      base: {
        src: 'src/javascripts/ixtaat/base.js',
        dest: 'dist/javascripts/ixtaat/base.full.js',
      },
      widget: {
        src: 'src/javascripts/ixtaat/widget.js',
        dest: 'dist/javascripts/ixtaat/widget.full.js',
      },
      material: {
        src: 'src/javascripts/ixtaat/material.js',
        dest: 'dist/javascripts/ixtaat/material.full.js',
      },
      table: {
        src: 'src/javascripts/ixtaat/table.js',
        dest: 'dist/javascripts/ixtaat/table.full.js',
      },
    },
    sass: {
      dist: {
        options: {
          style: "expanded",
          compass: true
        },
        files: {
          "dist/stylesheets/ixtaat.full.css": "src/stylesheets/ixtaat.scss",
          "dist/stylesheets/ixtaat/table.full.css": "src/stylesheets/ixtaat/table.scss",
          "dist/stylesheets/ixtaat/material.full.css": "src/stylesheets/ixtaat/material.scss"
        }
      },
      dev: {
        options: {
          style: "compressed",
          compass: true
        },
        files: {
          "dist/stylesheets/ixtaat.css": "src/stylesheets/ixtaat.scss",
          "dist/stylesheets/ixtaat/table.css": "src/stylesheets/ixtaat/table.scss",
          "dist/stylesheets/ixtaat/material.css": "src/stylesheets/ixtaat/material.scss"
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
          "dist/javascripts/ixtaat.js": ["dist/javascripts/ixtaat.full.js"],
          "dist/javascripts/ixtaat/base.js": ["dist/javascripts/ixtaat/base.full.js"],
          "dist/javascripts/ixtaat/widget.js": ["dist/javascripts/ixtaat/widget.full.js"],
          "dist/javascripts/ixtaat/table.js": ["dist/javascripts/ixtaat/table.full.js"],
          "dist/javascripts/ixtaat/material.js": ["dist/javascripts/ixtaat/material.full.js"],
          "dist/javascripts/i18n/de.js": ["dist/javascripts/i18n/de.full.js"]
        }
      }
    },

    copy: {
      fonts: {
        files: [
          // includes files within path
          {
            expand: true,
            cwd: 'dist',
            src: 'assets/fonts/*',
            dest: 'stylesheets/ixtaat/',
            filter: 'isFile'
          },
        ]
      },
      rails: {
        files: [
          {
            expand: true,
//            flatten: true,
            cwd: 'dist',
            src: 'javascripts/**',
            dest: railsPath ,
//            filter: 'isFile'
          },
          {
            expand: true,
//            flatten: true,
            cwd: 'dist',
            src:  'stylesheets/**',
            dest: railsPath ,
//            filter: 'isFile'
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
        tasks: ["concat", "uglify:*", "copy:rails"]
      },

      scss: {
        files: "src/stylesheets/**/*.scss",
        tasks: ["sass:*", "copy:rails"]
      }
    }
  });


	var gruntCopy = grunt.config.get('copy');
	for (var item in gruntCopy) {
		var files = gruntCopy[item].files;
		for (var i = files.length - 1; i >= 0; i--) {
			var fileItem = files[i];
			if (fileItem.dest instanceof Array) {
				files.splice(i, 1);
				for (var j = 0; j < fileItem.dest.length; j++) {
					files.push({src: fileItem.src, dest: fileItem.dest[j]})
				}
			}
		}
	}
	grunt.config.set('copy', gruntCopy);

  grunt.registerTask("pack", ["concat", "sass:*", "uglify:*", "copy"]);
  grunt.registerTask("default", ["dev"]);
  grunt.registerTask("dev", ["pack", "connect:server"]);
};
