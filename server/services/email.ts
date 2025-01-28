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
      from: 'no-reply@emigrena.app', // Domyślny adres, który będzie używany po konfiguracji DNS
      subject: 'Zweryfikuj swój adres email - eMigrena',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Witaj w eMigrena!</h1>
          <p>Dziękujemy za rejestrację. Aby aktywować swoje konto, kliknij w poniższy link:</p>
          <p>
            <a 
              href="${verificationUrl}" 
              style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;"
            >
              Zweryfikuj adres email
            </a>
          </p>
          <p style="color: #666; font-size: 14px;">Link jest ważny przez 24 godziny.</p>
          <p style="color: #666; font-size: 14px;">Jeśli nie rejestrowałeś się w aplikacji eMigrena, zignoruj tę wiadomość.</p>
        </div>
      `,
      text: `
        Witaj w eMigrena!

        Dziękujemy za rejestrację. Aby aktywować swoje konto, kliknij w poniższy link:
        ${verificationUrl}

        Link jest ważny przez 24 godziny.

        Jeśli nie rejestrowałeś się w aplikacji eMigrena, zignoruj tę wiadomość.
      `,
    };

    try {
      await sgMail.send(msg);
    } catch (error: any) {
      console.error('Error sending verification email:', error);
      if (error.response) {
        console.error('SendGrid error details:', error.response.body);
      }
      throw new Error('Nie udało się wysłać emaila weryfikacyjnego');
    }
  }
};