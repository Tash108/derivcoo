var express = require('express');
var path = require('path');
var formidable = require('formidable');
var fs = require('fs');
var csv = require('csv-parser');
var router = express.Router();
var matchCalculator = require('../public/javascripts/matchcalculator');
var helper = require('../public/javascripts/helper');

const isFileValid = (file) => {
  const type = file.type.split("/").pop();
  const validTypes = ["vnd.ms-excel"];
  if (validTypes.indexOf(type) === -1) {
    return false;
  }
  return true;
};

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('upload', { title: 'Tennis' });
});

router.post('/', function(req, res, next) {
  var form = new formidable.IncomingForm();
  const uploadFolder = path.join(__dirname, '..', 'public', 'files');
  form.maxFileSize = 50 * 1024 * 1024;
  form.uploadDir = uploadFolder;
  console.log(form);
  form.parse(req, function (err, fields, files) {
    console.log(fields);
    console.log(files);
    if (err) {
      console.log("Error parsing the files");
      return res.status(400).json({
        status: "Fail",
        message: "There was an error parsing the files",
        error: err,
      });
    }

    const file = files.fileUploaded;

    // checks if the file is valid
    const isValid = isFileValid(file);

    // creates a valid name by removing spaces
    const fileName = encodeURIComponent(file.name.replace(/\s/g, "-"));

    if (!isValid) {
      // throes error if file isn't valid
      return res.status(400).json({
        status: "Fail",
        message: "The file type is not a valid type",
      });
    }
    try {
      // renames the file in the directory
      fs.renameSync(file.path, path.join(uploadFolder, fileName));
      const results = [];
      //var filePath = __dirname+'\\public\\files\\'+fileName;
      var filePath = path.join(uploadFolder, fileName);
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
          console.log(results);
          var maleGroup = results.filter(result => result.Gender.localeCompare('m', undefined, { sensitivity: 'accent' }) === 0);
          maleGroup = helper.deDuplicate(maleGroup);
          var femaleGroup = results.filter(result => result.Gender.localeCompare('f', undefined, { sensitivity: 'accent' }) === 0);
          femaleGroup = helper.deDuplicate(femaleGroup);
          
          var maleResults = [];
          var femaleResults = [];

          console.log(maleGroup);
          console.log(femaleGroup);
          res.render('upload', { title: 'Tennis', output: results });
        });
    } catch (error) {
      console.log(error);
    }
  });
});

module.exports = router;
