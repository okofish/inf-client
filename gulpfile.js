var gulp = require('gulp'),
  uglify = require('gulp-uglify'),
  concat = require('gulp-concat'),
  copy = require('gulp-copy'),
  htmlPrettify = require('gulp-prettify'),
  cssPrettify = require('gulp-cssbeautify'),
  ghPages = require('gulp-gh-pages'),
  browserSync = require('browser-sync'),
  reload = browserSync.reload;

gulp.task('default', ['html', 'css', 'js', 'copy'], function() {
  browserSync.reload();
})

gulp.task('html', function() {
  gulp.src('./src/*.html')
    .pipe(htmlPrettify())
    .pipe(gulp.dest('./build/'));
});

gulp.task('js', function() {
  return gulp.src('./src/js/*.js')
    .pipe(concat('app.js'))
    .pipe(uglify())
    .pipe(gulp.dest('./build/js/'));
});

gulp.task('css', function() {
  gulp.src('./src/css/*.css')
    .pipe(cssPrettify())
    .pipe(gulp.dest('./build/css/'))
});

gulp.task('copy', function() {
  gulp.src(['./src/js/vendor/*', './src/css/vendor/*', './src/CNAME'])
    .pipe(copy('./build/', {
      prefix: 1
    }))
});

gulp.task('watch', function() {
  browserSync({
    server: {
      baseDir: 'build'
    }
  });

  gulp.watch(['*.html', 'css/**/*.css', 'js/**/*.js'], {
    cwd: 'src'
  }, ['default'])
});

gulp.task('deploy', function() {
  return gulp.src('./build/**/*')
    .pipe(ghPages());
});