const express = require('express');
const authRoutes = require('./authRoutes');
const serviceRoutes = require('./serviceRoutes');
const projectRoutes = require('./projectRoutes');
const blogRoutes = require('./blogRoutes');
const testimonialRoutes = require('./testimonialRoutes');
const teamRoutes = require('./teamRoutes');
const contactRoutes = require('./contactRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const statsRoutes = require('./statsRoutes');
const chatbotRoutes = require('./chatbotRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/services', serviceRoutes);
router.use('/projects', projectRoutes);
router.use('/blogs', blogRoutes);
router.use('/testimonials', testimonialRoutes);
router.use('/team', teamRoutes);
router.use('/contact', contactRoutes);
router.use('/admin', dashboardRoutes);
router.use('/stats', statsRoutes);
router.use('/chatbot', chatbotRoutes);

module.exports = router;
