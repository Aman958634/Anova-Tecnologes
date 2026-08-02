const express = require('express');
const authRequired = require('../middleware/auth');
const { createContact, listContacts, deleteContact } = require('../controllers/contactController');
const { contactRateLimit } = require('../middleware/rateLimiter');

const router = express.Router();

router.post('/', contactRateLimit, createContact);
router.get('/', authRequired, listContacts);
router.delete('/:id', authRequired, deleteContact);

module.exports = router;
