 // Dependencies
const gulp = require('gulp');
const raster = require('gulp-raster');
const rename = require('gulp-rename');

// Convert SVG
gulp.task('default', (done) => {
  gulp.src('./node_modules/applescript-svg-icon/src/applescript.svg')
    .pipe(raster())
    .pipe(rename('logo.png'))
    .pipe(gulp.dest('./images'));
  done();
});
