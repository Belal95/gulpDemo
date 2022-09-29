const { parallel, dest, src, watch, series } = require("gulp");
const concat = require("gulp-concat");
const htmlMini = require("gulp-htmlmin");
const cleanCss = require("gulp-clean-css");
const imgMini = require("gulp-imagemin");
const terser = require("gulp-terser");
const processHTML = require("gulp-processhtml");
const browserSync = require("browser-sync");
var rewriteImagePath = require("gulp-replace-image-src");
/** file sources */
const devFolder = {
  html: "project/**/*.html",
  css: "project/css/**/*.css",
  js: "project/js/**/*.js",
  img: "project/pics/**/*.{jpg,png}",
};

const prodFolder = {
  html: "dist/",
  css: "dist/assets/css",
  js: "dist/assets/js",
  img: "dist/images",
};
/** Minifies the html from development to production */
const minifyHTML = () =>
  src(devFolder.html)
    .pipe(processHTML())
    .pipe(rewriteImagePath({ prependSrc: "./images/", keepOrigin: false }))
    .pipe(htmlMini({ collapseWhitespace: true, removeComments: true }))
    .pipe(dest(prodFolder.html));

/** Concat the css files & minifies them from development to production */
const minifyCSS = () =>
  src(devFolder.css)
    .pipe(concat("style.min.css"))
    .pipe(cleanCss())
    .pipe(dest(prodFolder.css));

/** Concat the js files & minifies them from development to production */
const minifyJS = () =>
  src(devFolder.js)
    .pipe(concat("main.min.js"))
    .pipe(terser())
    .pipe(dest(prodFolder.js, { sourcemaps: "." }));

/** Minifies the images from development to production */
const minifyImgs = () =>
  src(devFolder.img).pipe(imgMini()).pipe(dest(prodFolder.img));

const serve = (done) => {
  browserSync({
    server: {
      baseDir: "/dist/",
    },
  });
  done();
};

/**
 *
 * @param {} done
 */
const reloadTask = (done) => {
  browserSync.reload();
  done();
};

const watchTasks = () => {
  watch(devFolder.html, series(minifyHTML, reloadTask));
  watch(devFolder.css, series(minifyCSS, reloadTask));
  watch(devFolder.js, series(minifyJS, reloadTask));
  watch(devFolder.img, series(minifyImgs, reloadTask));
};

exports.default = series(
  parallel(minifyHTML, minifyCSS, minifyJS, minifyImgs),
  serve,
  watchTasks
);
