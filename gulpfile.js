//导入工具包 require('node_modules里对应模块')
var gulp = require('gulp');//本地安装gulp所用到的地方
var  concat = require('gulp-concat');
var uglify = require('gulp-uglify');
//定义一个testLess任务（自定义任务名称）
// gulp.task('testLess', function () {
//     gulp.src('src/less/index.less') //该任务针对的文件
//         .pipe(less()) //该任务调用的模块
//         .pipe(gulp.dest('src/css')); //将会在src/css下生成index.css
// });
gulp.task('concat', function() {
  return gulp.src(['app/assets/js/SysConfig.js', 'app/assets/js/env.js','app/assets/js/apps.js','app/assets/js/yiServer.js','app/assets/articles/detail.js'])
    .pipe(concat('all.js'))
    .pipe(gulp.dest('app/assets/articles'));
});

 
gulp.task('uglify', function() {
  return gulp.src('app/assets/articles/all.js')
    .pipe(uglify())
    .pipe(gulp.dest('app/assets/articles'));
});


gulp.task('default',['concat']); //定义默认任务

//gulp.task(name[, deps], fn) 定义任务  name：任务名称 deps：依赖任务名称 fn：回调函数
//gulp.src(globs[, options]) 执行任务处理的文件  globs：处理的文件路径(字符串或者字符串数组) 
//gulp.dest(path[, options]) 处理完后文件生成路径