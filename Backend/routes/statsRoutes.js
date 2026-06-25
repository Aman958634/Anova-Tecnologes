const express = require('express');
const authRequired = require('../middleware/auth');
const { getSiteStats, updateSiteStats } = require('../controllers/statsController');

const router = express.Router();

router.get('/', getSiteStats);
router.put('/', authRequired, updateSiteStats);

module.exports = router;
