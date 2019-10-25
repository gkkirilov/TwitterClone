var gulp = require('gulp');
var browsersync = require('browser-sync').create();
var sass = require('gulp-sass');
var plumber = require('gulp-plumber');
const sourcemaps = require('gulp-sourcemaps');

function plumbError() {
  return plumber({
    errorHandler: function (err) {
      notify.onError({
        templateOptions: {
          date: new Date()
        },
        title: "Gulp error in " + err.plugin,
        message: err.formatted
      })(err);
      beeper();
      this.emit('end');
    }
  })
}

// Compile sass into CSS & auto-inject into browsers
function sass() {
  return gulp.src(['node_modules/bootstrap/scss/bootstrap.scss', 'src/scss/*.scss'])
    .pipe(plumber())
    .pipe(sass())
    .pipe(gulp.dest("src/css"))
    .pipe(browserSync.stream());
};

// Move the javascript files into our /src/js folder
function js() {
  return gulp.src(['node_modules/bootstrap/dist/js/bootstrap.min.js', 'node_modules/jquery/dist/jquery.min.js', 'node_modules/popper.js/dist/umd/popper.min.js', 'src/js/*.js'])
    .pipe(plumber())
    .pipe(gulp.dest("src/js"))
    .pipe(browserSync.stream());
};

function buildStyles() {
  return gulp.src(['node_modules/bootstrap/scss/bootstrap.scss', 'src/scss/*.scss'])
    .pipe(plumbError()) // Global error handler through all pipes.
    .pipe(sourcemaps.init())
    .pipe(sass({ outputStyle: 'compressed' }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('src/css/'))
    .pipe(browsersync.reload({ stream: true }))
    .pipe(browsersync.reload("src/*.html"));
}

function watchFiles() {
  gulp.watch(
    ['node_modules/bootstrap/scss/bootstrap.scss', 'src/scss/*.scss', 'src/index.html'],
    { events: 'all', ignoreInitial: false },
    gulp.series(buildStyles)
  );
}

function browserSync(done) {
  browsersync.init({
    server: "./src", 
    socket: {
      domain: 'localhost:3000'
    }
  });
  done();
}

// Static Server + watching scss/html files
function serve(done) {
  browserSync.init({
    server: "./src"
  });

  gulp.watch('src/scss/*.scss', gulp.series('sass'));
  gulp.watch("src/*.html").on('change', browserSync.reload);
  done();
};

exports.default = gulp.parallel(browserSync, watchFiles)
// gulp.task('default', ['js', 'sass', 'serve']);