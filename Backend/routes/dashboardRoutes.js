const express = require('express');
const authRequired = require('../middleware/auth');
const { getStats } = require('../controllers/dashboardController');

const router = express.Router();

router.get('/stats', authRequired, getStats);

module.exports = router;
