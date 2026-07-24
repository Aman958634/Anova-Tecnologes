const asyncHandler = require('../utils/asyncHandler');
const { pool } = require('../config/db');
const { findById, deleteById } = require('../models/baseModel');
const { getCache, setCache, invalidateCache } = require('../utils/simpleCache');
const { uploadToCloudinary, deleteFromCloudinary, extractPublicIdFromUrl, isCloudinaryUrl, generateFilename } = require('../utils/cloudStorage');

const setShortCacheHeaders = (res) => {
  res.set('Cache-Control', 'public, max-age=120, stale-while-revalidate=30');
};

const buildAbsoluteImageUrl = (req, imagePath) => {
  if (!imagePath) return null;
  if (/^https?:\/\//i.test(imagePath)) return imagePath;
  return `${req.protocol}://${req.get('host')}${imagePath}`;
};

const isPlaceholderImage = (url) => {
  if (!url) return false;
  const value = String(url).trim();
  return value.includes('images.unsplash.com');
};

const removeCloudImage = async (imageUrl) => {
  if (!imageUrl || !isCloudinaryUrl(imageUrl)) return;
  const publicId = extractPublicIdFromUrl(imageUrl);
  if (publicId) {
    await deleteFromCloudinary(publicId);
  }
};

const respondWithError = (res, error, context) => {
  console.error(`Cloudinary team error (${context}):`, error);
  console.error(error.stack);
  return res.status(500).json({
    success: false,
    message: error.message,
    stack: error.stack,
  });
};

const mapTeamRow = (row, req) => ({
  ...row,
  image: row.image_url || null,
  imageUrl: buildAbsoluteImageUrl(req, row.image_url),
});

const listTeamMembers = asyncHandler(async (req, res) => {
  const search = req.query.search ? `%${req.query.search}%` : '%';
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 12, 1), 100);
  const offset = (page - 1) * limit;
  const cacheKey = `team:${search}:${page}:${limit}`;
  const cached = getCache(cacheKey);
  if (cached) {
    setShortCacheHeaders(res);
    return res.json(cached);
  }

  const [rows] = await pool.query(
    'SELECT * FROM team_members WHERE name LIKE ? OR designation LIKE ? ORDER BY featured DESC, id DESC LIMIT ? OFFSET ?',
    [search, search, limit, offset]
  );

  const formatted = rows.map((row) => mapTeamRow(row, req));
  const [countRows] = await pool.query('SELECT COUNT(*) AS total FROM team_members WHERE name LIKE ? OR designation LIKE ?', [search, search]);
  const result = { success: true, data: formatted, team: formatted, meta: { page, limit, total: countRows[0].total } };
  setCache(cacheKey, result, 120000);
  setShortCacheHeaders(res);
  res.json(result);
});

const createTeamMember = asyncHandler(async (req, res) => {
  let imageUrl = null;

  if (req.file) {
    try {
      const filename = generateFilename(req.file.originalname, 'team');
      const result = await uploadToCloudinary(req.file.buffer, 'team', filename);
      imageUrl = result.url;
    } catch (error) {
      return respondWithError(res, error, 'create');
    }
  } else if (req.body.image_url) {
    const value = String(req.body.image_url).trim();
    if (!isPlaceholderImage(value)) {
      imageUrl = value;
    }
  }

  const [result] = await pool.query(
    'INSERT INTO team_members (name, designation, image_url, featured) VALUES (?, ?, ?, ?)',
    [req.body.name, req.body.designation, imageUrl, req.body.featured === '1' || req.body.featured === 'true' ? 1 : 0]
  );
  invalidateCache('team:');
  const created = await findById('team_members', result.insertId);
  res.status(201).json({ success: true, data: mapTeamRow(created, req), team: mapTeamRow(created, req) });
});

const updateTeamMember = asyncHandler(async (req, res) => {
  const existing = await findById('team_members', req.params.id);
  if (!existing) return res.status(404).json({ message: 'Team member not found.' });

  const shouldRemoveImage = req.body.remove_image === 'true' || req.body.remove_image === '1';
  let imageUrl = existing.image_url;

  if (shouldRemoveImage) {
    imageUrl = null;
    await removeCloudImage(existing.image_url);
  }

  if (req.file) {
    await removeCloudImage(existing.image_url);
    try {
      const filename = generateFilename(req.file.originalname, 'team');
      const result = await uploadToCloudinary(req.file.buffer, 'team', filename);
      imageUrl = result.url;
    } catch (error) {
      return respondWithError(res, error, 'update');
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
    'UPDATE team_members SET name = ?, designation = ?, image_url = ?, featured = ? WHERE id = ?',
    [req.body.name, req.body.designation, imageUrl, req.body.featured === '1' || req.body.featured === 'true' ? 1 : 0, req.params.id]
  );
  invalidateCache('team:');
  const updated = await findById('team_members', req.params.id);
  res.json({ success: true, data: mapTeamRow(updated, req), team: mapTeamRow(updated, req) });
});

const deleteTeamMember = asyncHandler(async (req, res) => {
  const existing = await findById('team_members', req.params.id);
  if (!existing) return res.status(404).json({ message: 'Team member not found.' });

  await removeCloudImage(existing.image_url);

  const deleted = await deleteById('team_members', req.params.id);
  if (!deleted) return res.status(404).json({ message: 'Team member not found.' });
  invalidateCache('team:');
  res.json({ success: true, message: 'Team member deleted successfully.' });
});

module.exports = { listTeamMembers, createTeamMember, updateTeamMember, deleteTeamMember };
