var gulp = require('gulp');
var connect = require('gulp-connect');
var usemin = require('gulp-usemin');
var uglify = require('gulp-uglify');
var minifyCss = require('gulp-minify-css');

gulp.task('connect', function() {
   connect.server({
    port:80,
    root: ['src','bower_components'],
    livereload: true
  });
});

gulp.task('bower', function() {
  return bower({ directory: './vendor' })
});

gulp.task('check', function() {
    return gulp.src('./js/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});
gulp.task('zip',function(){
	 gulp.src('src/index.html')
        .pipe(usemin({
            assetsDir: 'bower_components',
            css: [minifyCss(), 'concat'],
            js: [uglify(), 'concat']
        }))
        .pipe(gulp.dest('dist'));
})
gulp.task('default', ["connect"]);
gulp.task('serve', ["connect"]);