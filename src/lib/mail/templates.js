/**
 * Email template builders
 * These functions return the HTML content for different email types
 */

export const templates = {
  welcome: ({ firstName, verificationLink }) => ({
    subject: `Welcome to Our Platform, ${firstName}!`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px;">
            <h1 style="color: #2c3e50; margin-bottom: 20px;">Welcome, ${firstName}! 🎉</h1>
            <p style="font-size: 16px; margin-bottom: 20px;">
              Thank you for joining our flourish roots hair. We're excited to have you on board!
            </p>
            <p style="font-size: 16px; margin-bottom: 30px;">
              To get started, please verify your email address by clicking the button below:
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationLink}" 
                 style="background-color: #3498db; color: white; padding: 14px 28px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                Verify Email Address
              </a>
            </div>
            <p style="font-size: 14px; color: #7f8c8d; margin-top: 30px;">
              If you didn't create an account, please ignore this email.
            </p>
          </div>
        </body>
      </html>
    `,
    text: `Welcome, ${firstName}!\n\nThank you for joining our platform. Please verify your email by visiting: ${verificationLink}`,
  }),

  passwordReset: ({ firstName, resetLink, expiresIn = "1 hour" }) => ({
    subject: "Reset Your Password",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #fff3cd; padding: 30px; border-radius: 10px; border-left: 4px solid #ffc107;">
            <h1 style="color: #856404; margin-bottom: 20px;">Password Reset Request</h1>
            <p style="font-size: 16px; margin-bottom: 20px;">
              Hi ${firstName},
            </p>
            <p style="font-size: 16px; margin-bottom: 20px;">
              We received a request to reset your password. Click the button below to create a new password:
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" 
                 style="background-color: #ffc107; color: #212529; padding: 14px 28px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                Reset Password
              </a>
            </div>
            <p style="font-size: 14px; color: #856404; margin-top: 30px;">
              This link will expire in ${expiresIn}. If you didn't request a password reset, please ignore this email or contact support if you have concerns.
            </p>
          </div>
        </body>
      </html>
    `,
    text: `Hi ${firstName},\n\nWe received a request to reset your password. Visit this link to reset it: ${resetLink}\n\nThis link expires in ${expiresIn}.`,
  }),

  emailVerification: ({ firstName, verificationCode, verificationLink }) => ({
    subject: "Verify Your Email Address",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Verification</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #e7f3ff; padding: 30px; border-radius: 10px; border-left: 4px solid #2196f3;">
            <h1 style="color: #1565c0; margin-bottom: 20px;">Verify Your Email</h1>
            <p style="font-size: 16px; margin-bottom: 20px;">
              Hi ${firstName},
            </p>
            <p style="font-size: 16px; margin-bottom: 20px;">
              Please verify your email address using the code below or click the button:
            </p>
            <div style="background-color: white; padding: 20px; border-radius: 5px; text-align: center; margin: 20px 0;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1565c0;">
                ${verificationCode}
              </span>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationLink}" 
                 style="background-color: #2196f3; color: white; padding: 14px 28px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                Verify Email
              </a>
            </div>
            <p style="font-size: 14px; color: #1565c0; margin-top: 30px;">
              This code will expire in 10 minutes.
            </p>
          </div>
        </body>
      </html>
    `,
    text: `Hi ${firstName},\n\nYour verification code is: ${verificationCode}\n\nOr visit: ${verificationLink}`,
  }),

  orderConfirmation: ({ firstName, orderId, orderTotal, orderItems, trackingLink }) => ({
    subject: `Order Confirmation - #${orderId}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Confirmation</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #d4edda; padding: 30px; border-radius: 10px; border-left: 4px solid #28a745;">
            <h1 style="color: #155724; margin-bottom: 20px;">Order Confirmed! ✓</h1>
            <p style="font-size: 16px; margin-bottom: 20px;">
              Hi ${firstName},
            </p>
            <p style="font-size: 16px; margin-bottom: 20px;">
              Thank you for your order! We've received your payment and are processing your order.
            </p>
            <div style="background-color: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h2 style="color: #155724; margin-top: 0;">Order #${orderId}</h2>
              <p style="margin: 10px 0;"><strong>Total:</strong> ${orderTotal}</p>
              <div style="margin-top: 20px;">
                <h3>Items:</h3>
                ${orderItems.map(item => `<p style="margin: 5px 0;">• ${item}</p>`).join('')}
              </div>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${trackingLink}" 
                 style="background-color: #28a745; color: white; padding: 14px 28px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                Track Your Order
              </a>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `Hi ${firstName},\n\nYour order #${orderId} has been confirmed!\nTotal: ${orderTotal}\n\nTrack your order: ${trackingLink}`,
  }),

  notification: ({ firstName, title, message, actionLink, actionText }) => ({
    subject: title,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${title}</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px;">
            <h1 style="color: #2c3e50; margin-bottom: 20px;">${title}</h1>
            <p style="font-size: 16px; margin-bottom: 20px;">
              Hi ${firstName},
            </p>
            <p style="font-size: 16px; margin-bottom: 20px;">
              ${message}
            </p>
            ${actionLink ? `
              <div style="text-align: center; margin: 30px 0;">
                <a href="${actionLink}" 
                   style="background-color: #3498db; color: white; padding: 14px 28px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                  ${actionText || "View Details"}
                </a>
              </div>
            ` : ''}
          </div>
        </body>
      </html>
    `,
    text: `Hi ${firstName},\n\n${title}\n\n${message}${actionLink ? `\n\n${actionLink}` : ''}`,
  }),
};