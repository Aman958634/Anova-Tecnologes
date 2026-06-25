const asyncHandler = require('../utils/asyncHandler');
const { pool } = require('../config/db');
const { findById, deleteById } = require('../models/baseModel');

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
  key_features: parseKeyFeatures(row.key_features)
});

const listServices = asyncHandler(async (req, res) => {
  const search = req.query.search ? `%${req.query.search}%` : '%';
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 12, 1), 100);
  const offset = (page - 1) * limit;

  const [rows] = await pool.query(
    'SELECT * FROM services WHERE title LIKE ? OR description LIKE ? ORDER BY featured DESC, id DESC LIMIT ? OFFSET ?',
    [search, search, limit, offset]
  );
  const [countRows] = await pool.query('SELECT COUNT(*) AS total FROM services WHERE title LIKE ? OR description LIKE ?', [search, search]);
  res.json({ data: rows.map(normalizeService), meta: { page, limit, total: countRows[0].total } });
});

const createService = asyncHandler(async (req, res) => {
  const { title, description, icon, featured, key_features } = req.body;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : req.body.image_url || null;
  const [result] = await pool.query(
    'INSERT INTO services (title, description, icon, key_features, image_url, featured) VALUES (?, ?, ?, ?, ?, ?)',
    [title, description, icon || null, serializeKeyFeatures(key_features), imageUrl, featured === '1' || featured === 'true' ? 1 : 0]
  );
  res.status(201).json(normalizeService(await findById('services', result.insertId)));
});

const updateService = asyncHandler(async (req, res) => {
  const existing = await findById('services', req.params.id);
  if (!existing) return res.status(404).json({ message: 'Service not found.' });

  const imageUrl = req.file ? `/uploads/${req.file.filename}` : req.body.image_url || existing.image_url;
  await pool.query(
    'UPDATE services SET title = ?, description = ?, icon = ?, key_features = ?, image_url = ?, featured = ? WHERE id = ?',
    [
      req.body.title,
      req.body.description,
      req.body.icon || null,
      serializeKeyFeatures(req.body.key_features || existing.key_features),
      imageUrl,
      req.body.featured === '1' || req.body.featured === 'true' ? 1 : 0,
      req.params.id
    ]
  );
  res.json(normalizeService(await findById('services', req.params.id)));
});

const deleteService = asyncHandler(async (req, res) => {
  const deleted = await deleteById('services', req.params.id);
  if (!deleted) return res.status(404).json({ message: 'Service not found.' });
  res.json({ message: 'Service deleted successfully.' });
});

module.exports = { listServices, createService, updateService, deleteService };
