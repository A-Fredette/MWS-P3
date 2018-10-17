var gulp = require('gulp');
var responsive = require('gulp-responsive');

function defaultTask(cb) {
    console.log('gulp enabled');
  cb();
}

gulp.task('images', function () {
  return gulp.src('src/*.{jpg,png}')
    .pipe($.responsive({
      '*.jpg': {
        // Resize all JPG images to 200 pixels wide
        width: 200,
      },
      '*.png': {
        // Resize all PNG images to 50% of original pixels wide
        width: '50%',
      },
      // Resize all images to 100 pixels wide and add suffix -thumbnail
      '*': {
        width: 100,
        rename: { suffix: '-thumbnail' },
      },
    }, {
      // Global configuration for all images
      // The output quality for JPEG, WebP and TIFF output formats
      quality: 70,
      // Use progressive (interlace) scan for JPEG and PNG output
      progressive: true,
      // Zlib compression level of PNG output format
      compressionLevel: 6,
      // Strip all metadata
      withMetadata: false,
    }))
    .pipe(gulp.dest('dist'));
});

exports.default = defaultTask;