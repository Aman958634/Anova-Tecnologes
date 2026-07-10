const asyncHandler = require('../utils/asyncHandler');
const { pool } = require('../config/db');
const fs = require('fs');
const path = require('path');
const { findById, deleteById } = require('../models/baseModel');
const { getCache, setCache, invalidateCache } = require('../utils/simpleCache');

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

const normalizeImageInput = (input, file) => {
  if (file && file.filename) {
    return `/uploads/team/${file.filename}`;
  }
  if (!input) return null;
  const value = String(input).trim();
  if (isPlaceholderImage(value)) return null;
  return value || null;
};

const mapTeamRow = (row, req) => ({
  ...row,
  image: row.image_url || null,
  imageUrl: buildAbsoluteImageUrl(req, row.image_url)
});

const removeUploadedFile = async (imageUrl) => {
  if (!imageUrl || !imageUrl.startsWith('/uploads/')) return;
  const filePath = path.join(__dirname, '..', imageUrl.replace(/^\//, ''));
  try {
    if (fs.existsSync(filePath)) {
      console.log('Removing uploaded file:', filePath);
      await fs.promises.unlink(filePath);
    }
  } catch (error) {
    console.error('Failed to remove uploaded file:', filePath, error);
  }
};

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

  const uploadsRoot = path.join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads');
  const teamUploadDir = path.join(uploadsRoot, 'team');
  const projectUploadDir = path.join(uploadsRoot, 'projects');

  for (const r of rows) {
    if (!r.image_url) continue;

    let normalizedUrl = String(r.image_url).trim().replace(/\\+/g, '/');
    if (!normalizedUrl.startsWith('/')) {
      normalizedUrl = `/${normalizedUrl}`;
    }
    if (!normalizedUrl.startsWith('/uploads/')) {
      normalizedUrl = `/uploads/${path.basename(normalizedUrl)}`;
    }

    const filename = path.basename(normalizedUrl);
    const candidates = [];

    if (normalizedUrl.startsWith('/uploads/team/')) {
      candidates.push(path.join(teamUploadDir, filename));
    } else if (normalizedUrl.startsWith('/uploads/projects/')) {
      candidates.push(path.join(projectUploadDir, filename));
    }

    candidates.push(
      path.join(teamUploadDir, filename),
      path.join(uploadsRoot, filename),
      path.join(projectUploadDir, filename)
    );

    try {
      const found = candidates.find((candidate) => fs.existsSync(candidate));
      if (!found) {
        r.image_url = null;
        continue;
      }
      if (found.startsWith(teamUploadDir)) {
        r.image_url = `/uploads/team/${filename}`;
      } else if (found.startsWith(projectUploadDir)) {
        r.image_url = `/uploads/projects/${filename}`;
      } else {
        r.image_url = `/uploads/${filename}`;
      }
    } catch (err) {
      r.image_url = null;
    }
  }

  const formatted = rows.map((row) => mapTeamRow(row, req));
  const [countRows] = await pool.query('SELECT COUNT(*) AS total FROM team_members WHERE name LIKE ? OR designation LIKE ?', [search, search]);
  const result = { success: true, data: formatted, team: formatted, meta: { page, limit, total: countRows[0].total } };
  setCache(cacheKey, result, 120000);
  setShortCacheHeaders(res);
  res.json(result);
});

const createTeamMember = asyncHandler(async (req, res) => {
  const imageUrl = normalizeImageInput(req.body.image_url, req.file);
  if (req.file) {
    console.log('Uploaded team image:', req.file.filename);
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
  const uploadedImageUrl = normalizeImageInput(req.body.image_url, req.file);
  const imageUrl = shouldRemoveImage ? null : (uploadedImageUrl || existing.image_url);

  if (req.file || shouldRemoveImage) {
    if (existing.image_url && existing.image_url.startsWith('/uploads/')) {
      await removeUploadedFile(existing.image_url);
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

  if (existing.image_url && existing.image_url.startsWith('/uploads/')) {
    await removeUploadedFile(existing.image_url);
  }

  const deleted = await deleteById('team_members', req.params.id);
  if (!deleted) return res.status(404).json({ message: 'Team member not found.' });
  invalidateCache('team:');
  res.json({ success: true, message: 'Team member deleted successfully.' });
});

module.exports = { listTeamMembers, createTeamMember, updateTeamMember, deleteTeamMember };