import * as Brevo from '@getbrevo/brevo';

const apiInstance = new Brevo.TransactionalEmailsApi();

// Set up authentication
// The key identifier is typically 0 or 'api-key' for this SDK generator
apiInstance.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY || '');

export async function sendVerificationEmail(email: string, token: string, name: string) {
  const sendSmtpEmail = new Brevo.SendSmtpEmail();
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify?token=${token}`;

  sendSmtpEmail.subject = 'Verify your email for Beyond Realms';
  sendSmtpEmail.htmlContent = `
    <html>
      <body>
        <h1>Hello ${name},</h1>
        <p>Please verify your email address by clicking the link below:</p>
        <a href="${verificationUrl}">${verificationUrl}</a>
        <p>If you didn't create an account, you can safely ignore this email.</p>
      </body>
    </html>
  `;
  sendSmtpEmail.sender = { name: 'Beyond Realms', email: process.env.BREVO_SENDER_EMAIL || 'noreply@beyondrealms.com' };
  sendSmtpEmail.to = [{ email }];

  try {
    await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log(`Verification email sent to ${email}`);
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
}
