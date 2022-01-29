var path = require('path'),
  gutil = require('gulp-util'),
  through = require('through2'),
  crypto = require('crypto'),
  fs = require('fs'),
  glob = require('glob'),
  jsonfile = require('jsonfile'),
  pathsep = path.posix.sep;

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

    var d = calcMd5(file, size),
      filename = path.basename(file.path),
      relativepath = path.relative(file.base, file.path),
      sub_namepath = relativepath.replace(new RegExp(filename), "").split(pathsep).join('/'),
      dir;
    if (file.path[0] == '.') {
      dir = path.join(file.base, file.path);
    } else {
      dir = file.path;
    }
    dir = path.dirname(dir);


    //var md5_filename = filename.split('.').map(function(item, i, arr){
    // hide by licb 修改为版本戳
    // return i == arr.length-2 ? item + connector + d : item;

    // }).join('.');

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
              // console.log(sfile_name);
              // sfile_name = sfile_name.replace(sfile_name,l_md5_filename);
              // console.info(sfile_name);
              // var strIdx = sfile_name.indexOf(l_filename);
              // strIdx = strIdx + l_filename.length;
              // var sfile_name = sfile_name.replace(l_filename,l_md5_filename);
              // console.log(sfile_name);
              // console.log(l_md5_filename);
              sfile_name = "/" + l_md5_filename + "'";
              return sfile_name
            });

            // hide by licb 改为支持版本号
            // var result = fs.readFileSync(i_ilist,'utf8').replace(new RegExp(l_filename + '(.{13})?',"g"), md5_filename);

            fs.writeFileSync(i_ilist, result, 'utf8');
          })
        })
      })
    } else {
      ifile && glob(ifile, function (err, files) {
        if (err) return console.log(err);
        files.forEach(function (ilist) {
          // var result = fs.readFileSync(ilist,'utf8').replace(new RegExp('/' + l_filename + '[^a-zA-Z_0-9].*?' ,"g"), function(sfile_name){
          //     return sfile_name.replace(l_filename,l_md5_filename)
          // });
          // console.log("2:", sfile_name);
          // console.log("2:", l_md5_filename);
          sfile_name = "/" + l_md5_filename + "'";
          return sfile_name
        });
        // var result = fs.readFileSync(ilist,'utf8').replace(new RegExp(l_filename + '(.{13})?' ,"g"), md5_filename);
        fs.writeFileSync(ilist, result, 'utf8');
      })
    }

    file.path = path.join(dir, md5_filename);

    this.push(file);
    cb();
  }, function (cb) {
    if (option.mappingFile) {
      try {
        md5_mapping = Object.assign(md5_mapping, jsonfile.readFileSync(option.mappingFile))
      } catch (err) {
        fs.writeFileSync(option.mappingFile, "{}", 'utf8');
      }
      jsonfile.writeFile(option.mappingFile, md5_mapping, {
        spaces: 2
      }, function (err) {
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