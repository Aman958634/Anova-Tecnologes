const nodemailer = require('nodemailer');

const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const host = process.env.SMTP_HOST || 'smtp-relay.brevo.com';
const port = Number(process.env.SMTP_PORT) || 587;
const secure = false;

console.log({
  SMTP_HOST: host,
  SMTP_PORT: port,
  SMTP_USER: smtpUser,
  SMTP_PASS_EXISTS: !!smtpPass
});

let transporter = null;

if (smtpUser && smtpPass) {
  transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    requireTLS: true,
    auth: {
      user: smtpUser,
      pass: smtpPass
    },
    tls: {
      rejectUnauthorized: false
    },
    connectionTimeout: 30000,
    greetingTimeout: 30000,
    socketTimeout: 30000
  });

  transporter.verify((error, success) => {
    if (error) {
      console.error('SMTP verify failed:', error);
    } else {
      console.log('✅ Brevo SMTP connected');
    }
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
    console.error('sendMail failed (attempt):', err);
    if (retry > 0) {
      setTimeout(() => {
        transporter.sendMail(mailOptions).then((info2) => {
          console.log('Email sent (retry):', info2 && info2.response ? info2.response : info2);
        }).catch((err2) => {
          console.error('sendMail failed (retry):', err2);
        });
      }, retryDelay);
    }
    return null;
  }
}

module.exports = { transporter, sendMail };
