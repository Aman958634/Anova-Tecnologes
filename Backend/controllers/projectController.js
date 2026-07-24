const asyncHandler = require('../utils/asyncHandler');
const fs = require('fs/promises');
const os = require('os');
const path = require('path');
const { pool } = require('../config/db');
const { findById, deleteById } = require('../models/baseModel');
const { getCache, setCache, invalidateCache } = require('../utils/simpleCache');
const {
  deleteFromCloudinary,
  extractPublicIdFromUrl,
} = require('../utils/cloudStorage');
const { cloudinary, ensureCloudinaryConfigured } = require('../config/cloudinary');

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
  imageUrl: row.image_url ? buildAbsoluteImageUrl(req, row.image_url) : null,
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

const sanitizeExternalImageUrl = (value) => {
  if (!value) return null;
  const raw = String(value).trim();
  if (!raw || isPlaceholderImage(raw)) return null;
  if (!/^https?:\/\//i.test(raw)) return null;
  return raw;
};

const mapUploadedAsset = ({ url, fileId, filePath, hash, meta }) => ({
  imageUrl: url,
  imageFileId: fileId,
  imageFilePath: filePath,
  imageHash: hash,
  imageMeta: meta || null,
});

const mapExternalAsset = (url) => ({
  imageUrl: url,
  imageFileId: null,
  imageFilePath: null,
  imageHash: null,
  imageMeta: null,
});

const mapNoAsset = () => ({
  imageUrl: null,
  imageFileId: null,
  imageFilePath: null,
  imageHash: null,
  imageMeta: null,
});

const toProjectAsset = (row) => ({
  imageUrl: row?.image_url || null,
  imageFileId: row?.image_file_id || null,
  imageFilePath: row?.image_file_path || null,
  imageHash: row?.image_hash || null,
  imageMeta: row?.image_meta || null,
});

const deleteCloudinaryIfUnreferenced = async (publicId) => {
  try {
    if (!publicId) return;
    const [rows] = await pool.query('SELECT COUNT(*) AS total FROM projects WHERE image_file_id = ?', [publicId]);
    if (Number(rows[0]?.total || 0) === 0) {
      await deleteFromCloudinary(publicId);
    }
  } catch (error) {
    console.error(error);
    console.error(error.stack);
    throw error;
  }
};

let cachedProjectColumns = null;

const getProjectColumns = async () => {
  try {
    if (cachedProjectColumns) return cachedProjectColumns;

    try {
      const [rows] = await pool.query(
        `
          SELECT COLUMN_NAME
          FROM INFORMATION_SCHEMA.COLUMNS
          WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'projects'
        `
      );
      cachedProjectColumns = new Set(rows.map((row) => row.COLUMN_NAME));
    } catch (error) {
      console.error(error);
      console.error(error.stack);
      cachedProjectColumns = new Set([
        'title',
        'description',
        'image_url',
        'image_file_id',
        'image_file_path',
        'image_hash',
        'image_meta',
        'live_demo_url',
        'tags',
        'featured',
      ]);
    }

    return cachedProjectColumns;
  } catch (error) {
    console.error(error);
    console.error(error.stack);
    throw error;
  }
};

const parseFeaturedValue = (value, fallback) => {
  if (value === undefined || value === null || value === '') {
    return Number(fallback) === 1 ? 1 : 0;
  }

  if (typeof value === 'boolean') {
    return value ? 1 : 0;
  }

  const normalized = String(value).trim().toLowerCase();
  if (normalized === '1' || normalized === 'true' || normalized === 'yes') return 1;
  if (normalized === '0' || normalized === 'false' || normalized === 'no') return 0;
  return Number(fallback) === 1 ? 1 : 0;
};

const ensureStringOrFallback = (value, fallback) => {
  if (value === undefined || value === null) return fallback;
  return String(value).trim();
};

const parseTagsForSave = (value, fallbackRawTags) => {
  const raw = value === undefined ? fallbackRawTags : value;
  const tagsArray = parseTags(raw)
    .map((tag) => String(tag).trim())
    .filter(Boolean);
  return JSON.stringify(tagsArray);
};

const createTempFileFromUpload = async (file) => {
  const ext = path.extname(file.originalname || '').toLowerCase() || '.bin';
  const safeExt = /^[.][a-z0-9]{1,10}$/.test(ext) ? ext : '.bin';
  const tempFileName = `project-${Date.now()}-${Math.random().toString(36).slice(2)}${safeExt}`;
  const tempFilePath = path.join(os.tmpdir(), tempFileName);

  console.log('[projects:image] Writing temp file for Cloudinary upload:', tempFilePath);
  await fs.writeFile(tempFilePath, file.buffer);
  console.log('[projects:image] Temp file write complete');

  return tempFilePath;
};

const buildAssetFromFile = async (file, { folder = 'projects' } = {}) => {
  let tempFilePath = null;
  try {
    ensureCloudinaryConfigured();
    console.log('[projects:image] Cloudinary config check passed');

    if (!file) {
      throw new Error('Upload failed: req.file is undefined.');
    }

    if (!file.path && (!Buffer.isBuffer(file.buffer) || file.buffer.length === 0)) {
      throw new Error('Upload failed: req.file.path missing and req.file.buffer missing or empty.');
    }

    if (!file.path) {
      tempFilePath = await createTempFileFromUpload(file);
      file.path = tempFilePath;
    }

    console.log('Uploading image...');
    console.log('[projects:image] Cloudinary upload input:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      path: file.path,
      folder,
    });

    const result = await cloudinary.uploader.upload(file.path, {
      folder: 'projects',
    });

    console.log('Cloudinary response:', result);

    return mapUploadedAsset({
      url: result.secure_url,
      fileId: result.public_id,
      filePath: result.public_id,
      hash: `${result.format || 'raw'}:${result.bytes || 0}:${result.width || 0}x${result.height || 0}`,
      meta: JSON.stringify({
        width: result.width || null,
        height: result.height || null,
        format: result.format || null,
        bytes: result.bytes || null,
      }),
    });
  } catch (error) {
    console.error('PROJECT ERROR');
    console.error(error);
    console.error(error.message);
    console.error(error.stack);
    console.error(error.http_code);
    console.error(error.name);
    throw error;
  } finally {
    if (tempFilePath) {
      try {
        await fs.unlink(tempFilePath);
        console.log('[projects:image] Temp file removed:', tempFilePath);
      } catch (cleanupError) {
        console.error('[projects:image] Temp file cleanup failed:', cleanupError?.message || cleanupError);
      }
    }
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
  try {
    console.log('========== CREATE PROJECT START ==========' );
    console.log('[projects:create] Step 1: Request received');
    console.log('[projects:create] Method:', req.method);
    console.log('[projects:create] Content-Type:', req.headers['content-type'] || null);
    console.log('req.body:', req.body);
    console.log('req.file:', req.file);

    if (!req.file) {
      console.log('req.file is undefined');
      console.log('[projects:create] Step 2: req.file undefined, returning 400');
      return res.status(400).json({
        success:false,
        message:'Image file not received.'
      });
    }

    console.log('[projects:create] Step 3: Starting Cloudinary upload');
    const asset = await buildAssetFromFile(req.file, { folder: 'projects' });
    console.log('[projects:create] Step 4: Cloudinary upload success', {
      image_url: asset.imageUrl,
      public_id: asset.imageFileId,
    });

    const tags = JSON.stringify(parseTags(req.body.tags));
    const createSql = `
      INSERT INTO projects
      (title, description, image_url, image_file_id, image_file_path, image_hash, image_meta, live_demo_url, tags, featured)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const createValues = [
      req.body.title,
      req.body.description,
      asset.imageUrl,
      asset.imageFileId,
      asset.imageFilePath,
      asset.imageHash,
      asset.imageMeta,
      req.body.live_demo_url || null,
      tags,
      req.body.featured === '1' || req.body.featured === 'true' ? 1 : 0,
    ];

    console.log('[projects:create] Step 5: Running INSERT query');
    console.log('[projects:create] SQL Query:', createSql);
    console.log('[projects:create] SQL Values:', createValues);

    let result;
    try {
      [result] = await pool.query(createSql, createValues);
    } catch (error) {
      console.error('[projects:create] MySQL INSERT failed');
      console.error(error);
      console.error(error.stack);
      console.error(error.code);
      console.error(error.errno);
      console.error(error.sqlMessage);
      console.error(error.sqlState);
      throw error;
    }
    console.log('[projects:create] Step 6: INSERT success', { insertId: result.insertId });

    invalidateCache('projects:');
    console.log('[projects:create] Step 7: Cache invalidated');

    const created = await findById('projects', result.insertId);
    console.log('[projects:create] Step 8: Fetch created project complete');

    const mapped = mapProjectRow(created, req);
    console.log('[projects:create] Step 9: Response ready');
    return res.status(201).json({ success: true, data: mapped, project: mapped });
  } catch (error) {
    console.error(error);
    console.error(error.stack);
    console.error(error.http_code);
    console.error(error.name);
    return res.status(500).json({
      success:false,
      message:error.message,
      stack:error.stack
    });
  }
});

const updateProject = asyncHandler(async (req, res) => {
  try {
    console.log('========== UPDATE PROJECT START ==========' );
    console.log('[projects:update] Step 1: Request received');
    console.log('[projects:update] Method:', req.method);
    console.log('[projects:update] Project ID:', req.params.id);
    console.log('[projects:update] Content-Type:', req.headers['content-type'] || null);
    console.log('req.body:', req.body);
    console.log('req.file:', req.file);

    const projectId = Number(req.params.id);
    if (!Number.isInteger(projectId) || projectId <= 0) {
      console.log('[projects:update] Step 2: Invalid project id');
      return res.status(400).json({
        success: false,
        message: 'Invalid project id.',
        stack: null,
      });
    }

    if (!req.body || typeof req.body !== 'object') {
      console.log('[projects:update] Step 3: Invalid request body');
      return res.status(400).json({
        success: false,
        message: 'Invalid request body.',
        stack: null,
      });
    }

    if (!req.file) {
      console.log('req.file is undefined');
      console.log('[projects:update] Step 4: req.file undefined, returning 400');
      return res.status(400).json({
        success:false,
        message:'Image file not received.'
      });
    }

    console.log('[projects:update] Step 5: Loading existing project');
    const existing = await findById('projects', projectId);
    if (!existing) {
      console.log('[projects:update] Step 6: Project not found');
      return res.status(404).json({
        success: false,
        message: 'Project not found.',
        stack: null,
      });
    }

    const shouldRemoveImage = req.body.remove_image === 'true' || req.body.remove_image === '1';
    const existingAsset = toProjectAsset(existing);
    let nextAsset = existingAsset;
    const externalImageUrl = sanitizeExternalImageUrl(req.body.image_url);

    if (req.file) {
      console.log('[projects:update] Step 7: Starting Cloudinary upload');
      try {
        const uploadedAsset = await buildAssetFromFile(req.file, { folder: 'projects' });
        nextAsset = {
          imageUrl: uploadedAsset.imageUrl,
          imageFileId: uploadedAsset.imageFileId,
          imageFilePath: uploadedAsset.imageFilePath,
          imageHash: uploadedAsset.imageHash,
          imageMeta: uploadedAsset.imageMeta,
        };
        console.log('[projects:update] Step 8: Cloudinary upload success', {
          projectId,
          image_url: nextAsset.imageUrl,
          public_id: nextAsset.imageFileId,
        });
      } catch (error) {
        console.error(error);
        console.error(error.stack);
        console.error(error.http_code);
        console.error(error.name);
        return res.status(500).json({
          success:false,
          message:error.message,
          stack:error.stack
        });
      }
    } else if (shouldRemoveImage) {
      nextAsset = mapNoAsset();
    } else if (externalImageUrl && externalImageUrl !== existingAsset.imageUrl) {
      nextAsset = mapExternalAsset(externalImageUrl);
    }

    const nextTitle = ensureStringOrFallback(req.body.title, existing.title);
    const nextDescription = ensureStringOrFallback(req.body.description, existing.description);
    const nextLiveDemoUrl = ensureStringOrFallback(req.body.live_demo_url, existing.live_demo_url || null) || null;
    const nextFeatured = parseFeaturedValue(req.body.featured, existing.featured);
    const nextTags = parseTagsForSave(req.body.tags, existing.tags);

    const projectColumns = await getProjectColumns();
    const updateFields = [
      { column: 'title', value: nextTitle },
      { column: 'description', value: nextDescription },
      { column: 'image_url', value: nextAsset.imageUrl },
      { column: 'image_file_id', value: nextAsset.imageFileId },
      { column: 'image_file_path', value: nextAsset.imageFilePath },
      { column: 'image_hash', value: nextAsset.imageHash },
      { column: 'image_meta', value: nextAsset.imageMeta },
      { column: 'live_demo_url', value: nextLiveDemoUrl },
      { column: 'tags', value: nextTags },
      { column: 'featured', value: nextFeatured },
    ].filter((field) => projectColumns.has(field.column));

    if (!projectColumns.has('image_meta')) {
      console.warn('[projects:update] image_meta column missing. Update query auto-adjusted to existing columns only.');
    }

    if (updateFields.length === 0) {
      return res.status(500).json({
        success: false,
        message: 'No valid columns available for update on projects table.',
        stack: null,
      });
    }

    const setClause = updateFields.map((field) => `${field.column} = ?`).join(', ');
    const sql = `UPDATE projects SET ${setClause} WHERE id = ?`;
    const values = updateFields.map((field) => field.value);
    values.push(projectId);

    console.log('[projects:update] Step 9: SQL Query:', sql);
    console.log('[projects:update] Step 9: SQL Values:', values);

    console.log('[projects:update] Step 10: Database update started', {
      projectId,
      updatedColumns: updateFields.map((field) => field.column),
    });
    try {
      await pool.query(sql, values);
    } catch (error) {
      console.error('[projects:update] MySQL UPDATE failed');
      console.error(error);
      console.error(error.stack);
      console.error(error.code);
      console.error(error.errno);
      console.error(error.sqlMessage);
      console.error(error.sqlState);
      throw error;
    }
    console.log('[projects:update] Step 11: Database update finished', { projectId });

    const shouldDeleteOldCloudinary =
      Boolean(req.file || shouldRemoveImage || (externalImageUrl && externalImageUrl !== existingAsset.imageUrl)) &&
      Boolean(existingAsset.imageFileId) &&
      existingAsset.imageFileId !== nextAsset.imageFileId;

    if (shouldDeleteOldCloudinary) {
      console.log('[projects:update] Step 12: Deleting old cloud image:', existingAsset.imageFileId);
      try {
        await deleteCloudinaryIfUnreferenced(existingAsset.imageFileId);
        console.log('[projects:update] Step 13: Old image delete completed');
      } catch (error) {
        console.error(error);
        console.error(error.stack);
      }
    }

    invalidateCache('projects:');
    console.log('[projects:update] Step 14: Cache invalidated');
    const updated = await findById('projects', projectId);
    console.log('[projects:update] Step 15: Fetch updated project complete');
    const mapped = mapProjectRow(updated, req);

    console.log('[projects:update] Step 16: Response ready');
    return res.json({
      success: true,
      message: 'Project updated successfully',
      project: mapped,
    });
  } catch (error) {
    console.error(error);
    console.error(error.stack);
    console.error(error.http_code);
    console.error(error.name);
    return res.status(500).json({
      success:false,
      message:error.message,
      stack:error.stack
    });
  }
});

const deleteProject = asyncHandler(async (req, res) => {
  const project = await findById('projects', req.params.id);
  if (!project) {
    return res.status(404).json({ success: false, message: 'Project not found.' });
  }

  const oldImageFileId = project.image_file_id || extractPublicIdFromUrl(project.image_url) || null;

  const deleted = await deleteById('projects', req.params.id);
  if (!deleted) return res.status(404).json({ success: false, message: 'Project not found.' });

  if (oldImageFileId) {
    try {
      await deleteCloudinaryIfUnreferenced(oldImageFileId);
    } catch (error) {
      console.error('Project deleted but failed to delete orphaned image from Cloudinary:', error);
    }
  }

  console.log('Deleted project and cleaned up cloud image for:', req.params.id);
  invalidateCache('projects:');
  res.json({ success: true, message: 'Project deleted successfully.' });
});

module.exports = { listProjects, getProjectById, createProject, updateProject, deleteProject };
