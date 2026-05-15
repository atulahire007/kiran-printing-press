const nodemailer = require('nodemailer');
const logger = require('./logger');

// Lazy transporter — created on first use, not at startup
// This prevents warnings/errors when SMTP vars are not set
let _transporter = null;
const getTransporter = () => {
  if (_transporter) return _transporter;
  _transporter = nodemailer.createTransport({
    host:   process.env.SMTP_HOST   || 'smtp.gmail.com',
    port:   parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });
  return _transporter;
};

const templates = {
  emailVerification: ({ name, verifyUrl }) => ({
    subject: 'Verify Your Email - Kiran Printing Press',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#DC2626;padding:20px;text-align:center">
          <h1 style="color:white;margin:0">🖨️ Kiran Printing Press</h1>
          <p style="color:#fca5a5;margin:5px 0">Dharashiv, Maharashtra</p>
        </div>
        <div style="padding:30px;background:#f9fafb">
          <h2>Welcome, ${name}!</h2>
          <p>Thank you for registering with Kiran Printing Press. Please verify your email address.</p>
          <a href="${verifyUrl}" style="display:inline-block;background:#DC2626;color:white;padding:12px 30px;border-radius:6px;text-decoration:none;margin:20px 0">
            Verify Email Address
          </a>
          <p style="color:#6b7280;font-size:14px">This link expires in 24 hours.</p>
        </div>
      </div>`,
  }),

  passwordReset: ({ name, resetUrl }) => ({
    subject: 'Password Reset - Kiran Printing Press',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#DC2626;padding:20px;text-align:center">
          <h1 style="color:white;margin:0">🖨️ Kiran Printing Press</h1>
        </div>
        <div style="padding:30px;background:#f9fafb">
          <h2>Hello, ${name}</h2>
          <p>We received a request to reset your password.</p>
          <a href="${resetUrl}" style="display:inline-block;background:#DC2626;color:white;padding:12px 30px;border-radius:6px;text-decoration:none;margin:20px 0">
            Reset Password
          </a>
          <p style="color:#6b7280;font-size:14px">This link expires in 15 minutes.</p>
        </div>
      </div>`,
  }),

  orderConfirmation: ({ name, order }) => ({
    subject: `Order Confirmed - ${order.orderNumber} | Kiran Printing Press`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#DC2626;padding:20px;text-align:center">
          <h1 style="color:white;margin:0">🖨️ Kiran Printing Press</h1>
        </div>
        <div style="padding:30px;background:#f9fafb">
          <h2>Order Confirmed! 🎉</h2>
          <p>Hi ${name}, your order has been placed successfully.</p>
          <div style="background:white;border-radius:8px;padding:20px;margin:20px 0;border:1px solid #e5e7eb">
            <p><strong>Order Number:</strong> ${order.orderNumber}</p>
            <p><strong>Total Amount:</strong> ₹${order.totalAmount.toFixed(2)}</p>
            <p><strong>Payment Method:</strong> ${order.paymentMethod.toUpperCase()}</p>
          </div>
          <p>Estimated delivery: 3-5 business days.</p>
          <p style="color:#6b7280">Questions? WhatsApp: ${process.env.WHATSAPP_NUMBER || '+91 98765 43210'}</p>
        </div>
      </div>`,
  }),

  orderUpdate: ({ name, order, status, message }) => ({
    subject: `Order Update - ${order.orderNumber} | Kiran Printing Press`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#DC2626;padding:20px;text-align:center">
          <h1 style="color:white;margin:0">🖨️ Kiran Printing Press</h1>
        </div>
        <div style="padding:30px;background:#f9fafb">
          <h2>Order Status Update</h2>
          <p>Hi ${name}, your order <strong>${order.orderNumber}</strong> has been updated.</p>
          <div style="background:#dcfce7;border-radius:8px;padding:15px;margin:20px 0">
            <p style="margin:0"><strong>New Status:</strong> ${status.toUpperCase()}</p>
            ${message ? `<p style="margin:5px 0 0">${message}</p>` : ''}
          </div>
          ${order.trackingNumber ? `<p><strong>Tracking:</strong> ${order.trackingNumber} via ${order.courierPartner || ''}</p>` : ''}
        </div>
      </div>`,
  }),
};

exports.sendEmail = async ({ to, subject, template, data, html }) => {
  // If SMTP not configured, just log and skip — don't crash the app
  if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
    logger.warn(`[EMAIL SKIPPED] SMTP not configured. Would have sent to: ${to}`);
    return { messageId: 'skipped-no-smtp' };
  }

  try {
    const emailContent = template ? templates[template](data) : { subject, html };
    const info = await getTransporter().sendMail({
      from: `"${process.env.FROM_NAME || 'Kiran Printing Press'}" <${process.env.FROM_EMAIL || process.env.SMTP_EMAIL}>`,
      to,
      subject: emailContent.subject || subject,
      html:    emailContent.html    || html,
    });
    logger.info(`Email sent: ${info.messageId} to ${to}`);
    return info;
  } catch (error) {
    // Log error but don't crash — email failure should never kill the server
    logger.error(`Email send failed to ${to}: ${error.message}`);
    return null;
  }
};
