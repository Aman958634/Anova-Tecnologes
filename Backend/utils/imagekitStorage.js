const ImageKit = require('@imagekit/nodejs');
const crypto = require('crypto');
const sharp = require('sharp');

const IMAGEKIT_PUBLIC_KEY = process.env.IMAGEKIT_PUBLIC_KEY || '';
const IMAGEKIT_PRIVATE_KEY = process.env.IMAGEKIT_PRIVATE_KEY || '';
const IMAGEKIT_URL_ENDPOINT = process.env.IMAGEKIT_URL_ENDPOINT || '';

const imagekit = new ImageKit({
  publicKey: IMAGEKIT_PUBLIC_KEY,
  privateKey: IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: IMAGEKIT_URL_ENDPOINT,
});

const ALLOWED_UPLOAD_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
const MAX_UPLOAD_FILE_SIZE_BYTES = 5 * 1024 * 1024;

function isImageKitConfigured() {
  return Boolean(IMAGEKIT_PUBLIC_KEY && IMAGEKIT_PRIVATE_KEY && IMAGEKIT_URL_ENDPOINT);
}

function generateFilename(originalname, prefix = 'file') {
  const rawExt = originalname.includes('.')
    ? originalname.slice(originalname.lastIndexOf('.') + 1)
    : 'bin';
  const safeExt = rawExt.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 10) || 'bin';
  const randomId = crypto.randomBytes(8).toString('hex');
  const timestamp = Date.now().toString(36);
  return `${prefix}-${timestamp}-${randomId}.${safeExt}`;
}

function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

async function optimizeImageBuffer(buffer, mimetype) {
  if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
    throw new Error('Cannot optimize an empty image buffer.');
  }

  if (mimetype === 'image/gif') {
    return {
      buffer,
      mimetype: 'image/gif',
      extension: 'gif',
      optimized: false,
    };
  }

  const pipeline = sharp(buffer, { failOn: 'none' }).rotate();
  const metadata = await pipeline.metadata();
  const width = metadata.width || null;

  let transformed = pipeline;
  if (width && width > 2200) {
    transformed = transformed.resize({ width: 2200, fit: 'inside', withoutEnlargement: true });
  }

  const optimizedBuffer = await transformed.webp({ quality: 82, effort: 4 }).toBuffer();
  return {
    buffer: optimizedBuffer,
    mimetype: 'image/webp',
    extension: 'webp',
    optimized: true,
  };
}

async function uploadToImageKit({ buffer, folder = '/anova/projects', fileName, tags = [] }) {
  if (!isImageKitConfigured()) {
    throw new Error('ImageKit is not configured. Set IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, and IMAGEKIT_URL_ENDPOINT.');
  }

  const normalizedFolder = folder.startsWith('/') ? folder : `/${folder}`;
  const uploadResult = await imagekit.upload({
    file: buffer,
    fileName,
    folder: normalizedFolder,
    useUniqueFileName: false,
    tags,
    responseFields: ['isPrivateFile', 'tags', 'customMetadata'],
  });

  return {
    url: uploadResult.url,
    fileId: uploadResult.fileId,
    filePath: uploadResult.filePath,
    thumbnailUrl: uploadResult.thumbnailUrl,
    name: uploadResult.name,
    size: uploadResult.size,
  };
}

async function deleteFromImageKit(fileId) {
  if (!fileId) return;
  if (!isImageKitConfigured()) return;
  try {
    await imagekit.deleteFile(fileId);
  } catch (error) {
    if (error && (error.code === 404 || error.statusCode === 404)) {
      return;
    }
    throw error;
  }
}

module.exports = {
  ALLOWED_UPLOAD_MIME_TYPES,
  MAX_UPLOAD_FILE_SIZE_BYTES,
  deleteFromImageKit,
  generateFilename,
  isImageKitConfigured,
  optimizeImageBuffer,
  sha256,
  uploadToImageKit,
};
