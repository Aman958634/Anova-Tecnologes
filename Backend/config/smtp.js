const nodemailer = require('nodemailer');

const contactEmail = (process.env.CONTACT_EMAIL || 'anovatechnologies5@gmail.com').trim();
const senderEmail = (
  process.env.BREVO_SENDER_EMAIL ||
  process.env.SENDER_EMAIL ||
  process.env.SMTP_USER ||
  'no-reply@anova.com'
).trim();
const smtpHost = (process.env.SMTP_HOST || 'smtp-relay.brevo.com').trim();
const smtpPort = Number(process.env.SMTP_PORT || 587);
const smtpUser = (process.env.SMTP_USER || '').trim();
const smtpPass = (process.env.SMTP_PASS || '').trim();

console.log('SMTP config loaded:', {
  contactEmail,
  senderEmail,
  smtpHost,
  smtpPort,
  smtpUserConfigured: !!smtpUser,
  smtpPassConfigured: !!smtpPass,
});

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: false,
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
});

async function sendEmail(to, subject, html, replyTo = null) {
  console.log('📧 sendEmail() called');
  console.log({
    to,
    subject,
    senderEmail,
    replyTo,
  });

  const recipients = Array.isArray(to)
    ? to.map(email => String(email).trim())
    : [String(to).trim()];

  const mailOptions = {
    from: `Anova Technologies <${senderEmail}>`,
    to: recipients,
    subject,
    html,
    text: html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
  };

  if (replyTo) {
    mailOptions.replyTo = String(replyTo).trim();
  }

  console.log('📤 email payload:');
  console.log(JSON.stringify(mailOptions, null, 2));

  try {
    const response = await transporter.sendMail(mailOptions);
    console.log('✅ SMTP success response:');
    console.log(response);
    return response;
  } catch (error) {
    console.error('❌ SMTP error response:');
    console.error(error);
    console.error(error.response || error);
    throw error;
  }
}

module.exports = {
  sendEmail,
  contactEmail,
};