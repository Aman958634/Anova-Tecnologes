const asyncHandler = require('../utils/asyncHandler');
const { pool } = require('../config/db');
const { findById, deleteById } = require('../models/baseModel');
const { getCache, setCache, invalidateCache } = require('../utils/simpleCache');
const { uploadToCloudinary, deleteFromCloudinary, extractPublicIdFromUrl, isCloudinaryUrl, generateFilename } = require('../utils/cloudStorage');

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
  key_features: parseKeyFeatures(row.key_features),
});

const setShortCacheHeaders = (res) => {
  res.set('Cache-Control', 'public, max-age=120, stale-while-revalidate=30');
};

const isPlaceholderImage = (url) => {
  if (!url) return false;
  return typeof url === 'string' && url.includes('images.unsplash.com');
};

const removeCloudImage = async (imageUrl) => {
  if (!imageUrl || !isCloudinaryUrl(imageUrl)) return;
  const publicId = extractPublicIdFromUrl(imageUrl);
  if (publicId) {
    await deleteFromCloudinary(publicId);
  }
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
  const [countRows] = await pool.query('SELECT COUNT(*) AS total FROM services WHERE title LIKE ? OR description LIKE ?', [search, search]);
  const result = { data: rows.map(normalizeService), meta: { page, limit, total: countRows[0].total } };
  setCache(cacheKey, result, 120000);
  setShortCacheHeaders(res);
  res.json(result);
});

const createService = asyncHandler(async (req, res) => {
  const { title, description, icon, featured, key_features } = req.body;
  let imageUrl = null;

  if (req.file) {
    try {
      const filename = generateFilename(req.file.originalname, 'service');
      const result = await uploadToCloudinary(req.file.buffer, 'services', filename);
      imageUrl = result.url;
    } catch (error) {
      console.error('Cloudinary service image upload failed:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to upload image. Please try again.',
      });
    }
  } else if (req.body.image_url) {
    const value = String(req.body.image_url).trim();
    if (!isPlaceholderImage(value)) {
      imageUrl = value;
    }
  }

  const [result] = await pool.query(
    'INSERT INTO services (title, description, icon, key_features, image_url, featured) VALUES (?, ?, ?, ?, ?, ?)',
    [title, description, icon || null, serializeKeyFeatures(key_features), imageUrl, featured === '1' || featured === 'true' ? 1 : 0]
  );
  invalidateCache('services:');
  res.status(201).json(normalizeService(await findById('services', result.insertId)));
});

const updateService = asyncHandler(async (req, res) => {
  const existing = await findById('services', req.params.id);
  if (!existing) return res.status(404).json({ message: 'Service not found.' });

  const { title, description, icon, featured, key_features } = req.body;
  let imageUrl = existing.image_url;

  if (req.file) {
    await removeCloudImage(existing.image_url);
    try {
      const filename = generateFilename(req.file.originalname, 'service');
      const result = await uploadToCloudinary(req.file.buffer, 'services', filename);
      imageUrl = result.url;
    } catch (error) {
      console.error('Cloudinary service image upload failed:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to upload image. Please try again.',
      });
    }
  } else if (req.body.image_url) {
    const value = String(req.body.image_url).trim();
    if (!isPlaceholderImage(value)) {
      if (existing.image_url && existing.image_url !== value && isCloudinaryUrl(existing.image_url)) {
        await removeCloudImage(existing.image_url);
      }
      imageUrl = value;
    }
  }

  await pool.query(
    'UPDATE services SET title = ?, description = ?, icon = ?, key_features = ?, image_url = ?, featured = ? WHERE id = ?',
    [
      title,
      description,
      icon || null,
      serializeKeyFeatures(key_features || existing.key_features),
      imageUrl,
      featured === '1' || featured === 'true' ? 1 : 0,
      req.params.id,
    ]
  );
  invalidateCache('services:');
  res.json(normalizeService(await findById('services', req.params.id)));
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
