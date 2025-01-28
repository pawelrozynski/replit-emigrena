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
      from: 'no-reply@emigrena.app',
      subject: 'Zweryfikuj swój adres email - eMigrena',
      html: `
        <div>
          <h1>Witaj w eMigrena!</h1>
          <p>Dziękujemy za rejestrację. Aby aktywować swoje konto, kliknij w poniższy link:</p>
          <p><a href="${verificationUrl}">Zweryfikuj adres email</a></p>
          <p>Link jest ważny przez 24 godziny.</p>
          <p>Jeśli nie rejestrowałeś się w aplikacji eMigrena, zignoruj tę wiadomość.</p>
        </div>
      `,
    };

    try {
      await sgMail.send(msg);
    } catch (error) {
      console.error('Error sending verification email:', error);
      throw new Error('Nie udało się wysłać emaila weryfikacyjnego');
    }
  }
};
