const asyncHandler = require('../utils/asyncHandler');
const { pool } = require('../config/db');
const { deleteById, countRows } = require('../models/baseModel');
const { sendContactEmail } = require('../config/smtp');

const createContact = asyncHandler(async (req, res) => {
  const { name, email, phone, subject, message } = req.body;
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ success: false, message: 'Name, email, subject, and message are required.' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO contacts (name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?)',
      [name, email, phone || null, subject, message]
    );

    const contact = {
      id: result.insertId || null,
      name,
      email,
      phone: phone || null,
      subject,
      message
    };

    sendContactEmail(contact).catch((err) => {
      console.error('Contact email send failed:', err);
    });

    return res.status(201).json({
      success: true,
      message: 'Contact submitted successfully'
    });
  } catch (err) {
    console.error('Failed to save contact to DB:', err && err.message ? err.message : err);
    return res.status(500).json({ success: false, message: err.message || 'Failed to submit contact' });
  }
});

const listContacts = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 12, 1), 100);
  const offset = (page - 1) * limit;
  const [rows] = await pool.query('SELECT * FROM contacts ORDER BY id DESC LIMIT ? OFFSET ?', [limit, offset]);
  const total = await countRows('contacts');
  res.json({ data: rows, meta: { page, limit, total } });
});

const deleteContact = asyncHandler(async (req, res) => {
  const deleted = await deleteById('contacts', req.params.id);
  if (!deleted) return res.status(404).json({ message: 'Contact not found.' });
  res.json({ message: 'Contact deleted successfully.' });
});

module.exports = { createContact, listContacts, deleteContact };
