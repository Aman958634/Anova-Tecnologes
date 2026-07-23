const asyncHandler = require('../utils/asyncHandler');
const { pool } = require('../config/db');
const { findById, deleteById } = require('../models/baseModel');
const { getCache, setCache, invalidateCache } = require('../utils/simpleCache');
const {
  uploadToImageKit,
  deleteFromImageKit,
  generateFilename,
  isImageKitConfigured,
  optimizeImageBuffer,
  sha256,
} = require('../utils/imagekitStorage');

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
  imageFileId: row.image_file_id || null,
  imageFilePath: row.image_file_path || null,
  demoUrl: row.live_demo_url || null,
});

const isPlaceholderImage = (url) => {
  if (!url) return false;
  const s = String(url).trim();
  if (s.includes('images.unsplash.com')) return true;
  return false;
};

const ensureImageKitReady = () => {
  if (!isImageKitConfigured()) {
    const error = new Error('Image uploads are not configured. Missing ImageKit credentials on the server.');
    error.statusCode = 500;
    throw error;
  }
};

const sanitizeExternalImageUrl = (value) => {
  if (!value) return null;
  const raw = String(value).trim();
  if (!raw || isPlaceholderImage(raw)) return null;
  if (!/^https?:\/\//i.test(raw)) return null;
  return raw;
};

const mapUploadedAsset = ({ url, fileId, filePath, hash }) => ({
  imageUrl: url,
  imageFileId: fileId,
  imageFilePath: filePath,
  imageHash: hash,
});

const mapExternalAsset = (url) => ({
  imageUrl: url,
  imageFileId: null,
  imageFilePath: null,
  imageHash: null,
});

const mapNoAsset = () => ({
  imageUrl: null,
  imageFileId: null,
  imageFilePath: null,
  imageHash: null,
});

const toProjectAsset = (row) => ({
  imageUrl: row?.image_url || null,
  imageFileId: row?.image_file_id || null,
  imageFilePath: row?.image_file_path || null,
  imageHash: row?.image_hash || null,
});

const hasAssetChanged = (current, next) => (
  current.imageUrl !== next.imageUrl
  || current.imageFileId !== next.imageFileId
  || current.imageFilePath !== next.imageFilePath
  || current.imageHash !== next.imageHash
);

const findProjectByImageHash = async (imageHash, excludeId = null) => {
  if (!imageHash) return null;
  const values = [imageHash];
  let query = `
    SELECT id, image_url, image_file_id, image_file_path, image_hash
    FROM projects
    WHERE image_hash = ? AND image_file_id IS NOT NULL
  `;
  if (excludeId) {
    query += ' AND id <> ?';
    values.push(excludeId);
  }
  query += ' ORDER BY id DESC LIMIT 1';
  const [rows] = await pool.query(query, values);
  return rows[0] || null;
};

const deleteImageIfUnreferenced = async (imageFileId) => {
  if (!imageFileId) return;
  const [rows] = await pool.query('SELECT COUNT(*) AS total FROM projects WHERE image_file_id = ?', [imageFileId]);
  if (Number(rows[0]?.total || 0) === 0) {
    await deleteFromImageKit(imageFileId);
  }
};

const buildAssetFromFile = async (file, { folder, excludeId } = {}) => {
  ensureImageKitReady();
  const optimized = await optimizeImageBuffer(file.buffer, file.mimetype);
  const imageHash = sha256(optimized.buffer);
  const duplicate = await findProjectByImageHash(imageHash, excludeId || null);

  if (duplicate) {
    return {
      ...mapUploadedAsset({
        url: duplicate.image_url,
        fileId: duplicate.image_file_id,
        filePath: duplicate.image_file_path,
        hash: duplicate.image_hash,
      }),
      reused: true,
    };
  }

  const extension = optimized.extension || 'webp';
  const baseFilename = generateFilename(file.originalname, 'project').replace(/\.[^.]+$/, '');
  const result = await uploadToImageKit({
    buffer: optimized.buffer,
    folder: folder || '/anova/projects',
    fileName: `${baseFilename}.${extension}`,
    tags: ['anova', 'projects'],
  });

  return {
    ...mapUploadedAsset({
      url: result.url,
      fileId: result.fileId,
      filePath: result.filePath,
      hash: imageHash,
    }),
    reused: false,
  };
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
  const fallbackImageUrl = sanitizeExternalImageUrl(req.body.image_url);
  let asset = fallbackImageUrl ? mapExternalAsset(fallbackImageUrl) : mapNoAsset();

  if (req.file) {
    try {
      asset = await buildAssetFromFile(req.file, { folder: '/anova/projects' });
    } catch (error) {
      console.error('ImageKit project image upload failed:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to upload image. Please try again.',
      });
    }
  }

  const tags = JSON.stringify(parseTags(req.body.tags));
  const [result] = await pool.query(
    `
      INSERT INTO projects
      (title, description, image_url, image_file_id, image_file_path, image_hash, live_demo_url, tags, featured)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      req.body.title,
      req.body.description,
      asset.imageUrl,
      asset.imageFileId,
      asset.imageFilePath,
      asset.imageHash,
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
  const existingAsset = toProjectAsset(existing);
  let nextAsset = existingAsset;
  const externalImageUrl = sanitizeExternalImageUrl(req.body.image_url);

  if (req.file) {
    try {
      const uploadedAsset = await buildAssetFromFile(req.file, {
        folder: '/anova/projects',
        excludeId: req.params.id,
      });
      if (uploadedAsset.imageHash === existingAsset.imageHash && existingAsset.imageFileId) {
        nextAsset = existingAsset;
      } else {
        nextAsset = {
          imageUrl: uploadedAsset.imageUrl,
          imageFileId: uploadedAsset.imageFileId,
          imageFilePath: uploadedAsset.imageFilePath,
          imageHash: uploadedAsset.imageHash,
        };
      }
    } catch (error) {
      console.error('ImageKit project image upload failed:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to upload image. Please try again.',
      });
    }
  } else if (shouldRemoveImage) {
    nextAsset = mapNoAsset();
  } else if (externalImageUrl && externalImageUrl !== existingAsset.imageUrl) {
    nextAsset = mapExternalAsset(externalImageUrl);
  }

  const tags = JSON.stringify(parseTags(req.body.tags || existing.tags));
  await pool.query(
    `
      UPDATE projects
      SET title = ?, description = ?, image_url = ?, image_file_id = ?, image_file_path = ?, image_hash = ?, live_demo_url = ?, tags = ?, featured = ?
      WHERE id = ?
    `,
    [
      req.body.title,
      req.body.description,
      nextAsset.imageUrl,
      nextAsset.imageFileId,
      nextAsset.imageFilePath,
      nextAsset.imageHash,
      req.body.live_demo_url || null,
      tags,
      req.body.featured === '1' || req.body.featured === 'true' ? 1 : 0,
      req.params.id,
    ]
  );

  if (hasAssetChanged(existingAsset, nextAsset) && existingAsset.imageFileId && existingAsset.imageFileId !== nextAsset.imageFileId) {
    await deleteImageIfUnreferenced(existingAsset.imageFileId);
  }

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

  const oldImageFileId = project.image_file_id || null;

  const deleted = await deleteById('projects', req.params.id);
  if (!deleted) return res.status(404).json({ success: false, message: 'Project not found.' });

  if (oldImageFileId) {
    try {
      await deleteImageIfUnreferenced(oldImageFileId);
    } catch (error) {
      console.error('Project deleted but failed to delete orphaned image from ImageKit:', error);
    }
  }

  console.log('Deleted project and cleaned up cloud image for:', req.params.id);
  invalidateCache('projects:');
  res.json({ success: true, message: 'Project deleted successfully.' });
});

module.exports = { listProjects, getProjectById, createProject, updateProject, deleteProject };
