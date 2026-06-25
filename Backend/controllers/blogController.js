const asyncHandler = require('../utils/asyncHandler');
const { pool } = require('../config/db');
const { findById, deleteById } = require('../models/baseModel');

const listBlogs = asyncHandler(async (req, res) => {
  const search = req.query.search ? `%${req.query.search}%` : '%';
  const category = req.query.category ? `%${req.query.category}%` : '%';
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 12, 1), 100);
  const offset = (page - 1) * limit;

  const [rows] = await pool.query(
    'SELECT * FROM blogs WHERE (title LIKE ? OR excerpt LIKE ?) AND category LIKE ? ORDER BY published_at DESC, id DESC LIMIT ? OFFSET ?',
    [search, search, category, limit, offset]
  );
  const [countRows] = await pool.query('SELECT COUNT(*) AS total FROM blogs WHERE (title LIKE ? OR excerpt LIKE ?) AND category LIKE ?', [search, search, category]);
  res.json({ data: rows, meta: { page, limit, total: countRows[0].total } });
});

const createBlog = asyncHandler(async (req, res) => {
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : req.body.image_url || null;
  const [result] = await pool.query(
    'INSERT INTO blogs (title, excerpt, content, category, image_url, published_at) VALUES (?, ?, ?, ?, ?, ?)',
    [req.body.title, req.body.excerpt, req.body.content || null, req.body.category, imageUrl, req.body.published_at || null]
  );
  res.status(201).json(await findById('blogs', result.insertId));
});

const updateBlog = asyncHandler(async (req, res) => {
  const existing = await findById('blogs', req.params.id);
  if (!existing) return res.status(404).json({ message: 'Blog not found.' });

  const imageUrl = req.file ? `/uploads/${req.file.filename}` : req.body.image_url || existing.image_url;
  await pool.query(
    'UPDATE blogs SET title = ?, excerpt = ?, content = ?, category = ?, image_url = ?, published_at = ? WHERE id = ?',
    [req.body.title, req.body.excerpt, req.body.content || null, req.body.category, imageUrl, req.body.published_at || existing.published_at, req.params.id]
  );
  res.json(await findById('blogs', req.params.id));
});

const getBlogById = asyncHandler(async (req, res) => {
  const blog = await findById('blogs', req.params.id);
  if (!blog) return res.status(404).json({ message: 'Blog not found.' });
  res.json(blog);
});

const deleteBlog = asyncHandler(async (req, res) => {
  const deleted = await deleteById('blogs', req.params.id);
  if (!deleted) return res.status(404).json({ message: 'Blog not found.' });
  res.json({ message: 'Blog deleted successfully.' });
});

module.exports = { listBlogs, getBlogById, createBlog, updateBlog, deleteBlog };
