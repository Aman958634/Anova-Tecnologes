const contactEmail = (process.env.CONTACT_EMAIL || 'anovatechnologies5@gmail.com').trim();
const senderEmail = (
  process.env.BREVO_SENDER_EMAIL ||
  process.env.SENDER_EMAIL ||
  process.env.SMTP_USER ||
  'no-reply@anova.com'
).trim();
const brevoApiKey = (process.env.BREVO_API_KEY || '').trim();
const brevoEndpoint = 'https://api.brevo.com/v3/smtp/email';

console.log('Email config loaded:', {
  contactEmail,
  senderEmail,
  brevoApiKeyConfigured: !!brevoApiKey,
  brevoEndpoint,
});

function buildPayload(to, subject, html, replyTo) {
  const recipients = Array.isArray(to)
    ? to.map((email) => ({ email: String(email).trim() }))
    : [{ email: String(to).trim() }];

  const payload = {
    sender: {
      name: 'Anova Technologies',
      email: senderEmail,
    },
    to: recipients,
    subject,
    htmlContent: html,
    textContent: html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
  };

  if (replyTo) {
    payload.replyTo = {
      email: String(replyTo).trim(),
    };
  }

  return payload;
}

async function sendEmail(to, subject, html, replyTo = null) {
  console.log('📧 sendEmail() called');
  console.log({
    to,
    subject,
    senderEmail,
    replyTo,
  });

  if (!brevoApiKey) {
    const error = new Error('BREVO_API_KEY is not configured.');
    console.error('❌ Email send failed:', error);
    throw error;
  }

  const payload = buildPayload(to, subject, html, replyTo);
  console.log('📤 Brevo API payload:');
  console.log(JSON.stringify(payload, null, 2));

  const response = await fetch(brevoEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': brevoApiKey,
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const body = await response.text();
  let parsed;
  try {
    parsed = JSON.parse(body);
  } catch (parseError) {
    parsed = body;
  }

  if (!response.ok) {
    const error = new Error(`Brevo API failed with status ${response.status}`);
    error.status = response.status;
    error.body = parsed;
    console.error('❌ Brevo API error:', error);
    throw error;
  }

  console.log('✅ Brevo API response:');
  console.log(parsed);
  return parsed;
}

module.exports = {
  sendEmail,
  contactEmail,
};