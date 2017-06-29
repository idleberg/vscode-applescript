 /*
 * vscode-gulpfile.js
 *
 * Copyright (c) 2016, 2017 Jan T. Sott
 * Licensed under the MIT license.
 */

 // Dependencies
const gulp = require('gulp');
const debug = require('gulp-debug');
const jsonlint = require('gulp-jsonlint');
const svg2png = require('gulp-svg2png');
const xmlVal = require('gulp-xml-validator');

// Supported files
const tsFiles = [
  'src/*.ts',
];

const jsonFiles = [
  'package.json',
  'snippets/*.json',
  'tsconfig.json',
  'tslint.json'
];

const xmlFiles = [
  'syntaxes/*.tmLanguage'
];

const svgFiles = [
  'src/logo.svg'
];

// Lint JSON
gulp.task('lint:json', gulp.series( (done) => { 
  gulp.src(jsonFiles)
    .pipe(debug({title: 'json-lint'}))
    .pipe(jsonlint())
    .pipe(jsonlint.failAfterError())
    .pipe(jsonlint.reporter());
  done();
}));

// Validate XML
gulp.task('lint:xml', gulp.series( (done) => { 
  gulp.src(xmlFiles)
    .pipe(debug({title: 'xml-validator'}))
    .pipe(xmlVal());
  done();
}));

// Convert SVG
gulp.task('convert:svg', gulp.series( (done) => { 
  gulp.src(svgFiles)
    .pipe(svg2png({width: 128, height: 128}))
    .pipe(gulp.dest('./images'));
  done();
}));

// Available tasks
gulp.task('lint', gulp.parallel('lint:json', 'lint:xml', (done) => {
  done();
}));
gulp.task('build', gulp.parallel('convert:svg', (done) => {
  done();
}));
