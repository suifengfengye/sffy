'use strict';

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var del = require('del');

var paths = {
  dest: './dest',
  app: './app'
};
var _port = 9000;

/**
* copy and minify html
*/
gulp.task('html', function(){
  return gulp.src('./app/**/*.html')
        .pipe($.htmlMinify())
        .pipe(gulp.dest(paths.dest));
});

/**
* copy and minify css
*/
gulp.task('styles', function(){
  return gulp.src('./app/**/*.css')
        .pipe($.autoprefixer({browsers:['last 1 version']}))
        .pipe($.csso())
        .pipe(gulp.dest(paths.dest));
});

//scripts
gulp.task('scripts', function(){
  return gulp.src('./app/**/*.js')
        .pipe($.uglify())
        .pipe(gulp.dest(paths.dest));
});

//clean
gulp.task('clean', function(){
  return del([paths.dest]+'/**');
});

/**
* connect task
*/
gulp.task('connect', ['styles', 'scripts', 'html'], function(){
  var serveIndex = require('serve-index');
  //文件夹映射/读取index.html
  var serveStatic = require('serve-static');
  var app = require('connect')()
          .use(require('connect-livereload')({port:35729}))
          .use(serveStatic(paths.app))
          .use(serveIndex(paths.app));
  return require('http').createServer(app)
      .listen(_port)
      .on('listening', function(){
          console.log('Server start on http://localhost:' + _port);
      });
});

/**
* watch
*/
gulp.task('watch', ['connect'], function(){
  $.livereload.listen();

  gulp.watch([
    './app/**/*.html',
    './app/styles/**/*.css',
    './app/images/**',
    './app/scripts/**/*.js'
  ]).on('change', $.livereload.changed);
});

//opn
gulp.task('serve', ['watch'],function(){
  return require('opn')('http://localhost:' + _port);
});

//默认任务
gulp.task('default', ['serve'], function(){
});
