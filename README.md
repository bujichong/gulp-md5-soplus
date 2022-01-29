# gulp-md5-soplus

> md5 plugin modify form gup-md5-plus[gulp](https://github.com/wpfpizicai/gulp-md5-plus) 

> Modified the default mode of gulp-md5 to modify the file name. It adopts the suffix name mode, which can be controlled by the mode parameter in the option. The default is `'suffix'` mode, that is, the suffix name mode. If you need the filename mode, set this parameter to `'filename'`.

> 修改了 gulp-md5默认修改文件名的模式，模式为后缀名模式，可以通过 option 里的 mode 参数控制，默认为 `'suffix'`模式，即后缀名模式，如果需要文件名模式，将此参数设置为 `'filename'`即可。
## Example
### Gulp code
```javascript
//gulpfile.js task code example

gulp.task('MD5', function (cb) {
	gulp.src([
		"../js/**/*.js",
		"../css/**/*.css"
	]).pipe(md5(5, [
		'./static/css/socss.css',
		'./static/js/main.js',
		'./static/js/requirePaths.js'
	], {
		mappingFile: 'manifest.json'
	}));
	cb();
});
```

### Result
```
/lib/r.js
/lib/petite-vue.0.3.0.umd.js
...

// suffix mode
====>
/lib/rx.js?v=2c4e5
/lib/petite-vue.0.3.0.umd.js?v=80c6b
...

// filename mode
====>
/lib/rx_2c4e5.js
/lib/petite-vue.0.3.0.umd_80c6b.js
...

```

## Usage

First, install `gulp-md5-soplus` as a development dependency:

```shell
npm install --save-dev gulp-md5-soplus
```

Then, add it to your `gulpfile.js`:

```javascript
var md5 = require("gulp-md5-soplus");

gulp.src("./src/*.css")
	.pipe(md5(10,'./output/index.html'))
	.pipe(gulp.dest("./dist"));
```

md5 all css files in the src folder and change these css names in the quoted html--index.html

```javascript

gulp.task('img' ,function() {
    var imgSrc = './static/img/**',
        quoteSrc = './output/static/css/**/*.css', // [./output/static/css/**/*.css',./output/static/js/**/*.js']
        imgDst = './output/static/img';

    return gulp.src(imgSrc)
        .pipe(imagemin())
        .pipe(md5(10 ,quoteSrc))
        .pipe(gulp.dest(imgDst));
});


```

first, optimize all images in the img folder including all sub folders; then md5 all these images and change these images' names in the quoted css files ;


####note
the directory of the md5ed files in the imgDst folder is the same as that of original files in the imgSrc folder; and css files can refer the image file with the same name in different folder rightly;

## API

### md5(size,file,option)

#### size
Type: `String`

Default: null

> you can pass the size to limit the size of the hash that is appended.

#### file
Type: `String | Array`

Default: null

> the file need to replace the file name of the md5ed files. dir is also supported

#### option
Type: `Object`

Default: null

##### option.mode
Type: `String`
value: `'suffix' | 'filename'`

Default: 'suffix'
> Whether to use suffix mode or file name replacement mode, the default is suffix mode

##### option.modeKey
Type: `String`

Default: 'v'
> Default key value in suffix mode

##### option.dirLevel
Type: `Number`

Default: null

> used to match the file with it's directory path. for example: there is a file `Dev/work/gulp-md5-plus/demo/source/img/sub_img/same.svg`;when setting `dirLevel` to *1*, the plugin will use `sub_img/same.svg` to find this file in the quoted files;this option's main purpose is to replace the files with the same name in different paths. you can see demo for detail.

Example:
```javascript
	gulp.task('img' , ['css'],function() {
	    gulp.src('./source/img/**/*')
	        .pipe(md5(10 ,'./output/css/*.css',{
	        	dirLevel : 1,
	        	mappingFile: 'manifest.json',
        		connector: '.'
	        }))
	        .pipe(gulp.dest('./output/img/'));
	});
```

The sample above will append the md5 hash(length : 10) to each of the file in the static/js folder then repalce the link file name in the output/html/ using md5ed file name; at last store all of that into the *output* folder.

##### option.connector
Type: `String`

Default: `_`

> used to set the output file‘s connector; if use `.` the outfile will look like `imgfile.5546983ac2.png` ,while default is `imgfile_5546983ac2.png` 


##### option.mappingFile
Type: `String`

Default: null 

> set the file to write the mapping result ,for example `manifest.json`  

after set this option ;you should remove this file before `gulp`; you can follow the demo;

## License

http://en.wikipedia.org/wiki/MIT_License[MIT License]


