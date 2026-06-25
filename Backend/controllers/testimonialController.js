const asyncHandler = require('../utils/asyncHandler');
const { pool } = require('../config/db');
const { findById, deleteById } = require('../models/baseModel');

const listTestimonials = asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM testimonials ORDER BY id DESC');
  res.json({ data: rows });
});

const createTestimonial = asyncHandler(async (req, res) => {
  const photoUrl = req.file ? `/uploads/${req.file.filename}` : req.body.photo_url || null;
  const [result] = await pool.query(
    'INSERT INTO testimonials (name, designation, review, photo_url, rating) VALUES (?, ?, ?, ?, ?)',
    [req.body.name, req.body.designation, req.body.review, photoUrl, Number(req.body.rating) || 5]
  );
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
  res.json(await findById('testimonials', req.params.id));
});

const deleteTestimonial = asyncHandler(async (req, res) => {
  const deleted = await deleteById('testimonials', req.params.id);
  if (!deleted) return res.status(404).json({ message: 'Testimonial not found.' });
  res.json({ message: 'Testimonial deleted successfully.' });
});

module.exports = { listTestimonials, createTestimonial, updateTestimonial, deleteTestimonial };
