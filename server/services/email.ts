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
    // Używamy nagłówka Host z żądania, aby uzyskać właściwy adres
    const verificationUrl = `${process.env.NODE_ENV === 'production' 
      ? `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co` 
      : 'http://localhost:5000'}/verify-email?token=${token}`;

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