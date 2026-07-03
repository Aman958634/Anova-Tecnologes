const asyncHandler = require('../utils/asyncHandler');
const { pool } = require('../config/db');
const { findById, deleteById } = require('../models/baseModel');
const { getCache, setCache, invalidateCache } = require('../utils/simpleCache');

const setShortCacheHeaders = (res) => {
  res.set('Cache-Control', 'public, max-age=120, stale-while-revalidate=30');
};

const listTestimonials = asyncHandler(async (req, res) => {
  const cacheKey = 'testimonials:latest';
  const cached = getCache(cacheKey);
  if (cached) {
    setShortCacheHeaders(res);
    return res.json(cached);
  }

  const [rows] = await pool.query('SELECT * FROM testimonials ORDER BY id DESC');
  const result = { data: rows };
  setCache(cacheKey, result, 120000);
  setShortCacheHeaders(res);
  res.json(result);
});

const createTestimonial = asyncHandler(async (req, res) => {
  const photoUrl = req.file ? `/uploads/${req.file.filename}` : req.body.photo_url || null;
  const [result] = await pool.query(
    'INSERT INTO testimonials (name, designation, review, photo_url, rating) VALUES (?, ?, ?, ?, ?)',
    [req.body.name, req.body.designation, req.body.review, photoUrl, Number(req.body.rating) || 5]
  );
  invalidateCache('testimonials:');
  res.status(201).json(await findById('testimonials', result.insertId));
});

const updateTestimonial = asyncHandler(async (req, res) => {
  const existing = await findById('testimonials', req.params.id);
  if (!existing) return res.status(404).json({ message: 'Testimonial not found.' });

  const photoUrl = req.file ? `/uploads/${req.file.filename}` : req.body.photo_url || existing.photo_url;
  await pool.query(
    'UPDATE testimonials SET name = ?, designation = ?, review = ?, photo_url = ?, rating = ? WHERE id = ?',
    [req.body.name, req.body.designation, req.body.review, photoUrl, Number(req.body.rating) || 5, req.params.id]
  );
  invalidateCache('testimonials:');
  res.json(await findById('testimonials', req.params.id));
});

const deleteTestimonial = asyncHandler(async (req, res) => {
  const deleted = await deleteById('testimonials', req.params.id);
  if (!deleted) return res.status(404).json({ message: 'Testimonial not found.' });
  invalidateCache('testimonials:');
  res.json({ message: 'Testimonial deleted successfully.' });
});

module.exports = { listTestimonials, createTestimonial, updateTestimonial, deleteTestimonial };
