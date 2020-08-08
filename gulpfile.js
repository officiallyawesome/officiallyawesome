"use strict";

// Load plugins
const browsersync = require("browser-sync").create();
const cp = require("cross-spawn");
const del = require("del");
const gulp = require("gulp");
const responsive = require('gulp-responsive')
const imagemin = require("gulp-imagemin");
const newer = require("gulp-newer");
const rename = require("gulp-rename");
const size = require('gulp-size');

// BrowserSync
function browserSync(done) {
  browsersync.init({
    server: {
      baseDir: "./_site/"
    },
    port: 4000
  });
  done();
}

// BrowserSync Reload
function browserSyncReload(done) {
  browsersync.reload();
  done();
}

// Clean assets
function clean() {
  // return del(["./dist/"]);
}

// Optimize Images
function images() {
  return gulp
    .src("./src_images/**/*")
    .pipe(newer("./dist"))
    .pipe(
      imagemin([
        imagemin.gifsicle({ interlaced: true }),
        imagemin.mozjpeg({ quality: 75, progressive: true }),
        imagemin.optipng({ optimizationLevel: 5 }),
        imagemin.svgo({
          plugins: [
            {
              removeViewBox: false,
              collapseGroups: true
            }
          ]
        })
      ])
    )
    .pipe(gulp.dest("./dist"));
}

// Jekyll
function jekyll() {
  return cp.spawn("bundle", ["exec", "jekyll", "build", "--incremental"], { stdio: "inherit" });
}

// Watch files
function watchFiles() {
  gulp.watch(
    [
      "./_includes/**/*",
      "./_layouts/**/*",
      "./_pages/**/*",
      "./_posts/**/*",
      "./_referee-school/**/*",
      "./_resources/**/*"
    ],
    gulp.series(jekyll, browserSyncReload)
  );
  gulp.watch("./assets/img/**/*", images);
}

// define complex tasks
const build = gulp.series(gulp.parallel(images, jekyll));
const watch = gulp.parallel(watchFiles, browserSync);

// export tasks
exports.images = images;
exports.jekyll = jekyll;
exports.clean = clean;
exports.build = build;
exports.watch = watch;
exports.default = build;
