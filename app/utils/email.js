import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { logger } from './logger.js';

let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    if (env.SMTP_USER && env.SMTP_PASS && env.SMTP_USER !== 'clinic-email@gmail.com') {
      transporter = nodemailer.createTransport({
        host: env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(env.SMTP_PORT, 10) || 587,
        secure: parseInt(env.SMTP_PORT, 10) === 465,
        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASS,
        },
      });
    }
  }
  return transporter;
};

export const sendInquiryNotification = async (inquiry) => {
  try {
    const mailer = getTransporter();
    if (!mailer) {
      logger.info(`[Mock Email] New inquiry received from: ${inquiry.name} (${inquiry.email}). Message: "${inquiry.message.substring(0, 60)}..."`);
      return;
    }

    const mailOptions = {
      from: env.SMTP_FROM || 'SkinGlow Clinic <noreply@skinglow.com>',
      to: env.CLINIC_NOTIFICATION_EMAIL || env.SMTP_USER,
      subject: `[SkinGlow Clinic] New Inquiry: ${inquiry.subject || 'Patient Inquiry'} from ${inquiry.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a2e; border: 1px solid #e0d7c7; border-radius: 8px; padding: 24px;">
          <h2 style="color: #1a1a2e; margin-top: 0;">New Patient Inquiry Received</h2>
          <p>A new consultation inquiry has been submitted via the website contact form.</p>
          <hr style="border: none; border-top: 1px solid #eaeaea; margin: 16px 0;" />
          <p><strong>Name:</strong> ${inquiry.name}</p>
          <p><strong>Email:</strong> <a href="mailto:${inquiry.email}">${inquiry.email}</a></p>
          <p><strong>Phone:</strong> ${inquiry.phone || 'Not provided'}</p>
          <p><strong>Subject:</strong> ${inquiry.subject || 'General Inquiry'}</p>
          <div style="background-color: #fdfbf7; border-left: 4px solid #c9a96e; padding: 12px; margin: 16px 0;">
            <p style="margin: 0; white-space: pre-wrap;">${inquiry.message}</p>
          </div>
          <p style="font-size: 12px; color: #777;">Received at: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
        </div>
      `,
    };

    await mailer.sendMail(mailOptions);
    logger.info(`Notification email sent for inquiry #${inquiry.id}`);
  } catch (error) {
    logger.error('Failed to send inquiry notification email:', error.message);
  }
};
