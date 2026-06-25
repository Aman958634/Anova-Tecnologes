const express = require('express');
const upload = require('../middleware/upload');
const authRequired = require('../middleware/auth');
const { listTestimonials, createTestimonial, updateTestimonial, deleteTestimonial } = require('../controllers/testimonialController');

const router = express.Router();

router.get('/', listTestimonials);
router.post('/', authRequired, upload.single('photo'), createTestimonial);
router.put('/:id', authRequired, upload.single('photo'), updateTestimonial);
router.delete('/:id', authRequired, deleteTestimonial);

module.exports = router;
