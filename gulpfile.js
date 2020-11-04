'use strict';
/*jshint node:true*/

var gulp = require('gulp');
var del = require('del');
var qunit = require('gulp-qunit');
var plumber = require('gulp-plumber');
var jshint = require('gulp-jshint');
var uglify = require('gulp-uglify');
var replace = require('gulp-replace');
var rename = require('gulp-rename');
var header = require('gulp-header');
var sourceMaps = require('gulp-sourcemaps');

var buildConfig = {
  outputPath: 'dist',
  pkg: require('./package.json')
};


gulp.task('clear', function () {
  return del('*', {cwd: 'dist'});
});

gulp.task('build', function () {
  return gulp.src('knockout.mapping.js')
    .pipe(plumber({errorHandler: process.env.NODE_ENV === 'development'}))
    .pipe(jshint()).pipe(jshint.reporter('jshint-stylish'))
    .pipe(header(buildConfig.banner, {pkg: buildConfig.pkg}))
    .pipe(gulp.dest(buildConfig.outputPath))
    .pipe(rename('knockout.mapping.min.js'))
    .pipe(replace(/(:?var\s*?DEBUG\s*?=\s*?true)/, 'var DEBUG=false'))
    .pipe(sourceMaps.init())
    .pipe(uglify())
    .pipe(sourceMaps.write('./'))
    .pipe(gulp.dest(buildConfig.outputPath));
});

gulp.task('jshint', function () {
  return gulp.src(['knockout.mapping.js', 'spec/*.js'])
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('test', gulp.series('build', 'jshint', function() {
  return gulp.src(process.env.CI ? 'spec/spec-runner-*.htm' : 'spec/spec-runner.htm')
    .pipe(plumber({errorHandler: process.env.NODE_ENV === 'development'}))
    .pipe(qunit({timeout: 30}));
}));

gulp.task('default', gulp.series('clear', 'test'));

gulp.task('watch', function () {
  gulp.watch(['knockout.mapping.js', 'spec/spec-runner.htm', 'spec/*.js'], gulp.series('clear', 'test'));
});
