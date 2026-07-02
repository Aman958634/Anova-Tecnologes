const Brevo = require('@getbrevo/brevo');

const brevoApiKey = process.env.BREVO_API_KEY;
const contactEmail = process.env.CONTACT_EMAIL || 'anovatechnologies5@gmail.com';
const senderEmail = process.env.BREVO_SENDER_EMAIL || process.env.SMTP_USER || 'no-reply@anova.com';

console.log({
  BREVO_API_KEY_EXISTS: !!brevoApiKey,
  CONTACT_EMAIL: contactEmail,
  SENDER_EMAIL: senderEmail
});

let brevoClient = null;

if (brevoApiKey) {
  brevoClient = new Brevo.TransactionalEmailsApi();
  brevoClient.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, brevoApiKey);
} else {
  console.warn('BREVO_API_KEY is not configured; Brevo email sending disabled');
}

async function sendContactEmail({ name, email, phone, subject, message }) {
  if (!brevoClient) {
    const error = new Error('Brevo client is not configured');
    console.error('sendContactEmail failed:', error);
    throw error;
  }

  const emailPayload = {
    sender: {
      name: 'Anova Technologies',
      email: senderEmail
    },
    to: [
      {
        email: contactEmail,
        name: 'Anova Technologies'
      }
    ],
    replyTo: {
      email,
      name: name || email
    },
    subject: `New Contact Message: ${subject}`,
    htmlContent: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
        <h2 style="color: #1d4ed8; margin-bottom: 16px;">New contact message</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p style="white-space: pre-wrap;">${message}</p>
      </div>
    `,
    textContent: `New contact message\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone || 'N/A'}\nSubject: ${subject}\nMessage: ${message}`
  };

  try {
    console.log('Sending Brevo contact email...');
    const response = await brevoClient.sendTransacEmail(emailPayload);
    console.log('Brevo contact email sent successfully:', response);
    return response;
  } catch (error) {
    console.error('Brevo sendContactEmail failed:');
    console.error(error);
    throw error;
  }
}

module.exports = { sendContactEmail };
