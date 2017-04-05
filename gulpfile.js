const autoprefixer = require('gulp-autoprefixer'),
    babili = require('gulp-babili'),
    cleanCSS = require('gulp-clean-css'),
    concat = require('gulp-concat'),
    del = require('del'),
    gulp = require('gulp'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps');

// *********************************************************
// Define your entries here.
// *********************************************************
const entry = {
    app: {
        scripts: {
            join: [
                'assets/js/index.js',
            ],
            to: 'app.js'
        },
        styles: 'assets/scss/app.scss'
    },

    core: {
        scripts: {
            join: [
                'assets/js/core/core.js',
                'assets/js/core/utils/logger.js',
                'assets/js/core/ui/layout.js',
            ],
            to: 'core.js'
        }
    }
};
// *********************************************************
// End of entries definition.
// *********************************************************

// *********************************************************
// Customize your assets path here.
// *********************************************************
const path = {
    src: {
        images: 'assets/img/**/*',
        scripts: 'assets/js/**/*.js',
        styles: 'assets/scss/**/*.scss'
    },
    dest: {
        base: './static/',
        images: './static/img/',
        scripts: './static/js/',
        styles: './static/css/'
    }
};
// *********************************************************
// End of assets path customization.
// *********************************************************

// Handle errors.
function handleError(err) {
    console.error(err);
    this.emit('end');
}

// Exclude joined scripts from copying.
function makeScriptsCopyGlob() {
    const result = [path.src.scripts];
    for (let e in entry) {
        const join = entry[e].scripts.join;
        for (let i = 0; i < join.length; i++) {
            result.push(`!${join[i]}`);
        }
    }
    return result;
}

// Process entry scripts.
function defineEntryScriptTasks() {
    const result = [];
    for (let e in entry) {
        if (!entry[e].scripts) {
            continue;
        }

        const taskName = `scripts:${e}`,
            join = entry[e].scripts.join,
            to = entry[e].scripts.to;

        gulp.task(taskName, () => {
            return gulp.src(join)
                .pipe(sourcemaps.init())
                .pipe(concat(to))
                .pipe(sourcemaps.write())
                .pipe(gulp.dest(path.dest.scripts));
        });

        result.push(taskName);
    }
    return result;
}

function defineEntryScriptTasksProd() {
    const result = [];
    for (let e in entry) {
        if (!entry[e].scripts) {
            continue;
        }

        const taskName = `scripts:${e}-prod`,
            join = entry[e].scripts.join,
            to = entry[e].scripts.to;

        gulp.task(taskName, () => {
            return gulp.src(join)
                .pipe(concat(to))
                .pipe(babili().on('error', handleError))
                .pipe(gulp.dest(path.dest.scripts));
        });
        result.push(taskName);
    }
    return result;
}

// Process entry styles.
function defineEntryStyleTasks() {
    const result = [];
    for (let e in entry) {
        if (!entry[e].styles) {
            continue;
        }

        const taskName = `styles:${e}`,
            styles = entry[e].styles;

        gulp.task(taskName, () => {
            return gulp.src(styles)
                .pipe(sourcemaps.init())
                .pipe(sass().on('error', sass.logError))
                .pipe(sourcemaps.write())
                .pipe(gulp.dest(path.dest.styles));
        });

        result.push(taskName);
    }
    return result;
}

function defineEntryStyleTasksProd() {
    const result = [];
    for (let e in entry) {
        if (!entry[e].styles) {
            continue;
        }

        const taskName = `styles:${e}-prod`,
            styles = entry[e].styles;

        gulp.task(taskName, () => {
            return gulp.src(styles)
                .pipe(sass().on('error', sass.logError))
                .pipe(autoprefixer())
                .pipe(cleanCSS())
                .pipe(gulp.dest(path.dest.styles));
        });
        result.push(taskName);
    }
    return result;
}

// Clean dest scripts folder.
gulp.task('clean:scripts', () => del(path.dest.scripts));

// Clean dest styles folder.
gulp.task('clean:styles', () => del(path.dest.styles));

// Clean dest images folder.
gulp.task('clean:images', () => del(path.dest.images));

// Clean dest folder.
gulp.task('clean',
    gulp.parallel('clean:scripts', 'clean:styles', 'clean:images'));

// Copy scripts.
const scriptsCopyGlob = makeScriptsCopyGlob();
gulp.task('scripts:copy', () => {
    return gulp.src(scriptsCopyGlob)
        .pipe(gulp.dest(path.dest.scripts));
});

// Process scripts.
gulp.task('scripts',
    gulp.parallel(['scripts:copy'].concat(defineEntryScriptTasks())));
gulp.task('scripts-prod',
    gulp.parallel(['scripts:copy'].concat(defineEntryScriptTasksProd())));

// Process SASS.
gulp.task('styles', gulp.parallel(defineEntryStyleTasks()));
gulp.task('styles-prod', gulp.parallel(defineEntryStyleTasksProd()));

// Copy all static images.
gulp.task('images', () => {
    return gulp.src(path.src.images)
        .pipe(gulp.dest(path.dest.images));
});

// Build assets.
gulp.task('build', gulp.parallel('scripts', 'styles', 'images'));
gulp.task('build-prod', gulp.parallel('scripts-prod', 'styles-prod', 'images'));

// Watch for assets change.
gulp.task('watch', () => {
    gulp.watch(path.src.scripts, { usePolling: true }, gulp.parallel('scripts'));
    gulp.watch(path.src.styles, { usePolling: true }, gulp.parallel('styles'));
});

// The default task (called when you run `gulp` from cli).
gulp.task('default', gulp.parallel('build', 'watch'));

// The production build.
gulp.task('prod', gulp.series('clean', 'build-prod'));
