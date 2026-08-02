const asyncHandler = require('../utils/asyncHandler');
const { pool } = require('../config/db');
const { deleteById, countRows } = require('../models/baseModel');
const { sendEmail, contactEmail } = require('../config/smtp');
const logger = require('../utils/logger');

const createContact = asyncHandler(async (req, res) => {
  const name = String(req.body?.name || '').trim();
  const email = String(req.body?.email || '').trim();
  const phone = String(req.body?.phone || '').trim();
  const subject = String(req.body?.subject || '').trim();
  const message = String(req.body?.message || '').trim();

  if (!name || !email || !subject || !message) {
    return res.status(400).json({
      success: false,
      message: 'Name, email, subject, and message are required.',
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid email address.',
    });
  }

  if (name.length > 120 || email.length > 190 || subject.length > 180 || message.length > 4000 || phone.length > 40) {
    return res.status(400).json({
      success: false,
      message: 'One or more fields exceed allowed length.',
    });
  }

  try {
    // Save contact to database
    const [result] = await pool.query(
      'INSERT INTO contacts (name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?)',
      [name, email, phone || null, subject, message]
    );

    const contact = {
      id: result.insertId,
      name,
      email,
      phone: phone || null,
      subject,
      message,
    };

    // Email template
    const html = `
      <div style="font-family: Arial, sans-serif; line-height:1.6; color:#0f172a;">
        <h2 style="color:#1d4ed8;">New Contact Message</h2>

        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
        <p><strong>Subject:</strong> ${subject}</p>

        <p><strong>Message:</strong></p>
        <p style="white-space:pre-wrap;">
          ${message}
        </p>
      </div>
    `;

    // Send response immediately, then dispatch email asynchronously.
    const responsePayload = {
      success: true,
      message: 'Contact submitted successfully',
    };

    res.status(201).json(responsePayload);

    setImmediate(() => {
      sendEmail(
        contactEmail,
        `New contact received: ${subject}`,
        html,
        email
      )
        .then(() => {
          logger.info('contact_notification_email_sent', { contactId: contact.id });
        })
        .catch((emailError) => {
          logger.error('contact_notification_email_failed', {
            contactId: contact.id,
            message: emailError?.message || 'Email provider error',
          });
        });
    });

    return;

  } catch (err) {
    logger.error('contact_create_failed', { message: err.message });

    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to submit contact',
    });
  }
});

const listContacts = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 12, 1), 100);
  const offset = (page - 1) * limit;

  const [rows] = await pool.query(
    'SELECT * FROM contacts ORDER BY id DESC LIMIT ? OFFSET ?',
    [limit, offset]
  );

  const total = await countRows('contacts');

  res.json({
    data: rows,
    meta: {
      page,
      limit,
      total,
    },
  });
});

const deleteContact = asyncHandler(async (req, res) => {
  const deleted = await deleteById('contacts', req.params.id);

  if (!deleted) {
    return res.status(404).json({
      message: 'Contact not found.',
    });
  }

  res.json({
    message: 'Contact deleted successfully.',
  });
});

module.exports = {
  createContact,
  listContacts,
  deleteContact,
};