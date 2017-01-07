var gulp          = require('gulp');
var browserSync   = require('browser-sync');
var autoprefixer  = require('gulp-autoprefixer');
var uglify        = require('gulp-uglify');
var ghPages       = require('gulp-gh-pages');
var rename        = require('gulp-rename');
var reload        = browserSync.reload;
var cleanCSS      = require('gulp-clean-css');

/* config
---------------------------------------------------- */

var srcFolder =  'src';
var distFolder = 'dist';

/**
 * CSS build
 */
gulp.task('css', function () {
    return gulp.src('src/tingle.css')
    .pipe(autoprefixer({
        browsers: ['> 1%', 'last 3 versions'],
        cascade: false
    }))
    .pipe(gulp.dest('dist'))
    .pipe(reload({stream:true}));
});

/**
 * CSS build + min
 */
gulp.task('css-min', function () {
    return gulp.src('src/tingle.css')
    .pipe(autoprefixer({
        browsers: ['> 1%', 'last 3 versions'],
        cascade: false
    }))
    .pipe(cleanCSS())
    .pipe(rename("tingle.min.css"))
    .pipe(gulp.dest('dist'))
    .pipe(reload({stream:true}));
});

/**
* JS build
*/
gulp.task('js', function() {
    return gulp.src('src/tingle.js')
    .pipe(gulp.dest('dist'))
});

/**
* JS build + min
*/
gulp.task('js-min', function() {
    return gulp.src('src/tingle.js')
    .pipe(uglify({
        mangle: true
    }))
    .pipe(rename("tingle.min.js"))
    .pipe(gulp.dest('dist'))
});

/**
* Deploy documentation to Github
*/
gulp.task('deploy', function() {
    return gulp.src('./doc/**/*')
    .pipe(ghPages());
});

/**
 * Copy sources to doc folder
 */
gulp.task('copy', ['css', 'css-min', 'js', 'js-min'], function () {
    return gulp.src(['dist/**/*'])
      .pipe(gulp.dest('doc/tingle'));
});

gulp.task('serve', function() {

    browserSync.init({
        server: "./doc"
    });

    gulp.watch('src/**', ['copy']);
});



gulp.task('doc', ['copy', 'deploy']);
gulp.task('default', ['css', 'css-min', 'js', 'js-min']);
