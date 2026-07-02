const asyncHandler = require('../utils/asyncHandler');
const { pool } = require('../config/db');
const { deleteById, countRows } = require('../models/baseModel');
const nodemailer = require('nodemailer');

const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;

let mailTransporter = null;
if (smtpUser && smtpPass) {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT) || 587;
  const secure = port === 465; // true for 465, false for 587
  mailTransporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user: smtpUser,
      pass: smtpPass
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
    tls: { rejectUnauthorized: false }
  });

  // Verify transporter connectivity in background
  mailTransporter.verify().then(() => {
    console.log('SMTP transporter verified');
  }).catch((err) => {
    console.warn('SMTP transporter verification failed:', err && err.message ? err.message : err);
  });
}

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

    if (mailTransporter) {
      const mailOptions = {
        from: `Anova Technologies <${smtpUser}>`,
        to: smtpUser,
        replyTo: email,
        subject: `New Contact Message: ${subject}`,
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
            <h2 style="color: #1d4ed8; margin-bottom: 16px;">New contact message</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message:</strong></p>
            <p style="white-space: pre-wrap;">${message}</p>
          </div>
        `
      };

      // Fire-and-forget send to avoid blocking the API response. Retry once on failure.
      mailTransporter.sendMail(mailOptions).then((info) => {
        console.log('Contact email sent:', info && info.response ? info.response : info);
      }).catch((err) => {
        console.error('Contact email failed (1st):', err && err.message ? err.message : err);
        setTimeout(() => {
          mailTransporter.sendMail(mailOptions).then((info2) => {
            console.log('Contact email sent (retry):', info2 && info2.response ? info2.response : info2);
          }).catch((err2) => {
            console.error('Contact email failed (retry):', err2 && err2.message ? err2.message : err2);
          });
        }, 2000);
      });
    } else {
      console.warn('SMTP not configured — skipping email send');
    }

    return res.status(201).json({
      success: true,
      data: contact,
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
