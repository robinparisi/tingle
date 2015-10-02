var gulp          = require('gulp');
var browserSync   = require('browser-sync');
var autoprefixer  = require('gulp-autoprefixer');
var cp            = require('child_process');
var plumber       = require('gulp-plumber');
var less          = require('gulp-less');
var minifyCSS     = require('gulp-minify-css');
var uglify        = require('gulp-uglify');
var concat        = require('gulp-concat');

var reload        = browserSync.reload;

/* config
---------------------------------------------------- */


var srcFolder =  'src';
var distFolder = 'dist';

var paths = {
    js : {
        src: srcFolder + '/_assets/_js/**/*.js',
        dest: distFolder + '/assets/js',
        watch: srcFolder + '/_assets/_js/**/*'
    }
};
