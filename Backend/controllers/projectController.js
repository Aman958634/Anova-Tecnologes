const asyncHandler = require('../utils/asyncHandler');
const { pool } = require('../config/db');
const { findById, deleteById } = require('../models/baseModel');

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

const listProjects = asyncHandler(async (req, res) => {
  const search = req.query.search ? `%${req.query.search}%` : '%';
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 12, 1), 100);
  const offset = (page - 1) * limit;

  const [rows] = await pool.query(
    'SELECT * FROM projects WHERE title LIKE ? OR description LIKE ? ORDER BY featured DESC, id DESC LIMIT ? OFFSET ?',
    [search, search, limit, offset]
  );
  const formatted = rows.map((row) => ({ ...row, tags: parseTags(row.tags) }));
  const [countRows] = await pool.query('SELECT COUNT(*) AS total FROM projects WHERE title LIKE ? OR description LIKE ?', [search, search]);
  res.json({ data: formatted, meta: { page, limit, total: countRows[0].total } });
});

const createProject = asyncHandler(async (req, res) => {
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : req.body.image_url || null;
  const tags = JSON.stringify(parseTags(req.body.tags));
  const [result] = await pool.query(
    'INSERT INTO projects (title, description, image_url, live_demo_url, tags, featured) VALUES (?, ?, ?, ?, ?, ?)',
    [req.body.title, req.body.description, imageUrl, req.body.live_demo_url || null, tags, req.body.featured === '1' || req.body.featured === 'true' ? 1 : 0]
  );
  res.status(201).json(await findById('projects', result.insertId));
});

const updateProject = asyncHandler(async (req, res) => {
  const existing = await findById('projects', req.params.id);
  if (!existing) return res.status(404).json({ message: 'Project not found.' });

  const shouldRemoveImage = req.body.remove_image === 'true' || req.body.remove_image === '1';
  const imageUrl = shouldRemoveImage ? null : (req.file ? `/uploads/${req.file.filename}` : (req.body.image_url !== undefined ? req.body.image_url || null : existing.image_url));
  const tags = JSON.stringify(parseTags(req.body.tags || existing.tags));
  await pool.query(
    'UPDATE projects SET title = ?, description = ?, image_url = ?, live_demo_url = ?, tags = ?, featured = ? WHERE id = ?',
    [req.body.title, req.body.description, imageUrl, req.body.live_demo_url || null, tags, req.body.featured === '1' || req.body.featured === 'true' ? 1 : 0, req.params.id]
  );
  const updated = await findById('projects', req.params.id);
  updated.tags = parseTags(updated.tags);
  res.json(updated);
});

const deleteProject = asyncHandler(async (req, res) => {
  const deleted = await deleteById('projects', req.params.id);
  if (!deleted) return res.status(404).json({ message: 'Project not found.' });
  res.json({ message: 'Project deleted successfully.' });
});

module.exports = { listProjects, createProject, updateProject, deleteProject };
