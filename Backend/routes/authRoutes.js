const express = require('express');
const { login, register, me, seedAdmin } = require('../controllers/authController');
const authRequired = require('../middleware/auth');

const router = express.Router();

router.get('/login', (req, res) => {
  res.json({ message: 'Auth login endpoint is ready. Send a POST request with email and password.' });
});
router.post('/login', login);
router.post('/register', register);
router.post('/seed-admin', seedAdmin);
router.get('/me', authRequired, me);

module.exports = router;
