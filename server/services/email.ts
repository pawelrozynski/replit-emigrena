import sgMail from '@sendgrid/mail';
import { randomBytes } from 'crypto';

if (!process.env.SENDGRID_API_KEY) {
  throw new Error('SENDGRID_API_KEY is required for email functionality');
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const emailService = {
  generateVerificationToken: () => {
    return randomBytes(32).toString('hex');
  },

  sendVerificationEmail: async (to: string, token: string) => {
    const verificationUrl = `${process.env.APP_URL || 'http://localhost:5000'}/verify-email?token=${token}`;

    const msg = {
      to,
      from: 'test@example.com', // Zgodnie z dokumentacją SendGrid, używamy przykładowego adresu
      subject: 'Zweryfikuj swój adres email - eMigrena',
      text: `Witaj w eMigrena!\n\nDziękujemy za rejestrację. Aby aktywować swoje konto, kliknij w poniższy link:\n${verificationUrl}\n\nLink jest ważny przez 24 godziny.\n\nJeśli nie rejestrowałeś się w aplikacji eMigrena, zignoruj tę wiadomość.`,
      html: `<strong>and easy to do anywhere, even with Node.js</strong>`, //Simplified HTML from edited code
    };

    try {
      await sgMail.send(msg);
      console.log('Verification email sent successfully');
    } catch (error: any) {
      console.error('Error sending verification email:', error);
      if (error.response) {
        console.error('SendGrid error details:', error.response.body);
      }
      throw new Error('Nie udało się wysłać emaila weryfikacyjnego');
    }
  }
};