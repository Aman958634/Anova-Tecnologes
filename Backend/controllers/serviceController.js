const asyncHandler = require('../utils/asyncHandler');
const { pool } = require('../config/db');
const { findById, deleteById } = require('../models/baseModel');
const { getCache, setCache, invalidateCache } = require('../utils/simpleCache');
const { uploadToCloudinary, deleteFromCloudinary, extractPublicIdFromUrl, isCloudinaryUrl, generateFilename } = require('../utils/cloudStorage');

const shouldLogServiceImageDebug = process.env.SERVICE_IMAGE_DEBUG === 'true' || process.env.NODE_ENV !== 'production';

const logServiceImageDebug = (...args) => {
  if (!shouldLogServiceImageDebug) return;
  console.log('[services:image-debug]', ...args);
};

const parseKeyFeatures = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.filter(Boolean);
  } catch {
    // keep fallback
  }
  return String(value)
    .split(',')
    .map((feature) => feature.trim())
    .filter(Boolean);
};

const serializeKeyFeatures = (value) => JSON.stringify(parseKeyFeatures(value));

const normalizeService = (row) => ({
  ...row,
  image_url: row?.image_url || row?.imageUrl || row?.image || row?.thumbnail || null,
  key_features: parseKeyFeatures(row.key_features),
});

const setShortCacheHeaders = (res) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
};

const removeCloudImage = async (imageUrl) => {
  if (!imageUrl || !isCloudinaryUrl(imageUrl)) return;
  const publicId = extractPublicIdFromUrl(imageUrl);
  if (publicId) {
    await deleteFromCloudinary(publicId);
  }
};

const respondWithError = (res, error, context) => {
  console.error(`Cloudinary service error (${context}):`, error);
  console.error(error.stack);
  return res.status(500).json({
    success: false,
    message: error.message,
    stack: error.stack,
  });
};

const listServices = asyncHandler(async (req, res) => {
  const search = req.query.search ? `%${req.query.search}%` : '%';
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 12, 1), 100);
  const offset = (page - 1) * limit;
  const cacheKey = `services:${search}:${page}:${limit}`;
  const cached = getCache(cacheKey);
  if (cached) {
    setShortCacheHeaders(res);
    return res.json(cached);
  }

  const [rows] = await pool.query(
    'SELECT * FROM services WHERE title LIKE ? OR description LIKE ? ORDER BY featured DESC, id DESC LIMIT ? OFFSET ?',
    [search, search, limit, offset]
  );
  logServiceImageDebug('listServices: fetched rows', rows.map((row) => ({ id: row.id, title: row.title, image_url: row.image_url })));
  const [countRows] = await pool.query('SELECT COUNT(*) AS total FROM services WHERE title LIKE ? OR description LIKE ?', [search, search]);
  const result = { data: rows.map(normalizeService), meta: { page, limit, total: countRows[0].total } };
  logServiceImageDebug('GET /services response', JSON.stringify(result.data, null, 2));
  setCache(cacheKey, result, 120000);
  setShortCacheHeaders(res);
  res.json(result);
});

