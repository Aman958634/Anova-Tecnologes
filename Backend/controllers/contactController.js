const asyncHandler = require('../utils/asyncHandler');
const { pool } = require('../config/db');
const { deleteById, countRows } = require('../models/baseModel');
const { sendEmail } = require('../config/smtp');

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
      message,
    };

    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
        <h2 style="color: #1d4ed8; margin-bottom: 16px;">New contact message</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p style="white-space: pre-wrap;">${message}</p>
      </div>
    `;

    try {
      await sendEmail(`New contact received: ${subject}`, html, {
        email,
        name: name || email,
      });
    } catch (err) {
      console.error('❌ BREVO ERROR:', err);
    }

    return res.status(201).json({
      success: true,
      message: 'Contact submitted successfully',
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
