const multer = require('multer');
const {
  ALLOWED_UPLOAD_MIME_TYPES,
  MAX_UPLOAD_FILE_SIZE_BYTES,
} = require('../utils/cloudStorage');

const allowedMimeTypes = ALLOWED_UPLOAD_MIME_TYPES;
const maxFileSize = MAX_UPLOAD_FILE_SIZE_BYTES;

const storage = multer.memoryStorage();

function fileFilter(req, file, cb) {
  if (!allowedMimeTypes.includes(file.mimetype)) {
    const error = new Error('Invalid image type. Allowed: JPG, PNG, WEBP, GIF, AVIF.');
    error.statusCode = 400;
    cb(error, false);
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
