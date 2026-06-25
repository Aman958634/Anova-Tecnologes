const express = require('express');
const upload = require('../middleware/upload');
const authRequired = require('../middleware/auth');
const { listServices, createService, updateService, deleteService } = require('../controllers/serviceController');

const router = express.Router();

router.get('/', listServices);
router.post('/', authRequired, upload.single('image'), createService);
router.put('/:id', authRequired, upload.single('image'), updateService);
router.delete('/:id', authRequired, deleteService);

module.exports = router;
