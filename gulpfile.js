import gulp from 'gulp';
import plumber from 'gulp-plumber';
import less from 'gulp-less';
import postcss from 'gulp-postcss';
import rename from 'gulp-rename';
import autoprefixer from 'autoprefixer';
import browser from 'browser-sync';
import squoosh from 'gulp-libsquoosh';
import htmlmin from 'gulp-htmlmin';
import csso from 'postcss-csso';
import terser from 'gulp-terser';
import webp from 'gulp-webp';
import svgstore from 'gulp-svgstore';
import sourcemap from 'gulp-sourcemaps';
import {deleteAsync} from 'del';


// HTML

export const html = () => {
  return gulp.src('source/**/*.html')
      .pipe(htmlmin({ collapseWhitespace: true }))
      .pipe(gulp.dest('build'))
}

//images

export const optimizeImages = () => {
  return gulp.src('source/**/*.{png,svg,jpg}')
    .pipe(squoosh())
    .pipe(gulp.dest('build/img'))
}

export const copyImage = () => {
  return gulp.src('source/**/*.{png,svg,jpg}')
    .pipe(gulp.dest('build/img'))
}

export const createWebp = () => {
  return gulp.src('source/img/**/*.{jpg,png}')
    .pipe(webp({ quality: 90 }))
    .pipe(gulp.dest('build/img'))
}
// Styles

export const styles = () => {
  return gulp.src('source/less/style.less', { sourcemaps: true })
    .pipe(plumber())
    .pipe(less())
    .pipe(postcss([
      autoprefixer(),
      csso()
    ]))
    .pipe(rename('style.min.css'))
    .pipe(gulp.dest('build/css', { sourcemaps: '.' }))
    .pipe(browser.stream())
}

// SCRiPTS

export const scripts = () => {
  return gulp.src('source/js/script.js')
    .pipe(terser())
    .pipe(rename('script.min.js'))
    .pipe(gulp.dest('build'))
}

// COPY Files

export const copy = () => {
  return gulp.src([
    'source/**/*.{woff,woff2}',
    'source/*.ico',
    'source/*.svg'
  ])
  .pipe(gulp.dest('build'))
}

// Clean - delete Build

export const clean = () => {
  return deleteAsync('build')
}

// Server

const server = (done) => {
  browser.init({
    server: {
      baseDir: 'build'
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}

// Watcher

const watcher = () => {
  gulp.watch('source/less/**/*.less', gulp.series(styles));
  gulp.watch('source/**/*.js', gulp.series(scripts));
  gulp.watch('source/*.html').on('change', browser.reload);
}


export default gulp.series(
  html,
  styles,
  // scripts,
  copy,
  copyImage,
  createWebp,
  server,
  watcher
);

export const build = gulp.series(
  clean,
  copy,
  optimizeImages,
  gulp.parallel(
    html,
    createWebp,
    styles,
  )
)
