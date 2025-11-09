export const MAIL_CONFIG = {
  API_URL: "https://api.mailersend.com/v1",
  FROM_EMAIL: process.env.MAILERSEND_FROM_EMAIL || "noreply@yourdomain.com",
  FROM_NAME: process.env.MAILERSEND_FROM_NAME || "Your App Name",
  API_KEY: process.env.MAILERSEND_API_KEY,
};

// Email template types
export const EMAIL_TEMPLATES = {
  WELCOME: "welcome",
  PASSWORD_RESET: "password_reset",
  EMAIL_VERIFICATION: "email_verification",
  ORDER_CONFIRMATION: "order_confirmation",
  NOTIFICATION: "notification",
};