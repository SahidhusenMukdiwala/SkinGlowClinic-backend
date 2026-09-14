import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { logger } from './logger.js';
import { SiteSetting } from '../models/index.js';
import {
  EMAIL_ACTIONS,
  getEmailTemplate,
  escapeHtml,
} from './emailTemplates.js';

export { EMAIL_ACTIONS, escapeHtml };

let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    const user = env.SMTP?.USER || env.SMTP_USER;
    const pass = env.SMTP?.PASS || env.SMTP_PASS;
    const host = env.SMTP?.HOST || env.SMTP_HOST || 'smtp.gmail.com';
    const port = parseInt(env.SMTP?.PORT || env.SMTP_PORT || '587', 10);

    if (user && pass && user !== 'clinic-email@gmail.com') {
      transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: {
          user,
          pass,
        },
      });
    }
  }
  return transporter;
};

const getFromEmail = () => env.SMTP?.FROM || env.SMTP_FROM || 'SkinGlow Clinic <noreply@skinglow.com>';
const getClinicEmail = () => env.SMTP?.CLINIC_NOTIFICATION_EMAIL || env.CLINIC_NOTIFICATION_EMAIL || env.SMTP?.USER || 'admin@skinglow.com';

/**
 * Fetch dynamic clinic and doctor details for email templates from site settings
 */
export const getClinicMetadata = async () => {
  try {
    const settings = await SiteSetting.findAll({
      where: {
        setting_key: [
          'clinic_name',
          'doctor_name',
          'doctor_qualifications',
          'clinic_phone',
          'phone',
          'clinic_email',
          'email',
          'clinic_tagline',
          'clinic_address',
          'address',
        ],
      },
    });

    const map = {};
    for (const s of settings) {
      map[s.setting_key] = s.setting_value;
    }

    const doctorName = map.doctor_name || 'Dr. Aisha Sharma';
    const doctorQual = map.doctor_qualifications ? `, ${map.doctor_qualifications}` : ', MD';
    const doctorTitle = `${doctorName}${doctorQual} & Clinical Team`;
    const clinicName = map.clinic_name || 'SkinGlow Clinic';
    const clinicPhone = map.clinic_phone || map.phone || '+91 98765 43210';
    const clinicEmail = map.clinic_email || map.email || 'contact@skinglow.com';
    const clinicTagline = map.clinic_tagline || 'Dermatology & Aesthetic Excellence';
    const clinicAddress = map.clinic_address || map.address || 'SkinGlow Clinic, Medical Arts Pavilion';

    return {
      doctorName,
      doctorTitle,
      clinicName,
      clinicPhone,
      clinicEmail,
      clinicTagline,
      clinicAddress,
    };
  } catch (err) {
    logger.warn('Could not fetch clinic site settings for email template, using defaults: %s', err.message);
    return {
      doctorName: 'Dr. Aisha Sharma',
      doctorTitle: 'Dr. Aisha Sharma, MD & Clinical Team',
      clinicName: 'SkinGlow Clinic',
      clinicPhone: '+91 98765 43210',
      clinicEmail: 'contact@skinglow.com',
      clinicTagline: 'Dermatology & Aesthetic Excellence',
      clinicAddress: 'SkinGlow Clinic, Medical Arts Pavilion',
    };
  }
};

/**
 * Core SMTP Mail Sender Helper
 */
export const sendMail = async ({ to, subject, html, logContext = '' }) => {
  try {
    const mailer = getTransporter();

    if (!mailer) {
      logger.info(`[Mock Email] ${logContext || subject} -> to: ${to}`);
      return { mock: true, delivered: true, to, subject };
    }

    const mailOptions = {
      from: getFromEmail(),
      to,
      subject,
      html,
    };

    const info = await mailer.sendMail(mailOptions);
    logger.info(`Email successfully dispatched to ${to} (${logContext || subject}) [MessageID: ${info?.messageId || 'ok'}]`);
    return { mock: false, delivered: true, info };
  } catch (error) {
    logger.error(`Failed to dispatch email to ${to} (${logContext || subject}): %s`, error.message);
    throw error;
  }
};

/**
 * Master Action-Based Email Sender
 */
export const sendActionEmail = async ({ to, action, payload }) => {
  if (!to) {
    logger.warn('Cannot send email: recipient address is empty for action %s', action);
    return;
  }

  const meta = await getClinicMetadata();
  const { subject, html } = getEmailTemplate(action, payload, meta);
  return sendMail({
    to,
    subject,
    html,
    logContext: `${action} (#APPT-${payload?.appointment?.id || payload?.inquiry?.id || ''})`,
  });
};

/**
 * 1. Booking Request Received (Pending Status = 0)
 * Preserves backwards compatibility for createAppointment.
 */
