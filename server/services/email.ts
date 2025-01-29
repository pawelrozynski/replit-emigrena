import sgMail from '@sendgrid/mail';
import { randomBytes } from 'crypto';

if (!process.env.SENDGRID_API_KEY) {
  console.error('SENDGRID_API_KEY is not set');
  throw new Error('SENDGRID_API_KEY is required for email functionality');
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const emailService = {
  generateVerificationToken: () => {
    return randomBytes(32).toString('hex');
  },

  sendVerificationEmail: async (to: string, token: string) => {
    const baseUrl = 'https://e-migrena-tech-pawel34.replit.app';
    const verificationUrl = `${baseUrl}/verify-email?token=${token}`;

    const msg = {
      to,
      from: 'pawel@rozynscy.com',
      subject: 'Zweryfikuj swój adres email - eMigrena',
      text: `Witaj w eMigrena!\n\nDziękujemy za rejestrację. Aby aktywować swoje konto, kliknij w poniższy link:\n${verificationUrl}\n\nPozdrawiamy,\nZespół eMigrena`,
      html: `
        <h1>Witaj w eMigrena!</h1>
        <p>Dziękujemy za rejestrację w naszej aplikacji.</p>
        <p>Aby aktywować swoje konto, kliknij w poniższy link:</p>
        <p><a href="${verificationUrl}">Zweryfikuj swój adres email</a></p>
        <p>Link weryfikacyjny wygaśnie po 24 godzinach.</p>
        <br>
        <p>Pozdrawiamy,<br>Zespół eMigrena</p>
      `,
    };

    try {
      await sgMail.send(msg);
      console.log('Verification email sent successfully to:', to);
      console.log('Using verification URL:', verificationUrl);
      return true;
    } catch (error: any) {
      console.error('SendGrid error details:', error?.response?.body || error);
      if (error.response?.body) {
        const errors = error.response.body.errors;
        if (errors && errors.length > 0) {
          throw new Error(`Błąd wysyłania emaila: ${errors[0].message}`);
        }
      }
      throw new Error('Nie udało się wysłać emaila weryfikacyjnego. Spróbuj ponownie później.');
    }
  }
};