const gulp = require("gulp");
const terser = require("gulp-terser");

gulp.task("minify", function () {
  return gulp.src("build/**/*.js").pipe(terser()).pipe(gulp.dest("build/"));
});
