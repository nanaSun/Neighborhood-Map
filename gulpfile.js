var gulp = require('gulp');
var connect = require('gulp-connect');
var jshint = require('gulp-jshint');
var usemin = require('gulp-usemin');
var uglify = require('gulp-uglify');
var minifyCss = require('gulp-minify-css');
var htmlmin = require('gulp-htmlmin');

const http = require("http");
const fs = require("fs");
const yelp = require('yelp-fusion');
//https://www.npmjs.com/package/yelp-fusion
function onrequest(request, response){
    const access_token="7Yj_PenZLmuck0zfPI6uJZELH7mXSfT_CicA4DpddzwwjBKhUNpD5weHrPEUzbmeSM1HAUtvkCgMnyryn6JyxcGGbfLX8forYwCuagbMwiU-SFl4O85T9IU2TAo4WXYx";
    const searchRequest = {
        id: "gary-danko-san-francisco"
    };
    response.writeHead(200,{"Content-Type":"application/json","Access-Control-Allow-Origin":"http://localhost"});
    const client = yelp.client(access_token);
            client.business("gary-danko-san-francisco").then(data => {
            const prettyJson = JSON.stringify(data, null, 4);
            response.write(prettyJson);
             response.end();
        });
}

gulp.task('connect', function() {
    http.createServer(onrequest).listen(8888);
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
    return gulp.src(['./src/scripts/*.js','./dist/scripts/*.js'])
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});
gulp.task('zip',function(){
	 gulp.src('./src/*.html')
        .pipe(usemin({
            assetsDir: 'bower_components',
            js: [uglify(), 'concat']
        }))
        .pipe(gulp.dest('dist'));
    gulp.src('./src/scripts/*.js')
        .pipe(uglify())
        .pipe(gulp.dest('dist/scripts'));
    gulp.src('./src/styles/*.css')
        .pipe(minifyCss())
        .pipe(gulp.dest('dist/styles'));
})
gulp.task('default', ["connect"]);
gulp.task('serve',  function() {
   connect.server({
    port:80,
    root: ['dist'],
    livereload: true
  });
});