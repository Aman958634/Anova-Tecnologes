const multer = require('multer');
const crypto = require('crypto');

const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
const maxFileSize = 5 * 1024 * 1024;

const storage = multer.memoryStorage();

function fileFilter(req, file, cb) {
  if (!allowedMimeTypes.includes(file.mimetype)) {
    cb(new Error('Only JPG, PNG, WEBP, GIF, or SVG images are allowed.'), false);
    return;
  }
  cb(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: maxFileSize,
    files: 1,
  },
});

upload.allowedMimeTypes = allowedMimeTypes;
upload.maxFileSize = maxFileSize;

module.exports = upload;
