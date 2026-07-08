const asyncHandler = require('../utils/asyncHandler');
const { pool } = require('../config/db');
const fs = require('fs');
const path = require('path');
const { findById, deleteById } = require('../models/baseModel');
const { getCache, setCache, invalidateCache } = require('../utils/simpleCache');

const setShortCacheHeaders = (res) => {
  res.set('Cache-Control', 'public, max-age=120, stale-while-revalidate=30');
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
  // Validate uploaded image paths: if a row references an uploads file that
  // does not exist on disk (e.g. not deployed to production), clear the
  // `image_url` so the frontend falls back to initials/placeholders and
  // avoids noisy 404 requests.
  const uploadsDir = path.join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads');
  for (const r of rows) {
    if (r.image_url && String(r.image_url).startsWith('/uploads/')) {
      const filename = path.basename(r.image_url);
      const filePath = path.join(uploadsDir, filename);
      try {
        if (!fs.existsSync(filePath)) {
          r.image_url = null;
        }
      } catch (err) {
        r.image_url = null;
      }
    }
  }
  const [countRows] = await pool.query('SELECT COUNT(*) AS total FROM team_members WHERE name LIKE ? OR designation LIKE ?', [search, search]);
  const result = { data: rows, meta: { page, limit, total: countRows[0].total } };
  setCache(cacheKey, result, 120000);
  setShortCacheHeaders(res);
  res.json(result);
});

const createTeamMember = asyncHandler(async (req, res) => {
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : req.body.image_url || null;
  const [result] = await pool.query(
    'INSERT INTO team_members (name, designation, image_url, featured) VALUES (?, ?, ?, ?)',
    [req.body.name, req.body.designation, imageUrl, req.body.featured === '1' || req.body.featured === 'true' ? 1 : 0]
  );
  invalidateCache('team:');
  res.status(201).json(await findById('team_members', result.insertId));
});

const updateTeamMember = asyncHandler(async (req, res) => {
  const existing = await findById('team_members', req.params.id);
  if (!existing) return res.status(404).json({ message: 'Team member not found.' });

  const shouldRemoveImage = req.body.remove_image === 'true' || req.body.remove_image === '1';
  const imageUrl = shouldRemoveImage ? null : (req.file ? `/uploads/${req.file.filename}` : (req.body.image_url !== undefined ? req.body.image_url || null : existing.image_url));
  await pool.query(
    'UPDATE team_members SET name = ?, designation = ?, image_url = ?, featured = ? WHERE id = ?',
    [req.body.name, req.body.designation, imageUrl, req.body.featured === '1' || req.body.featured === 'true' ? 1 : 0, req.params.id]
  );
  res.json(await findById('team_members', req.params.id));
});

const deleteTeamMember = asyncHandler(async (req, res) => {
  const deleted = await deleteById('team_members', req.params.id);
  if (!deleted) return res.status(404).json({ message: 'Team member not found.' });
  invalidateCache('team:');
  res.json({ message: 'Team member deleted successfully.' });
});

module.exports = { listTeamMembers, createTeamMember, updateTeamMember, deleteTeamMember };