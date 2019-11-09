/* eslint-env node */

const gulp = require('gulp')
const browserSync = require('browser-sync')
const autoprefixer = require('gulp-autoprefixer')
const uglify = require('gulp-uglify')
const ghPages = require('gulp-gh-pages')
const rename = require('gulp-rename')
const reload = browserSync.reload
const cleanCSS = require('gulp-clean-css')

/* config
---------------------------------------------------- */

/**
 * css build
 */
function css () {
  return gulp.src('src/tingle.css')
    .pipe(autoprefixer({
      cascade: false
    }))
    .pipe(gulp.dest('dist'))
    .pipe(reload({ stream: true }))
}

/**
 * css build + min
 */
function cssMin () {
  return gulp.src('src/tingle.css')
    .pipe(autoprefixer({
      cascade: false
    }))
    .pipe(cleanCSS())
    .pipe(rename('tingle.min.css'))
    .pipe(gulp.dest('dist'))
    .pipe(reload({ stream: true }))
}

/**
* js build
*/
function js () {
  return gulp.src('src/tingle.js')
    .pipe(gulp.dest('dist'))
}

/**
* js build + min
*/
function jsMin () {
  return gulp.src('src/tingle.js')
    .pipe(uglify({
      mangle: true
    }))
    .pipe(rename('tingle.min.js'))
    .pipe(gulp.dest('dist'))
}

/**
* deploy documentation to Github
*/
function deploy () {
  return gulp.src('./doc/**/*')
    .pipe(ghPages())
}

/**
 * copy sources to doc folder
 */
function copy () {
  return gulp.src(['dist/**/*'])
    .pipe(gulp.dest('doc/tingle'))
}

function watch () {
  browserSync.init({
    server: './doc'
  })

  gulp.watch('src/*.js', gulp.series(gulp.parallel(js, jsMin), copy))
  gulp.watch('src/*.css', gulp.series(gulp.parallel(css, cssMin), copy))
}

exports.default = gulp.parallel(css, cssMin, js, jsMin)
exports.doc = gulp.series(exports.default, copy, deploy)
exports.watch = watch
