import gulp from "gulp";
import raster from "gulp-raster-update";
import rename from "gulp-rename";

// Convert SVG
gulp.task("default", (done) => {
	gulp
		.src("./node_modules/applescript-svg-icon/src/applescript.svg")
		.pipe(raster())
		.pipe(rename("logo.png"))
		.pipe(gulp.dest("./resources"));
	done();
});
