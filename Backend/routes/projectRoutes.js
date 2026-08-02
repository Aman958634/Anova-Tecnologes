const express = require('express');
const upload = require('../middleware/upload');
const authRequired = require('../middleware/auth');
const { listProjects, getProjectById, createProject, updateProject, deleteProject } = require('../controllers/projectController');

const router = express.Router();

router.use((req, res, next) => {
	if (req.method === 'POST' && req.path === '/') {
		console.log('[projects:route] Route hit POST /api/projects');
	}
	if (req.method === 'PUT' && /^\/[0-9]+$/.test(req.path)) {
		console.log(`[projects:route] Route hit PUT /api/projects${req.path}`);
	}
	next();
});

const logBeforeAuthCreate = (req, res, next) => {
	console.log('========== PROJECT CREATE ROUTE ==========' );
	console.log('Before auth middleware (POST /projects)');
	next();
};

const logBeforeMulterCreate = (req, res, next) => {
	console.log('Before multer middleware (POST /projects)');
	upload.single('image')(req, res, (error) => {
		if (error) {
			console.error('[projects:route] Multer rejected upload (POST /projects)');
			console.error(error);
			console.error(error.stack);
			console.error(error.code);
			console.error(error.name);
			console.error(error.message);
			return next(error);
		}
		console.log('[projects:route] Multer success (POST /projects)');
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
		if (error) {
			console.error('[projects:route] Multer rejected upload (PUT /projects/:id)');
			console.error(error);
			console.error(error.stack);
			console.error(error.code);
			console.error(error.name);
			console.error(error.message);
			return next(error);
		}
		console.log('[projects:route] Multer success (PUT /projects/:id)');
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
