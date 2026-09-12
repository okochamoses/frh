// Local development (`npm run dev:local`) routes mail to the MailDev catcher on
// :1025 rather than the real mailbox; read what was sent at http://127.0.0.1:1080.
const useLocalSmtp = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "true";

export const MAIL_CONFIG = useLocalSmtp
  ? {
      host: process.env.SMTP_HOST || "127.0.0.1",
      port: Number(process.env.SMTP_PORT || 1025),
      secure: false,
      // MailDev takes anonymous senders; credentials would make it reject us.
      user: null,
      pass: null,
      fromName: "Mariam at FRH (local)",
      fromAddress: "mariam@flourish.local",
      ownerEmail: process.env.SMTP_USER || "owner@flourish.local",
    }
  : {
      host: "smtp.hostinger.com",
      port: 587,
      secure: false,
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
      fromName: "Mariam at FRH",
      fromAddress: process.env.SMTP_USER,
      ownerEmail: process.env.SMTP_USER,
    };

export const EMAIL_TEMPLATES = {
  WELCOME: "welcome",
  BOOKING_CONFIRMATION: "bookingConfirmation",
  OWNER_NOTIFICATION: "ownerNotification",
  PASSWORD_RESET: "passwordReset",
  NOTIFICATION: "notification",
};