var browserify = require('browserify');
var gulp = require('gulp');
var path = require('path');
var buffer = require('vinyl-buffer');
var sourcemaps = require('gulp-sourcemaps');
var source = require('vinyl-source-stream');
var gulpConcat = require('gulp-concat');
var runSequence = require('run-sequence');
var nodemon = require('gulp-nodemon')

var bundler = browserify({
  entries: ['./testModule/app.js'],
  standalone: 'saModule',
  debug: true
});

gulp.task('testModule', function () {
  return bundler
    .bundle()
    .pipe(source('testModule.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({
      loadMaps: true
    }))
    // .pipe(uglify({ compress: true }))
    // .pipe(header(license))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./testOutput/'));
})

gulp.task('copy', function () {
  gulp.src('./testOutput/testModule.js').pipe(gulp.dest('./static/'));
});

gulp.task('server', function () {
  nodemon({
    script: 'index.js',
    ext: 'js html',
  })
})

gulp.task('default', function () {
  runSequence('testModule', 'copy', 'server');
})