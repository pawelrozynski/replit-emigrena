import sgMail from '@sendgrid/mail';
import { randomBytes } from 'crypto';

if (!process.env.SENDGRID_API_KEY) {
  throw new Error('SENDGRID_API_KEY is required for email functionality');
}

// Ustawiamy API key dokładnie jak w dokumentacji SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const emailService = {
  generateVerificationToken: () => {
    return randomBytes(32).toString('hex');
  },

  sendVerificationEmail: async (to: string, token: string) => {
    const verificationUrl = `${process.env.APP_URL || 'http://localhost:5000'}/verify-email?token=${token}`;

    // Format wiadomości dokładnie jak w przykładzie SendGrid
    const msg = {
      to,
      from: 'test@example.com', // Change to your verified sender
      subject: 'Zweryfikuj swój adres email - eMigrena',
      text: 'Witaj w eMigrena!\n\nDziękujemy za rejestrację. Aby aktywować swoje konto, kliknij w poniższy link:\n' + verificationUrl,
      html: '<strong>and easy to do anywhere, even with Node.js</strong>', // Dokładnie jak w przykładzie SendGrid
    };

    try {
      await sgMail.send(msg);
      console.log('Email sent successfully');
    } catch (error: any) {
      console.error('Error sending verification email:', error);
      if (error.response) {
        console.error('SendGrid error details:', error.response.body);
      }
      throw new Error('Nie udało się wysłać emaila weryfikacyjnego');
    }
  }
};