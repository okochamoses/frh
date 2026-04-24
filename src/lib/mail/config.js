export const MAIL_CONFIG = {
  host: "smtp.hostinger.com",
  port: 465,
  secure: true,
  user: process.env.SMTP_USER,
  pass: process.env.SMTP_PASS,
  fromName: "Mariam at FRH",
  ownerEmail: process.env.SMTP_USER,
};

export const EMAIL_TEMPLATES = {
  WELCOME: "welcome",
  BOOKING_CONFIRMATION: "bookingConfirmation",
  OWNER_NOTIFICATION: "ownerNotification",
  PASSWORD_RESET: "passwordReset",
  NOTIFICATION: "notification",
};