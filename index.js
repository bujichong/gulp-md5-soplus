var path = require('path')
, gutil = require('gulp-util')
, through = require('through2')
, crypto = require('crypto')
, fs = require('fs')
, glob = require('glob')
, jsonfile = require('jsonfile')
, pathsep = path.posix.sep;

module.exports = function (size, ifile, option) {
  size = size | 0;
  option = option || {};
  var md5_mapping = {};
  var connector = option.connector || "_";
  var mode = option.mode || 'suffix';//suffix | filename ，不指定为filename模式，默认后缀模式
  var modeKey = option.modeKey || 'v';//suffix 模式下？后的key值
  return through.obj(function (file, enc, cb) {

    if (file.isStream()) {
      this.emit('error', new gutil.PluginError('gulp-debug', 'Streaming not supported'));
      return cb();
    }

    if (!file.contents) {
      return cb();
    }

        var d = calcMd5(file, size)
        , filename = path.basename(file.path)
        , relativepath = path.relative(file.base ,file.path)
        , sub_namepath = relativepath.replace(new RegExp(filename) , "").split(pathsep).join('/')
        , dir;
        if(file.path[0] == '.'){
            dir = path.join(file.base, file.path);
        } else {
            dir = file.path;
        }
        dir = path.dirname(dir);

        var md5_filename;
        if(mode=='filename'){
          md5_filename = filename.split('.').map(function(item, i, arr){
            return i == arr.length-2 ? item + connector + d : item;
          }).join('.');
        }else{//Change to version number mode
          filename = filename.indexOf("?")>=0 ? filename.split("?")[0] : filename;
          md5_filename = filename + '?' + modeKey + '=' + d;
        }

    var levelDir = "";
    if (option.dirLevel) {
      levelDir = getLevelDir(dir, option.dirLevel).join(pathsep);
    }

    md5_mapping[filename] = md5_filename; //add mappinig to json;

    var l_filename = path.posix.join(levelDir, filename);
    var l_md5_filename = path.posix.join(levelDir, md5_filename);


    if (Object.prototype.toString.call(ifile) == "[object Array]") {//array
      ifile.forEach(function (i_ifile) {
        convertFile(mode,i_ifile,l_filename,l_md5_filename);
      })
    } else {//string
      convertFile(mode,ifile,l_filename,l_md5_filename);
    }

    file.path = path.join(dir, md5_filename);

        this.push(file);
        cb();
    }, function (cb) {
        if(option.mappingFile){
            try{
                md5_mapping = Object.assign(md5_mapping, jsonfile.readFileSync(option.mappingFile))
            }catch(err){
                fs.writeFileSync(option.mappingFile,"{}",'utf8');
            }
            jsonfile.writeFile(option.mappingFile, md5_mapping , {spaces: 2}, function(err) {
                return new gutil.PluginError('gulp-debug', 'output mapping file error')
            });
        }
        cb();
    });
};

function convertFile(mode,file,filename,md5FileName){//转换函数
  file && glob(file, function (err, files) {
    if (err) return console.log(err);
    files.forEach(function (ilist) {
      var result = '';
      if(mode == 'filename'){
        result = fs.readFileSync(ilist,'utf8').replace(new RegExp('/' + filename + '[^a-zA-Z_0-9].*?' ,"g"), function(sfile_name){
          return sfile_name.replace(filename,md5FileName);
        });
      }else{
        result = fs.readFileSync(ilist, 'utf8').replace(new RegExp('/' + filename + '.*[\'|\"]', "g"), function (sfile_name) {
          let y = sfile_name.substr(-1);
          return "/" + md5FileName + y;
        });
      }
      fs.writeFileSync(ilist, result, 'utf8');
    })
  })
}

function getLevelDir(dir, level) {
  var dirs = dir.split(pathsep);
  if (dirs && dirs.length >= level) {
    return dirs.slice(dirs.length - level)
  } else {
        return []
  }
}

function calcMd5(file, slice) {
  var md5 = crypto.createHash('md5');
  md5.update(file.contents, 'utf8');

  return slice > 0 ? md5.digest('hex').slice(0, slice) : md5.digest('hex');
}
