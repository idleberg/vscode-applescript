 /*
 * vscode-gulpfile.js
 *
 * Copyright (c) 2016 Jan T. Sott
 * Licensed under the MIT license.
 */

 // Dependencies
const gulp = require('gulp');
const debug = require('gulp-debug');
const eslint = require('gulp-eslint');
const jsonlint = require('gulp-jsonlint');
const xmlVal = require('gulp-xml-validator');

// Supported files
const jsFiles = [
  'lib/*.js',
  'src/*.js',
];

const jsonFiles = [
  '*.json',
  'snippets/*.json'
];

const xmlFiles = [
  'syntaxes/*.tmLanguage'
];

// Available tasks
gulp.task('lint', ['lint:js', 'lint:json', 'lint:xml']);

// Lint JavaScript
gulp.task('lint:js', () => {
  return gulp.src(jsFiles)
    .pipe(debug({title: 'eslint'}))
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

// Lint JSON
gulp.task('lint:json', function(){
  return gulp.src(jsonFiles)
    .pipe(debug({title: 'json-lint'}))
    .pipe(jsonlint())
    .pipe(jsonlint.failAfterError())
    .pipe(jsonlint.reporter());
});

// Validate XML
gulp.task('lint:xml', function() {
  return gulp.src(xmlFiles)
    .pipe(debug({title: 'xml-validator'}))
    .pipe(xmlVal());
});
