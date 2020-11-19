module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('build', ['uglify']);
  grunt.registerTask('default', ['build']);

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        compress: false,
        sourceMap: true,
        sourceMapIncludeSources: true
      },
      build: {
        files: {
          'dist/sdk2-test-utils.js': [
            'node_modules/sinon/pkg/sinon-1.17.6.js',
            'node_modules/jasmine-sinon/lib/jasmine-sinon.js',
            'src/helpers/dom.js',
            'src/helpers/bootstrap.js',
            'src/helpers/environment.js',
            'src/helpers/global.js',
            'src/helpers/generate.js',
            'src/helpers/async.js',
            'src/mock/snapshot-ajax-builder.js',
            'src/mock/ajax-builder.js',
            'src/mock/ajax-interceptor.js',
            'src/mock/snapshot-ajax-interceptor.js',
            'src/mock/data/schema.js',
            'src/mock/data/model-cache.js',
            'src/mock/data/wsapi-model-factory.js',
            'src/mock/mom.js',
            'src/mock/mock.js'
          ]
        }
      }
    }
  });
}
