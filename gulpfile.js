let gulp = require('gulp');
let concat = require('gulp-concat');
let watch = require('gulp-watch');

gulp.task('js', function() {
  gulp.src([
    'src/js/main.js',
    'src/js/**/*.js',
    'src/pages/**/*.js'
  ])
  .pipe(concat('bundle.js'))
  .pipe(gulp.dest('www/'));
});

gulp.task('default', function() {
  gulp.start('js');
});

gulp.task('watch', function() {
  gulp.start('default');
	watch([
		'src/js/**/*.js',
		'src/pages/**/*.js'
	], function() {
		gulp.start('js');
	});
});
