const express = require('express');
const upload = require('../middleware/upload');
const authRequired = require('../middleware/auth');
const { listProjects, getProjectById, createProject, updateProject, deleteProject } = require('../controllers/projectController');

const router = express.Router();

const logBeforeAuthCreate = (req, res, next) => {
	console.log('========== PROJECT CREATE ROUTE ==========' );
	console.log('Before auth middleware (POST /projects)');
	next();
};

const logBeforeMulterCreate = (req, res, next) => {
	console.log('Before multer middleware (POST /projects)');
	upload.single('image')(req, res, (error) => {
		if (error) return next(error);
		console.log('After multer middleware (POST /projects)');
		next();
	});
};

const logBeforeAuth = (req, res, next) => {
	console.log('========== PROJECT UPDATE ROUTE ==========' );
	console.log('Before auth middleware');
	next();
};

const logBeforeMulter = (req, res, next) => {
	console.log('Before multer middleware');
	upload.single('image')(req, res, (error) => {
		if (error) return next(error);
		console.log('After multer middleware');
		next();
	});
};

router.get('/', listProjects);
router.get('/:id', getProjectById);
router.post('/', logBeforeAuthCreate, authRequired, logBeforeMulterCreate, createProject);
router.put('/:id', logBeforeAuth, authRequired, logBeforeMulter, updateProject);
router.delete('/:id', authRequired, deleteProject);

module.exports = router;
