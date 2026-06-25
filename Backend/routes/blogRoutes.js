const express = require('express');
const upload = require('../middleware/upload');
const authRequired = require('../middleware/auth');
const { listBlogs, getBlogById, createBlog, updateBlog, deleteBlog } = require('../controllers/blogController');

const router = express.Router();

router.get('/', listBlogs);
router.get('/:id', getBlogById);
router.post('/', authRequired, upload.single('image'), createBlog);
router.put('/:id', authRequired, upload.single('image'), updateBlog);
router.delete('/:id', authRequired, deleteBlog);

module.exports = router;
