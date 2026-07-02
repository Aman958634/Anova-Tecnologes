const asyncHandler = require('../utils/asyncHandler');
const { pool } = require('../config/db');
const { deleteById, countRows } = require('../models/baseModel');
const { sendEmail, contactEmail } = require('../config/smtp');

const createContact = asyncHandler(async (req, res) => {
  const { name, email, phone, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({
      success: false,
      message: 'Name, email, subject, and message are required.',
    });
  }

  try {
    // Save contact to database
    const [result] = await pool.query(
      'INSERT INTO contacts (name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?)',
      [name, email, phone || null, subject, message]
    );

    console.log('🔥 CONTACT API HIT');
    console.log(req.body);

    const contact = {
      id: result.insertId,
      name,
      email,
      phone: phone || null,
      subject,
      message,
    };

    console.log('✅ Contact saved to DB');
    console.log(contact);

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
    console.log('✅ Response sent to client');

    setImmediate(() => {
      console.log('📧 Starting Brevo email send...');
      console.log('Admin email:', contactEmail);

      sendEmail(
        contactEmail,
        `New contact received: ${subject}`,
        html,
        email
      )
        .then((response) => {
          console.log('✅ Brevo response:');
          console.log(JSON.stringify(response, null, 2));
        })
        .catch((emailError) => {
          console.error('❌ BREVO ERROR:');
          console.error(emailError);
          console.error(emailError?.response?.body || emailError?.response || emailError);
        });
    });

    return;

  } catch (err) {
    console.error('❌ Failed to save contact:', err);

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