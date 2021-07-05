const multer = require('multer');

const fileUpload = multer({
  dest: 'tmp/scv/',
});

module.exports = fileUpload;
