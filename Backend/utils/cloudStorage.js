const cloudinary = require('cloudinary').v2;
const crypto = require('crypto');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function generateFilename(originalname, prefix = 'file') {
  const rawExt = originalname.includes('.')
    ? originalname.slice(originalname.lastIndexOf('.') + 1)
    : 'bin';
  const safeExt = rawExt.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 10) || 'bin';
  const randomId = crypto.randomBytes(8).toString('hex');
  const timestamp = Date.now().toString(36);
  return `${prefix}-${timestamp}-${randomId}.${safeExt}`;
}

function uploadToCloudinary(buffer, folder, filename) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `anova/${folder}`,
        public_id: filename.replace(/\.[^.]+$/, ''),
        resource_type: 'auto',
        quality: 'auto',
        fetch_format: 'auto',
      },
      (error, result) => {
        if (error) return reject(error);
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
          bytes: result.bytes,
        });
      }
    );
    stream.end(buffer);
  });
}

function deleteFromCloudinary(publicId) {
  if (!publicId || typeof publicId !== 'string') return Promise.resolve(null);
  return cloudinary.uploader.destroy(publicId).catch((error) => {
    console.error('Cloudinary delete error:', error);
    return null;
  });
}

function extractPublicIdFromUrl(url) {
  if (!url || typeof url !== 'string') return null;
  if (!url.includes('cloudinary.com')) return null;
  try {
    const urlObj = new URL(url);
    const parts = urlObj.pathname.split('/').filter(Boolean);
    const uploadIndex = parts.indexOf('upload');
    if (uploadIndex === -1 || parts.length <= uploadIndex + 2) return null;
    return parts.slice(uploadIndex + 2).join('/').replace(/\.[^.]+$/, '');
  } catch {
    return null;
  }
}

function isCloudinaryUrl(url) {
  if (!url || typeof url !== 'string') return false;
  return url.includes('cloudinary.com');
}

module.exports = {
  cloudinary,
  generateFilename,
  uploadToCloudinary,
  deleteFromCloudinary,
  extractPublicIdFromUrl,
  isCloudinaryUrl,
};
