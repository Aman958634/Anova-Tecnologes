const express = require('express');
const upload = require('../middleware/upload');
const authRequired = require('../middleware/auth');
const { listTeamMembers, createTeamMember, updateTeamMember, deleteTeamMember } = require('../controllers/teamController');

const router = express.Router();

router.get('/', listTeamMembers);
router.post('/', authRequired, upload.single('image'), createTeamMember);
router.put('/:id', authRequired, upload.single('image'), updateTeamMember);
router.delete('/:id', authRequired, deleteTeamMember);

module.exports = router;