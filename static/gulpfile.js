/* global require */
'use strict';
var gulp = require('gulp');

// load plugins
var $ = require('gulp-load-plugins')();
var bowerFiles = require('main-bower-files');
var del = require('del');
var browserSync = require('browser-sync').create();
var reload = browserSync.reload;

gulp.task('styles', function () {
    gulp.src('app/styles/*.scss')
        .pipe($.sass({
            includePaths: ['bower_components/foundation/scss'],
            sourceComments: 'map' // TODO does this work?
        }).on('error', $.sass.logError))
        .pipe($.autoprefixer('last 1 version'))
        .pipe(gulp.dest('dist/styles'))
        .pipe(browserSync.stream())
        .pipe($.size());
});

gulp.task('diststyles', function () {
    return gulp.src('app/styles/*.scss')
        .pipe($.sass({
            includePaths: ['bower_components/foundation/scss']
        }))
        .pipe($.autoprefixer('last 1 version'))
        .pipe($.csso())
        .pipe(gulp.dest('dist/styles'))
        .pipe(browserSync.stream())
        .pipe($.size());
});

gulp.task('vendorscripts', function () {
    var extra_js = [
        __dirname + '/bower_compontents/foundation/js/foundation/foundation.topbar.js',
        __dirname + '/bower_compontents/foundation/js/foundation/foundation.reveal.js'
    ];
    var vendor_scripts = bowerFiles().concat(extra_js);
    //console.log(vendor_scripts);
    return gulp.src(vendor_scripts)
        .pipe($.filter('**/*.js'))
        //.pipe($.uglify())
        .pipe($.concat('vendor.js'))
        .pipe(gulp.dest('dist/scripts'))
        .pipe($.size());
});

gulp.task('vendorstyles', function () {
    // TODO: copy styles to scss-files instead?
    return gulp.src(bowerFiles())
        .pipe($.filter('**/*.css'))
        .pipe($.concat('vendor.css'))
        //.pipe($.csso())
        .pipe(gulp.dest('dist/styles'))
        .pipe($.size());
});

gulp.task('scripts', function () {
    return gulp.src('app/scripts/**/*.js')
        .pipe($.jshint())
        .pipe($.jshint.reporter(require('jshint-stylish')))
        .pipe(gulp.dest('dist/scripts'))
        .pipe($.size());
});

gulp.task('distscripts', function () {
    return gulp.src('app/scripts/**/*.js')
        .pipe($.jshint())
        .pipe($.jshint.reporter(require('jshint-stylish')))
        //.pipe($.uglify())
        .pipe(gulp.dest('dist/scripts'))
        .pipe($.size());
});

gulp.task('images', function () {
    return gulp.src('app/images/**/*')
        .pipe($.imagemin({
            optimizationLevel: 3,
            progressive: true,
            interlaced: true
        }))
        .pipe(gulp.dest('dist/images'))
        .pipe($.size());
});

gulp.task('fonts', function () {
    return gulp.src(bowerFiles().concat(['app/fonts/**/*.*']))
        .pipe($.filter('**/*.{eot,svg,ttf,woff,woff2}'))
        .pipe($.flatten())
        .pipe(gulp.dest('dist/fonts'))
        .pipe($.size());
});

gulp.task('extras', function () {
    return gulp.src(['app/*.*', '!app/*.php'], { dot: true })
        .pipe(gulp.dest('dist'));
});

gulp.task('clean', function (cb) {
    del(['.tmp', 'dist'], cb);
});

gulp.task('build', ['vendorscripts', 'vendorstyles', 'distscripts', 'diststyles', 'images', 'fonts', 'extras']);

gulp.task('default', ['clean'], function () {
    gulp.start('build');
});

gulp.task('serve', ['styles'], function () {
});

gulp.task('watch', ['serve'], function () {
    browserSync.init({
        proxy: 'localhost:8000'
    });

    // watch for changes
    gulp.watch([
        '../templates/**/*.html',
        'dist/scripts/**/*.js',
        'dist/images/**/*'
    ]).on('change', reload);

    gulp.watch('app/styles/**/*.scss', ['styles']);
    gulp.watch('app/scripts/**/*.js', ['scripts']);
    gulp.watch('app/images/**/*', ['images']);
    gulp.watch('bower.json', ['vendorscripts']);
});
