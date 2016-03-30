//导入工具包 require('node_modules里对应模块')
var gulp = require('gulp');//本地安装gulp所用到的地方
var  concatFile = require('gulp-concat');
var uglify = require('gulp-uglify');
var watch = require('gulp-watch');
var rename= require('gulp-rename');
var obfuscate = require('gulp-obfuscate');

gulp.task('obfuscate',function () {
    return gulp.src('app/assets/articles/detail.all.min.js')
        .pipe(obfuscate())
        .pipe(gulp.dest('app/assets/articles'));
})

gulp.task('obfuscateCeshi',function () {
    return gulp.src('app/assets/articles/ceshi.js')
        .pipe(obfuscate())
        .pipe(gulp.dest('app/assets/articles'));
})

//定义一个testLess任务（自定义任务名称）
// gulp.task('testLess', function () {
//     gulp.src('src/less/index.less') //该任务针对的文件
//         .pipe(less()) //该任务调用的模块
//         .pipe(gulp.dest('src/css')); //将会在src/css下生成index.css
// });
var commonJs=['app/assets/js/SysConfig.js', 'app/assets/js/env.js','app/assets/js/apps.js','app/assets/js/yiServer.js']



gulp.task('concatFile', function() {
  return gulp.src(['app/assets/js/SysConfig.js', 'app/assets/js/env.js','app/assets/js/apps.js','app/assets/js/yiServer.js','app/assets/articles/detail.js'])
    .pipe(concatFile('detail.all.js'))
    .pipe(gulp.dest('app/assets/articles'));
});

// 合并文件-压缩代码-重命名
gulp.task('articles-js-min', function (){
     return gulp.src(commonJs.concat('app/assets/articles/detail.js'))
        .pipe(concatFile('detail.all.js'))
        .pipe(gulp.dest('app/assets/articles'))
        // .pipe(uglify())
        .pipe(rename('detail.all.min.js'))
        .pipe(gulp.dest('app/assets/articles'));

});
// 合并文件-压缩代码-重命名
gulp.task('questions-js-min', function (){
     return gulp.src(commonJs.concat('app/assets/questions/detail.js'))
        .pipe(concatFile('detail.all.js'))
        .pipe(gulp.dest('app/assets/questions'))
        .pipe(uglify())
        .pipe(rename('detail.all.min.js'))
        .pipe(gulp.dest('app/assets/questions'));

});
// 合并文件-压缩代码-重命名
gulp.task('smartDevices-js-min', function (){
     return gulp.src(commonJs.concat('app/assets/smartDevices/detail.js'))
        .pipe(concatFile('detail.all.js'))
        .pipe(gulp.dest('app/assets/smartDevices'))
        .pipe(uglify())
        .pipe(rename('detail.all.min.js'))
        .pipe(gulp.dest('app/assets/smartDevices'));

});
 
// gulp.task('default',['concat']); //定义默认任务

gulp.task('watch',['articles-js-min','questions-js-min','smartDevices-js-min'],function () {

	gulp.watch(['app/assets/js/**/*.js','app/assets/articles/detail.js'],function () {
		gulp.start('articles-js-min');
		console.log('articles-js-min-压缩了');
	});
	gulp.watch(['app/assets/js/**/*.js','app/assets/questions/detail.js'],function () {
		gulp.start('questions-js-min');
		console.log('questions-js-min-压缩了');
	});
	gulp.watch(['app/assets/js/**/*.js','app/assets/smartDevices/detail.js'],function () {
		gulp.start('smartDevices-js-min');
		console.log('smartDevices-js-min-压缩了');
	})
}); //定义默认任务





//gulp.task(name[, deps], fn) 定义任务  name：任务名称 deps：依赖任务名称 fn：回调函数
//gulp.src(globs[, options]) 执行任务处理的文件  globs：处理的文件路径(字符串或者字符串数组) 
//gulp.dest(path[, options]) 处理完后文件生成路径