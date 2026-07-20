const asyncHandler = require('../utils/asyncHandler');
const { pool } = require('../config/db');
const { findById, deleteById } = require('../models/baseModel');
const { getCache, setCache, invalidateCache } = require('../utils/simpleCache');
const { uploadToCloudinary, deleteFromCloudinary, extractPublicIdFromUrl, isCloudinaryUrl, generateFilename } = require('../utils/cloudStorage');

const setShortCacheHeaders = (res) => {
  res.set('Cache-Control', 'public, max-age=120, stale-while-revalidate=30');
};

const isPlaceholderImage = (url) => {
  if (!url) return false;
  return typeof url === 'string' && url.includes('images.unsplash.com');
};

const removeCloudImage = async (imageUrl) => {
  if (!imageUrl || !isCloudinaryUrl(imageUrl)) return;
  const publicId = extractPublicIdFromUrl(imageUrl);
  if (publicId) {
    await deleteFromCloudinary(publicId);
  }
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
  let photoUrl = null;

  if (req.file) {
    try {
      const filename = generateFilename(req.file.originalname, 'testimonial');
      const result = await uploadToCloudinary(req.file.buffer, 'testimonials', filename);
      photoUrl = result.url;
    } catch (error) {
      console.error('Cloudinary testimonial photo upload failed:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to upload photo. Please try again.',
      });
    }
  } else if (req.body.photo_url) {
    const value = String(req.body.photo_url).trim();
    if (!isPlaceholderImage(value)) {
      photoUrl = value;
    }
  }

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

  let photoUrl = existing.photo_url;

  if (req.file) {
    await removeCloudImage(existing.photo_url);
    try {
      const filename = generateFilename(req.file.originalname, 'testimonial');
      const result = await uploadToCloudinary(req.file.buffer, 'testimonials', filename);
      photoUrl = result.url;
    } catch (error) {
      console.error('Cloudinary testimonial photo upload failed:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to upload photo. Please try again.',
      });
    }
  } else if (req.body.photo_url) {
    const value = String(req.body.photo_url).trim();
    if (!isPlaceholderImage(value)) {
      if (existing.photo_url && existing.photo_url !== value && isCloudinaryUrl(existing.photo_url)) {
        await removeCloudImage(existing.photo_url);
      }
      photoUrl = value;
    }
  }

  await pool.query(
    'UPDATE testimonials SET name = ?, designation = ?, review = ?, photo_url = ?, rating = ? WHERE id = ?',
    [req.body.name, req.body.designation, req.body.review, photoUrl, Number(req.body.rating) || 5, req.params.id]
  );
  invalidateCache('testimonials:');
  res.json(await findById('testimonials', req.params.id));
});

const deleteTestimonial = asyncHandler(async (req, res) => {
  const existing = await findById('testimonials', req.params.id);
  if (existing) {
    await removeCloudImage(existing.photo_url);
  }
  const deleted = await deleteById('testimonials', req.params.id);
  if (!deleted) return res.status(404).json({ message: 'Testimonial not found.' });
  invalidateCache('testimonials:');
  res.json({ message: 'Testimonial deleted successfully.' });
});

module.exports = { listTestimonials, createTestimonial, updateTestimonial, deleteTestimonial };
