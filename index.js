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



   //Change to version number mode
    var idx = filename.indexOf("?");
    if (idx >= 0) {
      filename = filename.split("?")[0];
    }
    var md5_filename = filename + '?v=' + d;


    var levelDir = "";
    if (option.dirLevel) {
      levelDir = getLevelDir(dir, option.dirLevel).join(pathsep);
    }

    md5_mapping[filename] = md5_filename; //add mappinig to json;

    var l_filename = path.posix.join(levelDir, filename);
    var l_md5_filename = path.posix.join(levelDir, md5_filename);


    if (Object.prototype.toString.call(ifile) == "[object Array]") {

      ifile.forEach(function (i_ifile) {

        i_ifile && glob(i_ifile, function (err, i_files) {

          if (err) return console.log(err);


          i_files.forEach(function (i_ilist) {
            var result = fs.readFileSync(i_ilist, 'utf8').replace(new RegExp('/' + l_filename + '.*[\'|\"]', "g"), function (sfile_name) {
              return "/" + l_md5_filename + "'";
            });


            fs.writeFileSync(i_ilist, result, 'utf8');
          })
        })
      })
    } else {
      ifile && glob(ifile, function (err, files) {
        if (err) return console.log(err);
        files.forEach(function (ilist) {
          return "/" + l_md5_filename + "'";
        });
        fs.writeFileSync(ilist, result, 'utf8');
      })
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

function getLevelDir(dir, level) {
  var dirs = dir.split(pathsep);
  if (dirs && dirs.length >= level) {
    return dirs.slice(dirs.length - level)
  } else {
    return ""
  }
}

function calcMd5(file, slice) {
  var md5 = crypto.createHash('md5');
  md5.update(file.contents, 'utf8');

  return slice > 0 ? md5.digest('hex').slice(0, slice) : md5.digest('hex');
}
