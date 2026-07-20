const asyncHandler = require('../utils/asyncHandler');
const { pool } = require('../config/db');
const { findById, deleteById } = require('../models/baseModel');
const { getCache, setCache, invalidateCache } = require('../utils/simpleCache');
const {
  uploadToCloudinary,
  deleteFromCloudinary,
  extractPublicIdFromUrl,
  isCloudinaryUrl,
  generateFilename,
} = require('../utils/cloudStorage');

const parseTags = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try {
    return JSON.parse(value);
  } catch {
    return String(value)
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
  }
};

const buildAbsoluteImageUrl = (req, imagePath) => {
  if (!imagePath) return null;
  if (/^https?:\/\//i.test(imagePath)) return imagePath;
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  return `${baseUrl}${imagePath}`;
};

const mapProjectRow = (row, req) => ({
  ...row,
  tags: parseTags(row.tags),
  image: row.image_url || null,
  imageUrl: buildAbsoluteImageUrl(req, row.image_url),
  demoUrl: row.live_demo_url || null,
});

const isPlaceholderImage = (url) => {
  if (!url) return false;
  const s = String(url).trim();
  if (s.includes('images.unsplash.com')) return true;
  return false;
};

const removeCloudImage = async (imageUrl) => {
  if (!imageUrl || !isCloudinaryUrl(imageUrl)) return;
  const publicId = extractPublicIdFromUrl(imageUrl);
  if (publicId) {
    await deleteFromCloudinary(publicId);
  }
};

const setShortCacheHeaders = (res) => {
  res.set('Cache-Control', 'public, max-age=120, stale-while-revalidate=30');
};

const listProjects = asyncHandler(async (req, res) => {
  const search = req.query.search ? `%${req.query.search}%` : '%';
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 12, 1), 100);
  const offset = (page - 1) * limit;
  const cacheKey = `projects:${search}:${page}:${limit}`;
  const cached = getCache(cacheKey);
  if (cached) {
    setShortCacheHeaders(res);
    return res.json(cached);
  }

  const [rows] = await pool.query(
    'SELECT * FROM projects WHERE title LIKE ? OR description LIKE ? ORDER BY featured DESC, id DESC LIMIT ? OFFSET ?',
    [search, search, limit, offset]
  );
  const formatted = rows.map((row) => mapProjectRow(row, req));
  const [countRows] = await pool.query(
    'SELECT COUNT(*) AS total FROM projects WHERE title LIKE ? OR description LIKE ?',
    [search, search]
  );
  const result = {
    success: true,
    data: formatted,
    projects: formatted,
    meta: { page, limit, total: countRows[0].total },
  };
  setCache(cacheKey, result, 120000);
  setShortCacheHeaders(res);
  res.json(result);
});

const getProjectById = asyncHandler(async (req, res) => {
  const project = await findById('projects', req.params.id);
  if (!project) {
    return res.status(404).json({ success: false, message: 'Project not found.' });
  }
  res.json({ success: true, data: mapProjectRow(project, req), project: mapProjectRow(project, req) });
});

const createProject = asyncHandler(async (req, res) => {
  let imageUrl = null;

  if (req.file) {
    try {
      const filename = generateFilename(req.file.originalname, 'project');
      const result = await uploadToCloudinary(req.file.buffer, 'projects', filename);
      imageUrl = result.url;
    } catch (error) {
      console.error('Cloudinary project image upload failed:', error);
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

  const tags = JSON.stringify(parseTags(req.body.tags));
  const [result] = await pool.query(
    'INSERT INTO projects (title, description, image_url, live_demo_url, tags, featured) VALUES (?, ?, ?, ?, ?, ?)',
    [
      req.body.title,
      req.body.description,
      imageUrl,
      req.body.live_demo_url || null,
      tags,
      req.body.featured === '1' || req.body.featured === 'true' ? 1 : 0,
    ]
  );
  invalidateCache('projects:');
  const created = await findById('projects', result.insertId);
  const mapped = mapProjectRow(created, req);
  res.status(201).json({ success: true, data: mapped, project: mapped });
});

const updateProject = asyncHandler(async (req, res) => {
  const existing = await findById('projects', req.params.id);
  if (!existing) return res.status(404).json({ success: false, message: 'Project not found.' });

  const shouldRemoveImage = req.body.remove_image === 'true' || req.body.remove_image === '1';
  let imageUrl = existing.image_url;

  if (shouldRemoveImage) {
    imageUrl = null;
    await removeCloudImage(existing.image_url);
  }

  if (req.file) {
    await removeCloudImage(existing.image_url);
    try {
      const filename = generateFilename(req.file.originalname, 'project');
      const result = await uploadToCloudinary(req.file.buffer, 'projects', filename);
      imageUrl = result.url;
    } catch (error) {
      console.error('Cloudinary project image upload failed:', error);
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

  const tags = JSON.stringify(parseTags(req.body.tags || existing.tags));
  await pool.query(
    'UPDATE projects SET title = ?, description = ?, image_url = ?, live_demo_url = ?, tags = ?, featured = ? WHERE id = ?',
    [
      req.body.title,
      req.body.description,
      imageUrl,
      req.body.live_demo_url || null,
      tags,
      req.body.featured === '1' || req.body.featured === 'true' ? 1 : 0,
      req.params.id,
    ]
  );
  invalidateCache('projects:');
  const updated = await findById('projects', req.params.id);
  const mapped = mapProjectRow(updated, req);
  res.json({ success: true, data: mapped, project: mapped });
});

const deleteProject = asyncHandler(async (req, res) => {
  const project = await findById('projects', req.params.id);
  if (!project) {
    return res.status(404).json({ success: false, message: 'Project not found.' });
  }

  await removeCloudImage(project.image_url);

  const deleted = await deleteById('projects', req.params.id);
  if (!deleted) return res.status(404).json({ success: false, message: 'Project not found.' });
  console.log('Deleted project and cleaned up cloud image for:', req.params.id);
  invalidateCache('projects:');
  res.json({ success: true, message: 'Project deleted successfully.' });
});

module.exports = { listProjects, getProjectById, createProject, updateProject, deleteProject };
