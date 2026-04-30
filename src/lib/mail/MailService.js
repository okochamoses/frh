import nodemailer from "nodemailer";
import { MAIL_CONFIG } from "./config";
import { templates } from "./templates";

function createTransporter() {
  return nodemailer.createTransport({
    host: MAIL_CONFIG.host,
    port: MAIL_CONFIG.port,
    secure: MAIL_CONFIG.secure,
    auth: {
      user: MAIL_CONFIG.user,
      pass: MAIL_CONFIG.pass,
    },
  });
}

const from = () => `"${MAIL_CONFIG.fromName}" <${MAIL_CONFIG.user}>`;

class MailService {
  async sendEmail({ to, subject, html }) {
    const transporter = createTransporter();
    return transporter.sendMail({ from: from(), to, subject, html });
  }

  async sendWelcomeEmail({ to, firstName }) {
    const { subject, html } = templates.welcome({ firstName });
    return this.sendEmail({ to, subject, html });
  }

  async sendBookingConfirmation({ to, booking }) {
    const { subject, html } = templates.bookingConfirmation(booking);
    return this.sendEmail({ to, subject, html });
  }

  async sendOwnerNotification(booking) {
    const { subject, html } = templates.ownerNotification(booking);
    return this.sendEmail({ to: MAIL_CONFIG.ownerEmail, subject, html });
  }

  async sendPasswordResetEmail({ to, firstName, resetLink, expiresIn }) {
    const { subject, html } = templates.passwordReset({ firstName, resetLink, expiresIn });
    return this.sendEmail({ to, subject, html });
  }

  async sendNewsletterWelcome({ to, firstName }) {
    const { subject, html } = templates.newsletterWelcome({ firstName });
    return this.sendEmail({ to, subject, html });
  }

  async sendNotification({ to, firstName, title, message, actionLink, actionText }) {
    const { subject, html } = templates.notification({ firstName, title, message, actionLink, actionText });
    return this.sendEmail({ to, subject, html });
  }

  async sendAppointmentReminder({ to, booking }) {
    const { subject, html } = templates.appointmentReminder(booking);
    return this.sendEmail({ to, subject, html });
  }

  async sendServiceComplete({ to, booking }) {
    const { subject, html } = templates.serviceComplete(booking);
    return this.sendEmail({ to, subject, html });
  }

  async sendServiceCompleteWithReview({ to, booking }) {
    const { subject, html } = templates.serviceCompleteWithReview(booking);
    return this.sendEmail({ to, subject, html });
  }
}

export default new MailService();