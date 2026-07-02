const { BrevoClient } = require('@getbrevo/brevo');

const brevoApiKey = process.env.BREVO_API_KEY;
const contactEmail = (process.env.CONTACT_EMAIL || 'anovatechnologies5@gmail.com').trim();
const senderEmail = (process.env.BREVO_SENDER_EMAIL || process.env.SENDER_EMAIL || process.env.SMTP_USER || 'no-reply@anova.com').trim();
const timeoutInSeconds = Number(process.env.BREVO_TIMEOUT_SECONDS || 30);

console.log({
  BREVO_API_KEY_EXISTS: !!brevoApiKey,
  CONTACT_EMAIL: contactEmail,
  SENDER_EMAIL: senderEmail,
  BREVO_TIMEOUT_SECONDS: timeoutInSeconds,
});

const brevo = brevoApiKey
  ? new BrevoClient({ apiKey: brevoApiKey, timeoutInSeconds })
  : null;

if (!brevo) {
  console.warn('BREVO_API_KEY is not configured; Brevo email sending is disabled');
}

function normalizeText(html) {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function sendEmail(to, subject, html, replyTo = null) {
  console.log('📧 sendEmail() called');
  console.log({
    to,
    subject,
    senderEmail,
  });

  if (!brevo) {
    throw new Error('Brevo client is not configured. Set BREVO_API_KEY to enable email delivery.');
  }

  const payload = {
    sender: {
      name: 'Anova Technologies',
      email: senderEmail,
    },
    to: [{ email: String(to).trim() }],
    subject,
    htmlContent: html,
    textContent: normalizeText(html),
  };

  if (replyTo) {
    payload.replyTo = typeof replyTo === 'string'
      ? { email: replyTo }
      : replyTo;
  }

  console.log('📤 Brevo payload:');
  console.log(JSON.stringify(payload, null, 2));

  try {
    const response = await brevo.transactionalEmails.sendTransacEmail(payload);
    console.log('✅ Brevo API success:');
    console.log(response);
    return response;
  } catch (error) {
    console.error('❌ BREVO API FAILED:');
    console.error(error);
    console.error(error.response?.body);
    throw error;
  }
}

module.exports = { sendEmail, contactEmail };
