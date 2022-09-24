const gulp = require('gulp')
const rename = require('gulp-rename')
const sass = require('gulp-sass')(require('sass'))
const cleanCSS = require('gulp-clean-css')
const del = require('del')

const paths = {
  dist: {
    src: 'src/**/*.html',
    dest: 'dist/'
  },
  styles: {
    src: 'src/styles/**/*.scss',
    dest: 'dist/assets/styles/'
  }
}

function clean() {
  return del(['dist'])
}

function copyHTML() {
  return gulp.src(paths.dist.src).pipe(gulp.dest(paths.dist.dest))
}

function styles() {
  return gulp
    .src(paths.styles.src)
    .pipe(sass().on('error', sass.logError))
    .pipe(cleanCSS())
    .pipe(
      rename({
        basename: 'main',
        suffix: '.min'
      })
    )
    .pipe(gulp.dest(paths.styles.dest))
}

function watch() {
  gulp.watch(paths.styles.src, styles)
}

const build = gulp.series(clean, gulp.parallel(copyHTML, styles))

exports.clean = clean
exports.copyHTML = copyHTML
exports.styles = styles
exports.watch = watch
exports.build = build
exports.default = build
