const nodemailer = require('nodemailer');

const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const host = process.env.SMTP_HOST || 'smtp-relay.brevo.com';
const port = Number(process.env.SMTP_PORT) || 587;
const secure = false;
const contactEmail = process.env.CONTACT_EMAIL || process.env.SMTP_USER;

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

  (async () => {
    try {
      console.log('Testing SMTP connection...');
      await transporter.verify();
      console.log('Brevo SMTP connected successfully');

      if (!contactEmail) {
        console.warn('CONTACT_EMAIL is not configured; skipping SMTP test email send');
        return;
      }

      const testMailOptions = {
        from: `Anova Technologies <${smtpUser}>`,
        to: contactEmail,
        subject: 'Brevo SMTP Diagnostic Test',
        text: 'This is a test message to verify Brevo SMTP connectivity from Railway deployment.',
        html: '<p>This is a test message to verify <strong>Brevo SMTP</strong> connectivity from Railway deployment.</p>'
      };

      await transporter.sendMail(testMailOptions);
      console.log('Test email sent');
    } catch (error) {
      console.error('SMTP diagnostic test failed:');
      console.error(error && error.stack ? error.stack : error);
    }
  })();
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
    console.error('sendMail failed (attempt):', err && err.stack ? err.stack : err);
    if (retry > 0) {
      setTimeout(() => {
        transporter.sendMail(mailOptions).then((info2) => {
          console.log('Email sent (retry):', info2 && info2.response ? info2.response : info2);
        }).catch((err2) => {
          console.error('sendMail failed (retry):', err2 && err2.stack ? err2.stack : err2);
        });
      }, retryDelay);
    }
    return null;
  }
}

module.exports = { transporter, sendMail };