const createService = asyncHandler(async (req, res) => {
  const { title, description, icon, featured, key_features } = req.body;
  let imageUrl = null;

  logServiceImageDebug('createService: req.body', req.body);
  logServiceImageDebug('createService: req.file', req.file ? { originalname: req.file.originalname, mimetype: req.file.mimetype, size: req.file.size } : null);

  logServiceImageDebug('createService: incoming body', {
    title,
    image_url: req.body.image_url,
    imageUrl: req.body.imageUrl,
    hasFile: Boolean(req.file),
  });

  if (req.file) {
    try {
      const filename = generateFilename(req.file.originalname, 'service');
      const result = await uploadToCloudinary(req.file.buffer, 'services', filename);
      imageUrl = result.url;
    } catch (error) {
      return respondWithError(res, error, 'create');
    }
  } else {
    const rawImageUrl = req.body.image_url ?? req.body.imageUrl ?? req.body.image;
    const value = rawImageUrl ? String(rawImageUrl).trim() : '';
    if (value) {
      imageUrl = value;
    }
  }

  logServiceImageDebug('createService: resolved imageUrl', { title, imageUrl });

  const createValues = [
    title,
    description,
    icon || null,
    serializeKeyFeatures(key_features),
    imageUrl,
    featured === '1' || featured === 'true' ? 1 : 0,
  ];
  logServiceImageDebug('createService: SQL values', createValues);

  const [result] = await pool.query(
    'INSERT INTO services (title, description, icon, key_features, image_url, featured) VALUES (?, ?, ?, ?, ?, ?)',
    createValues
  );
  logServiceImageDebug('DB RESULT (create)', result);
  invalidateCache('services:');
  res.status(201).json(normalizeService(await findById('services', result.insertId)));
});

const updateService = asyncHandler(async (req, res) => {
  const existing = await findById('services', req.params.id);
  if (!existing) return res.status(404).json({ message: 'Service not found.' });

  const { title, description, icon, featured, key_features } = req.body;
  let imageUrl = existing.image_url;

  logServiceImageDebug('updateService: req.body', req.body);
  logServiceImageDebug('updateService: req.file', req.file ? { originalname: req.file.originalname, mimetype: req.file.mimetype, size: req.file.size } : null);

  logServiceImageDebug('updateService: incoming body', {
    id: req.params.id,
    title,
    existingImageUrl: existing.image_url,
    image_url: req.body.image_url,
    imageUrl: req.body.imageUrl,
    image: req.body.image,
    hasFile: Boolean(req.file),
  });

  if (req.file) {
    await removeCloudImage(existing.image_url);
    try {
      const filename = generateFilename(req.file.originalname, 'service');
      const result = await uploadToCloudinary(req.file.buffer, 'services', filename);
      imageUrl = result.url;
    } catch (error) {
      return respondWithError(res, error, 'update');
    }
  } else {
    const rawImageUrl = req.body.image_url ?? req.body.imageUrl ?? req.body.image;
    const value = rawImageUrl ? String(rawImageUrl).trim() : '';
    if (value) {
      if (existing.image_url && existing.image_url !== value && isCloudinaryUrl(existing.image_url)) {
        await removeCloudImage(existing.image_url);
      }
      imageUrl = value;
    }
  }

  logServiceImageDebug('updateService: resolved imageUrl before SQL', {
    id: req.params.id,
    imageUrl,
  });

  const updateValues = [
    title,
    description,
    icon || null,
    serializeKeyFeatures(key_features || existing.key_features),
    imageUrl,
    featured === '1' || featured === 'true' ? 1 : 0,
    req.params.id,
  ];
  logServiceImageDebug('updateService: SQL values', updateValues);

  const [result] = await pool.query(
    'UPDATE services SET title = ?, description = ?, icon = ?, key_features = ?, image_url = ?, featured = ? WHERE id = ?',
    updateValues
  );
  logServiceImageDebug('DB RESULT (update)', result);

  const updated = await findById('services', req.params.id);
  logServiceImageDebug('updateService: updatedService', updated);
  logServiceImageDebug('updateService: DB row after SQL', {
    id: updated?.id,
    title: updated?.title,
    image_url: updated?.image_url,
  });
  invalidateCache('services:');
  res.json(normalizeService(updated));
});

const deleteService = asyncHandler(async (req, res) => {
  const existing = await findById('services', req.params.id);
  if (existing) {
    await removeCloudImage(existing.image_url);
  }
  const deleted = await deleteById('services', req.params.id);
  if (!deleted) return res.status(404).json({ message: 'Service not found.' });
  invalidateCache('services:');
  res.json({ message: 'Service deleted successfully.' });
});

module.exports = { listServices, createService, updateService, deleteService };
