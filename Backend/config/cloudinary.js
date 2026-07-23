const cloudinary = require('cloudinary').v2;

const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || '';
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || '';
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || '';

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

function isCloudinaryConfigured() {
  return Boolean(CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET);
}

function ensureCloudinaryConfigured() {
  if (!isCloudinaryConfigured()) {
    const error = new Error('Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET.');
    error.statusCode = 500;
    throw error;
  }
}

async function validateCloudinaryConnection() {
  ensureCloudinaryConfigured();
  try {
    await cloudinary.api.ping();
  } catch (error) {
    const wrapped = new Error(
      `Cloudinary credentials are invalid or unreachable: ${error?.message || 'Unknown error'}`
    );
    wrapped.statusCode = 500;
    throw wrapped;
  }
}

module.exports = {
  cloudinary,
  ensureCloudinaryConfigured,
  isCloudinaryConfigured,
  validateCloudinaryConnection,
};
