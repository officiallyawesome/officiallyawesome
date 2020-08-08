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
  return del(["assets/images"]);
}

// Creates optimized versions of files with different qualities, sizes, and
// formats, then outputs to appropriate location(s)
function images() {
  var imageConfigs = [];
  var addToImageConfigs = function(srcFilename, widths, formats, quality, scale) {
    for (var i = widths.length - 1; i >= 0; i--) {
      for (var j = formats.length - 1; j >= 0; j--) {
        var imageConfig = {
          name: srcFilename,
          width: widths[i] * scale,
          format: formats[j],
          quality: quality,
          rename: { suffix: "@" + widths[i] + "w" },
          progressive: true
        };
        imageConfigs.push(imageConfig);
      }
    }
  };

  // 375, 750, 1024, 1125, 1280, 1440, 1920
  addToImageConfigs('hero/*.jpg', [1280], ['jpg', 'webp'], 60, 1.1);
  addToImageConfigs('screenshots/*.png', [400, 800], ['png', 'webp'], 100, 1);
  addToImageConfigs('screenshots/*.jpg', [400, 800], ['jpg', 'webp'], 95, 1);
  addToImageConfigs('logo.png', [200, 600], ['png', 'webp'], 100, 1);

  return gulp.src("src_images/**/*.{png,jpg}")
    .pipe(responsive(imageConfigs, {
      errorOnUnusedImage: false,
      progressive: true
    }))
    .pipe(imagemin({ progressive: true }))
    .pipe(gulp.dest("assets/images"))
    .pipe(browsersync.stream())
    .pipe(size({
      showFiles: true
    }));
}

// Jekyll
function jekyll() {
  return cp.spawn("bundle", ["exec", "jekyll", "build", "--incremental"], {
    stdio: "inherit"
  });
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
      "./_resources/**/*",
      "./index.md"
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
