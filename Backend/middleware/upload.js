const fs = require('fs');
const path = require('path');
const multer = require('multer');

const uploadRoot = path.join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads');
const projectUploadDir = path.join(uploadRoot, 'projects');
const teamUploadDir = path.join(uploadRoot, 'team');

for (const dir of [uploadRoot, projectUploadDir, teamUploadDir]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'image' && req.baseUrl && req.baseUrl.includes('/projects')) {
      cb(null, projectUploadDir);
      return;
    }
    if (file.fieldname === 'image' && req.baseUrl && req.baseUrl.includes('/team')) {
      cb(null, teamUploadDir);
      return;
    }
    cb(null, uploadRoot);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname).toLowerCase()}`);
  }
});

function fileFilter(req, file, cb) {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
  if (!allowedMimeTypes.includes(file.mimetype)) {
    cb(new Error('Only JPG, PNG, WEBP, GIF, or SVG images are allowed.'));
    return;
  }
  cb(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

module.exports = upload;
