const brevo = require('@getbrevo/brevo');

const brevoApiKey = process.env.BREVO_API_KEY;
const contactEmail = (process.env.CONTACT_EMAIL || 'anovatechnologies5@gmail.com').trim();
const senderEmail = (
  process.env.BREVO_SENDER_EMAIL ||
  process.env.SENDER_EMAIL ||
  process.env.SMTP_USER ||
  'no-reply@anova.com'
).trim();

console.log({
  BREVO_API_KEY_EXISTS: !!brevoApiKey,
  CONTACT_EMAIL: contactEmail,
  SENDER_EMAIL: senderEmail,
});

let apiInstance = null;

if (brevoApiKey) {
  try {
    apiInstance = new brevo.TransactionalEmailsApi();

    apiInstance.setApiKey(
      brevo.TransactionalEmailsApiApiKeys.apiKey,
      brevoApiKey
    );

    console.log('✅ Brevo API initialized');
  } catch (err) {
    console.error('❌ Brevo initialization failed:', err);
  }
} else {
  console.warn('⚠️ BREVO_API_KEY not configured');
}

function normalizeText(html) {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function sendEmail(to, subject, html, replyTo = null) {
  console.log('📧 sendEmail() called');

  if (!apiInstance) {
    throw new Error('Brevo API not initialized');
  }

  const recipients = Array.isArray(to)
    ? to.map(email => ({ email: String(email).trim() }))
    : [{ email: String(to).trim() }];

  const payload = {
    sender: {
      name: 'Anova Technologies',
      email: senderEmail,
    },

    to: recipients,

    subject: subject,

    htmlContent: html,

    textContent: normalizeText(html),
  };

  if (replyTo) {
    payload.replyTo =
      typeof replyTo === 'string'
        ? { email: replyTo.trim() }
        : replyTo;
  }

  console.log('📤 Brevo payload:');
  console.log(JSON.stringify(payload, null, 2));

  try {
    const response = await apiInstance.sendTransacEmail(payload);

    console.log('✅ Brevo API success:');
    console.log(response);

    return response;
  } catch (error) {
    console.error('❌ Brevo API failed');
    console.error(error);

    if (error.response) {
      console.error(error.response.text || error.response.body);
    }

    throw error;
  }
}

module.exports = {
  sendEmail,
  contactEmail,
};