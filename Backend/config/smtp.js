const dns = require('dns');
// Prefer IPv4 to avoid IPv6 connectivity issues on some hosts/platforms
if (typeof dns.setDefaultResultOrder === 'function') {
  try {
    dns.setDefaultResultOrder('ipv4first');
    console.log('DNS result order set to ipv4first');
  } catch (e) {
    console.warn('Failed to set DNS result order:', e && e.message ? e.message : e);
  }
}

const nodemailer = require('nodemailer');

const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const host = process.env.SMTP_HOST || 'smtp.gmail.com';
const port = Number(process.env.SMTP_PORT) || 587;
const secure = port === 465;

let transporter = null;

if (smtpUser && smtpPass) {
  transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user: smtpUser,
      pass: smtpPass
    },
    family: 4, // force IPv4
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
    tls: { rejectUnauthorized: false }
  });

  // Verify transporter connectivity in background and log the result
  transporter.verify().then(() => {
    console.log('SMTP transporter verified');
  }).catch((err) => {
    console.warn('SMTP transporter verification failed:', err && err.message ? err.message : err);
  });
} else {
  console.warn('SMTP credentials not set; email sending disabled');
}

/**
 * sendMail - sends an email via the configured transporter.
 * This function performs a non-blocking send and will optionally retry once on failure.
 * It logs outcomes but does not throw to callers (so it won't block API responses).
 */
async function sendMail(mailOptions, options = {}) {
  const { retry = 1, retryDelay = 2000 } = options;
  if (!transporter) {
    console.warn('sendMail called but transporter is not configured - skipping');
    return null;
  }

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info && info.response ? info.response : info);
    return info;
  } catch (err) {
    console.error('sendMail failed (attempt):', err && err.message ? err.message : err);
    if (retry > 0) {
      setTimeout(() => {
        transporter.sendMail(mailOptions).then((info2) => {
          console.log('Email sent (retry):', info2 && info2.response ? info2.response : info2);
        }).catch((err2) => {
          console.error('sendMail failed (retry):', err2 && err2.message ? err2.message : err2);
        });
      }, retryDelay);
    }
    return null;
  }
}

module.exports = { transporter, sendMail };