export const sendAppointmentConfirmation = async ({ appointment, treatment }) => {
  return sendActionEmail({
    to: appointment?.email,
    action: EMAIL_ACTIONS.APPOINTMENT_PENDING,
    payload: { appointment, treatment },
  }).catch((err) => {
    logger.error('Failed to send pending booking email: %s', err.message);
  });
};

/**
 * 2. Appointment Confirmed (Status = 1)
 * Dispatched when admin confirms/approves the appointment.
 */
export const sendAppointmentConfirmed = async ({ appointment, treatment }) => {
  return sendActionEmail({
    to: appointment?.email,
    action: EMAIL_ACTIONS.APPOINTMENT_CONFIRMED,
    payload: { appointment, treatment },
  }).catch((err) => {
    logger.error('Failed to send appointment confirmation email: %s', err.message);
  });
};

/**
 * 3. Appointment Completed (Status = 2)
 * Dispatched when admin marks the consultation as completed.
 */
export const sendAppointmentCompleted = async ({ appointment, treatment }) => {
  return sendActionEmail({
    to: appointment?.email,
    action: EMAIL_ACTIONS.APPOINTMENT_COMPLETED,
    payload: { appointment, treatment },
  }).catch((err) => {
    logger.error('Failed to send appointment completion email: %s', err.message);
  });
};

/**
 * 4. Appointment Cancelled (Status = 3)
 * Dispatched when admin cancels the appointment with reason.
 */
export const sendAppointmentCancellation = async ({ appointment, treatment, reason }) => {
  return sendActionEmail({
    to: appointment?.email,
    action: EMAIL_ACTIONS.APPOINTMENT_CANCELLED,
    payload: { appointment, treatment, reason },
  }).catch((err) => {
    logger.error('Failed to send appointment cancellation email: %s', err.message);
  });
};

/**
 * 5. Inquiry Notification for Staff
 * Dispatched on new patient contact form submission.
 */
export const sendInquiryNotification = async (inquiry) => {
  const meta = await getClinicMetadata();
  const to = getClinicEmail();
  const { subject, html } = getEmailTemplate(EMAIL_ACTIONS.INQUIRY_NOTIFICATION, { inquiry }, meta);
  return sendMail({
    to,
    subject,
    html,
    logContext: `Inquiry #${inquiry.id} staff alert`,
  }).catch((err) => {
    logger.error('Failed to send inquiry notification email: %s', err.message);
  });
};

/**
 * 6. Internal Staff Alert for New Appointment
 */
export const sendAppointmentAlert = async ({ appointment, treatment }) => {
  const meta = await getClinicMetadata();
  const to = getClinicEmail();
  const treatmentTitle = escapeHtml(treatment?.title || 'Clinical Consultation');
  const safePatientName = escapeHtml(appointment?.patient_name);
  const subject = `[New Appointment Alert] #${appointment?.id} - ${safePatientName} (${treatmentTitle})`;
  
  const contentHtml = `
    <div style="border-bottom: 2px solid #10b981; padding-bottom: 12px; margin-bottom: 20px;">
      <h2 style="color: #1a1a2e; margin: 0; font-size: 18px;">New Appointment Scheduled</h2>
      <p style="color: #6b7280; margin: 4px 0 0 0; font-size: 13px;">Immediate staff action notification</p>
    </div>
    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
      <tr><td style="padding: 6px 0; color: #6b7280; width: 140px;"><strong>Appt ID:</strong></td><td style="font-weight: 700;">#${appointment?.id}</td></tr>
      <tr><td style="padding: 6px 0; color: #6b7280;"><strong>Patient:</strong></td><td style="font-weight: 600;">${safePatientName}</td></tr>
      <tr><td style="padding: 6px 0; color: #6b7280;"><strong>Phone:</strong></td><td>${escapeHtml(appointment?.phone)}</td></tr>
      <tr><td style="padding: 6px 0; color: #6b7280;"><strong>Email:</strong></td><td>${escapeHtml(appointment?.email)}</td></tr>
      <tr><td style="padding: 6px 0; color: #6b7280;"><strong>Procedure:</strong></td><td style="font-weight: 600;">${treatmentTitle}</td></tr>
    </table>
  `;

  const html = getEmailTemplate(EMAIL_ACTIONS.INQUIRY_NOTIFICATION, {
    inquiry: {
      id: appointment?.id,
      name: appointment?.patient_name,
      phone: appointment?.phone,
      email: appointment?.email,
      subject: `New Booking: ${treatmentTitle}`,
      message: appointment?.message || 'No additional note',
    },
  }, meta).html;

  return sendMail({
    to,
    subject,
    html,
    logContext: `Staff alert for Appt #${appointment?.id}`,
  }).catch((err) => {
    logger.error('Failed to send staff appointment alert: %s', err.message);
  });
};
