var gulp = require('gulp'), // Сообственно Gulp JS
    jade = require('gulp-jade'), // Плагин для Jade
    stylus = require('gulp-stylus'), // Плагин для Stylus
    nib = require('nib'), //библиотека для stylus
    livereload = require('gulp-livereload'), // Livereload для Gulp
    myth = require('gulp-myth'), // Плагин для Myth - http://www.myth.io/
    csso = require('gulp-csso'), // Минификация CSS
    imagemin = require('gulp-imagemin'), // Минификация изображений
    uglify = require('gulp-uglify'), // Минификация JS
    concat = require('gulp-concat'), // Склейка файлов
    connect = require('connect'); // Webserver

// Собираем Stylus
gulp.task('stylus', function () {
    gulp.src('./source/stylus/app.styl')
        .pipe(stylus({
            use: nib()
        })) // собираем stylus
        .on('error', console.log) // Если есть ошибки, выводим и продолжаем
        //.pipe(myth()) // добавляем префиксы - http://www.myth.io/
        .pipe(gulp.dest('./public/css/')) // записываем css
        .pipe(livereload()); // даем команду на перезагрузку css
});

// Собираем html из Jade
gulp.task('jade', function () {
    gulp.src(['./source/jade/*.jade', '!./source/jade/_*.jade'])
        .pipe(jade({
            pretty: true
        }))  // Собираем Jade только в папке ./source/template/ исключая файлы с _*
        .on('error', console.log) // Если есть ошибки, выводим и продолжаем
        .pipe(gulp.dest('./public')) // Записываем собранные файлы
        .pipe(livereload()); // даем команду на перезагрузку страницы
});

// Собираем JS
gulp.task('js', function () {
    gulp.src(['./source/js/**/*.js', '!./source/js/vendor/**/*.js'])
        .pipe(concat('app.js')) // Собираем все JS, кроме тех которые находятся в ./source/js/vendor/**
        .pipe(gulp.dest('./public/js'))
        .pipe(livereload()); // даем команду на перезагрузку страницы
});

// Копируем и минимизируем изображения
gulp.task('images', function () {
    gulp.src('./source/img/**/*')
        .pipe(imagemin())
        .pipe(gulp.dest('./public/img'))
        .pipe(livereload())
});

// Локальный сервер для разработки
gulp.task('http-server', function () {
    connect()
        .use(require('connect-livereload')())
        .use(connect.static('./public'))
        .listen('9000');

    console.log('Server listening on http://localhost:9000');
});

// Запуск сервера разработки gulp watch
gulp.task('watch', ['stylus', 'jade', 'images', 'js', 'http-server'], function () {
    // Подключаем Livereload
    livereload.listen();
    gulp.watch('source/stylus/**/*.styl', ['stylus']);
    gulp.watch('source/jade/**/*.jade', ['jade']);
    gulp.watch('source/img/**/*', ['images']);
    gulp.watch('source/js/**/*', ['js']);
});

// сборка проекта
gulp.task('build:css', function () {
    gulp.src('./source/stylus/app.styl')
        .pipe(stylus({
            use: nib()
        })) // собираем stylus
        //.pipe(myth()) // добавляем префиксы - http://www.myth.io/
        .pipe(csso()) // минимизируем css
        .pipe(gulp.dest('./build/css/')); // записываем css
});

gulp.task('build:jade', function () {
    // jade
    gulp.src(['./source/jade/*.jade', '!./source/jade/_*.jade'])
        .pipe(jade())
        .pipe(gulp.dest('./build'));
});

gulp.task('build:js', function () {
    gulp.src(['./source/js/**/*.js', '!./source/js/vendor/**/*.js'])
        .pipe(concat('app.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./build/js'));
});

gulp.task('build:images', function () {
    gulp.src('./source/img/**/*')
        .pipe(imagemin())
        .pipe(gulp.dest('./build/img'));
});

gulp.task('build:vendor', function () {
    // @todo concat + minify
    var vendors = [
        './public/vendor/**/*.{js,css,png,jpg,gif}',
        '!./public/vendor/**/{src,lib,demo,external}{,/**}'
    ];
    gulp.src(vendors).pipe(gulp.dest('./build/vendor'));
});

gulp.task('build', [
    'build:css',
    'build:jade',
    'build:js',
    'build:images',
    'build:vendor'
]);