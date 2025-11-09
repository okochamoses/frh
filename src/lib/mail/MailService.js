import axios from "axios";
import { MAIL_CONFIG, EMAIL_TEMPLATES } from "./config";
import { templates } from "./templates";

class MailService {
  constructor() {
    if (!MAIL_CONFIG.API_KEY) {
      console.warn("MailerSend API key is not configured");
    }

    this.client = axios.create({
      baseURL: MAIL_CONFIG.API_URL,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${MAIL_CONFIG.API_KEY}`,
      },
    });
  }

  /**
   * Send a raw email
   * @param {Object} options - Email options
   * @param {string} options.to - Recipient email
   * @param {string} options.toName - Recipient name
   * @param {string} options.subject - Email subject
   * @param {string} options.html - HTML content
   * @param {string} options.text - Plain text content
   * @param {string} options.from - Sender email (optional)
   * @param {string} options.fromName - Sender name (optional)
   * @param {Array} options.attachments - File attachments (optional)
   * @param {Array} options.cc - CC recipients (optional)
   * @param {Array} options.bcc - BCC recipients (optional)
   * @param {string} options.replyTo - Reply-to email (optional)
   */
  async sendEmail({
    to,
    toName,
    subject,
    html,
    text,
    from = MAIL_CONFIG.FROM_EMAIL,
    fromName = MAIL_CONFIG.FROM_NAME,
    attachments = [],
    cc = [],
    bcc = [],
    replyTo = null,
  }) {
    try {
      const payload = {
        from: {
          email: from,
          name: fromName,
        },
        to: [
          {
            email: to,
            name: toName,
          },
        ],
        subject,
        html,
        text,
      };

      // Add optional fields
      if (cc.length > 0) payload.cc = cc;
      if (bcc.length > 0) payload.bcc = bcc;
      if (replyTo) payload.reply_to = { email: replyTo };
      if (attachments.length > 0) payload.attachments = attachments;

      const response = await this.client.post("/email", payload);

      return {
        success: true,
        messageId: response.data.message_id,
        data: response.data,
      };
    } catch (error) {
      console.error("Failed to send email:", error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail({ to, toName, firstName, verificationLink }) {
    const { subject, html, text } = templates.welcome({ firstName, verificationLink });

    return this.sendEmail({
      to,
      toName,
      subject,
      html,
      text,
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail({ to, toName, firstName, resetLink, expiresIn }) {
    const { subject, html, text } = templates.passwordReset({
      firstName,
      resetLink,
      expiresIn,
    });

    return this.sendEmail({
      to,
      toName,
      subject,
      html,
      text,
    });
  }

  /**
   * Send email verification
   */
  async sendVerificationEmail({ to, toName, firstName, verificationCode, verificationLink }) {
    const { subject, html, text } = templates.emailVerification({
      firstName,
      verificationCode,
      verificationLink,
    });

    return this.sendEmail({
      to,
      toName,
      subject,
      html,
      text,
    });
  }

  /**
   * Send order confirmation
   */
  async sendOrderConfirmation({
    to,
    toName,
    firstName,
    orderId,
    orderTotal,
    orderItems,
    trackingLink,
  }) {
    const { subject, html, text } = templates.orderConfirmation({
      firstName,
      orderId,
      orderTotal,
      orderItems,
      trackingLink,
    });

    return this.sendEmail({
      to,
      toName,
      subject,
      html,
      text,
    });
  }

  /**
   * Send generic notification
   */
  async sendNotification({ to, toName, firstName, title, message, actionLink, actionText }) {
    const { subject, html, text } = templates.notification({
      firstName,
      title,
      message,
      actionLink,
      actionText,
    });

    return this.sendEmail({
      to,
      toName,
      subject,
      html,
      text,
    });
  }

  /**
   * Send bulk emails
   */
  async sendBulkEmails(emails) {
    try {
      const payload = {
        from: {
          email: MAIL_CONFIG.FROM_EMAIL,
          name: MAIL_CONFIG.FROM_NAME,
        },
        to: emails.map((email) => ({
          email: email.to,
          name: email.toName,
        })),
        subject: emails[0].subject, // All must have same subject for bulk
        html: emails[0].html,
        text: emails[0].text,
      };

      const response = await this.client.post("/bulk-email", payload);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Failed to send bulk emails:", error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  }

  /**
   * Get email sending activity
   */
  async getActivity({ page = 1, limit = 25 }) {
    try {
      const response = await this.client.get("/activity", {
        params: { page, limit },
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Failed to get activity:", error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  }
}

// Export singleton instance
export default new MailService();