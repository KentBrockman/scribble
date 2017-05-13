// Load plugins
const gulp = require('gulp');
const shell = require('gulp-shell');
const lr = require('tiny-lr');
const argv = require('optimist').argv;
var server = lr();

gulp.task('tf-fmt', shell.task(['terraform fmt']));
gulp.task('tf-build', shell.task(['terraform plan']));

function isLineCommented(line) {

}

// TODO: parse common errors (e.g. terraform get)
// TODO: dive into terraform modules and watch there as well...

// // Styles
// gulp.task('styles', function() {
//   return gulp.src('src/styles/main.scss')
//     .pipe(sass({ style: 'expanded', }))
//     .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
//     .pipe(gulp.dest('dist/styles'))
//     .pipe(rename({ suffix: '.min' }))
//     .pipe(minifycss())
//     .pipe(livereload(server))
//     .pipe(gulp.dest('dist/styles'))
//     .pipe(notify({ message: 'Styles task complete' }));
// });

// // Scripts
// gulp.task('scripts', function() {
//   return gulp.src('src/scripts/**/*.js')
//     .pipe(jshint('.jshintrc'))
//     .pipe(jshint.reporter('default'))
//     .pipe(concat('main.js'))
//     .pipe(gulp.dest('dist/scripts'))
//     .pipe(rename({ suffix: '.min' }))
//     .pipe(uglify())
//     .pipe(livereload(server))
//     .pipe(gulp.dest('dist/scripts'))
//     .pipe(notify({ message: 'Scripts task complete' }));
// });

// // Images
// gulp.task('images', function() {
//   return gulp.src('src/images/**/*')
//     .pipe(cache(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true })))
//     .pipe(livereload(server))
//     .pipe(gulp.dest('dist/images'))
//     .pipe(notify({ message: 'Images task complete' }));
// });

// // Clean
// gulp.task('clean', function() {
//   return gulp.src(['dist/styles', 'dist/scripts', 'dist/images'], {read: false})
//     .pipe(clean());
// });

// Default task
gulp.task('default', () => {
    gulp.run('tf-build');
});

// Watch
gulp.task('watch', function() {

  // Listen on port 35729
  server.listen(35729, function (err) {
    if (err) {
      return console.log(err)
    };

    // TODO: get modules and add to watch

    // scan each .tf file in directory for modules
    var toWatch = [];
    var directory = argv.cwd;
    const fs = require('fs');
    fs.readdir(directory, (err, files) => {
      files.forEach(file => {
        if (file.substring(file.length - 3, file.length) == ".tf") {
          var watchForSource = false;

          var lineReader = require('readline').createInterface({
            input: require('fs').createReadStream(file)
          });

          lineReader.on('line', function (line) {
            if (line.includes('module "')) {
              watchForSource = true;
            }

            if (watchForSource && line.includes('source')) {
              var dir = line.match(/(?:"[^"]*"|^[^"]*$)/)[0].replace(/"/g, "") + '/*';
              toWatch.push(dir);
              console.log(dir);
              watchForSource = false;
            }
          }).on('close', () => {
              toWatch.push('*.tf');
              toWatch.push('*.tfvars');

              console.log('Watching ', toWatch);

              gulp.watch(toWatch, function(event) {
                console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
                gulp.run('tf-fmt', 'tf-build');
              })
          })
        }
      })
    })

  });

});

// // Watch
// gulp.task('watch', function() {

//   // Listen on port 35729
//   server.listen(35729, function (err) {
//     if (err) {
//       return console.log(err)
//     };

//     // Watch .scss files
//     gulp.watch('src/styles/**/*.scss', function(event) {
//       console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
//       gulp.run('styles');
//     });

//     // Watch .js files
//     gulp.watch('src/scripts/**/*.js', function(event) {
//       console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
//       gulp.run('scripts');
//     });

//     // Watch image files
//     gulp.watch('src/images/**/*', function(event) {
//       console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
//       gulp.run('images');
//     });

//   });

// });