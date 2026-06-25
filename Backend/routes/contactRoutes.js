const express = require('express');
const authRequired = require('../middleware/auth');
const { createContact, listContacts, deleteContact } = require('../controllers/contactController');

const router = express.Router();

router.post('/', createContact);
router.get('/', authRequired, listContacts);
router.delete('/:id', authRequired, deleteContact);

module.exports = router;
