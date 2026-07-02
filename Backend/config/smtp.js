const nodemailer = require('nodemailer');

const contactEmail = (process.env.CONTACT_EMAIL || 'anovatechnologies5@gmail.com').trim();
const senderEmail = (
  process.env.BREVO_SENDER_EMAIL ||
  process.env.SENDER_EMAIL ||
  process.env.SMTP_USER ||
  'no-reply@anova.com'
).trim();
const smtpHost = (process.env.SMTP_HOST || 'smtp-relay.brevo.com').trim();
const primarySmtpPort = Number(process.env.SMTP_PORT || 587);
const smtpUser = (process.env.SMTP_USER || '').trim();
const smtpPass = (process.env.SMTP_PASS || '').trim();

const fallbackPorts = [];
if (!process.env.SMTP_PORT && primarySmtpPort !== 2525) {
  fallbackPorts.push(2525);
}

console.log('SMTP config loaded:', {
  contactEmail,
  senderEmail,
  smtpHost,
  smtpPort: primarySmtpPort,
  smtpUserConfigured: !!smtpUser,
  smtpPassConfigured: !!smtpPass,
  fallbackPorts,
});

function createTransport(port) {
  return nodemailer.createTransport({
    host: smtpHost,
    port,
    secure: false,
    requireTLS: true,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 30000,
    logger: true,
    debug: true,
    tls: {
      rejectUnauthorized: false,
    },
  });
}

const transports = [{ port: primarySmtpPort, transporter: createTransport(primarySmtpPort) }]
  .concat(fallbackPorts.map((port) => ({ port, transporter: createTransport(port) })));

transports.forEach(({ port, transporter }) => {
  transporter.verify((err, success) => {
    if (err) {
      console.error(`❌ SMTP transporter verification failed on port ${port}:`);
      console.error(err);
      return;
    }
    console.log(`✅ SMTP transporter verified on port ${port}:`, success);
  });
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
    ? to.map((email) => String(email).trim())
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

  let lastError;
  for (const { port, transporter } of transports) {
    try {
      console.log(`📡 Attempting SMTP send on port ${port}...`);
      const response = await transporter.sendMail(mailOptions);
      console.log(`✅ SMTP success response on port ${port}:`);
      console.log(response);
      return response;
    } catch (error) {
      console.error(`❌ SMTP error on port ${port}:`);
      console.error(error);
      console.error(error.response || error);
      lastError = error;
      if (fallbackPorts.length === 0) break;
      console.log(`🔁 Trying next SMTP port after failure on port ${port}`);
    }
  }

  throw lastError;
}

module.exports = {
  sendEmail,
  contactEmail,
};