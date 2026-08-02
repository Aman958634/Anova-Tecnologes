const express = require('express');
const upload = require('../middleware/upload');
const authRequired = require('../middleware/auth');
const { listProjects, getProjectById, createProject, updateProject, deleteProject } = require('../controllers/projectController');

const router = express.Router();

router.get('/', listProjects);
router.get('/:id', getProjectById);
router.post('/', authRequired, upload.single('image'), createProject);
router.put('/:id', authRequired, upload.single('image'), updateProject);
router.delete('/:id', authRequired, deleteProject);

module.exports = router;
