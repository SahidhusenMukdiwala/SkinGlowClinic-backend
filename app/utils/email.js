import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { logger } from './logger.js';
import { SiteSetting } from '../models/index.js';
import { EMAIL_ACTIONS, getEmailTemplate, escapeHtml } from './emailTemplates.js';

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
    const settings = await SiteSetting.findAll({ raw: true });

    const map = {};
    for (const s of settings) {
      if (s.setting_key) {
        map[s.setting_key] = s.setting_value;
      }
    }

    const clinicName = map.clinic_name || 'SkinGlow Clinic';
    const doctorName = map.doctor_name || 'Lead Specialist';
    const doctorQualifications = map.doctor_qualifications || '';
    const doctorQual = doctorQualifications ? `, ${doctorQualifications}` : '';
    const doctorTitle = map.doctor_name
      ? `${map.doctor_name}${doctorQual} & Clinical Team`
      : 'Medical Director & Clinical Team';
    const clinicPhone = map.phone || map.clinic_phone || '+91 98201 23456';
    const clinicEmail = map.email || map.clinic_email || 'contact@skinglowclinic.com';
    const clinicTagline = map.clinic_tagline || 'Advanced Dermatological & Aesthetic Care';
    const clinicAddress = map.address || map.clinic_address || 'Radiant Medical Enclave, Linking Road, Bandra West, Mumbai';
    const workingHours = map.working_hours || '';
    const whatsappNumber = map.whatsapp_number || clinicPhone;
    const instagramUrl = map.instagram_url || '';
    const facebookUrl = map.facebook_url || '';
    const youtubeUrl = map.youtube_url || '';

    // Sender "From" header
    const smtpFromEnv = env.SMTP?.FROM || env.SMTP_FROM;
    const smtpUser = env.SMTP?.USER || env.SMTP_USER || 'noreply@skinglowclinic.com';
    const fromEmail = smtpFromEnv || `"${clinicName}" <${smtpUser}>`;

    return {
      doctorName,
      doctorQualifications,
      doctorQual,
      doctorTitle,
      clinicName,
      clinicPhone,
      clinicEmail,
      clinicTagline,
      clinicAddress,
      workingHours,
      whatsappNumber,
      instagramUrl,
      facebookUrl,
      youtubeUrl,
      fromEmail,
      rawMap: map,
    };
  } catch (err) {
    logger.warn('Could not fetch clinic site settings for email template, using defaults: %s', err.message);
    return {
      doctorName: 'Lead Specialist',
      doctorQualifications: '',
      doctorQual: '',
      doctorTitle: 'Medical Director & Clinical Team',
      clinicName: 'SkinGlow Clinic',
      clinicPhone: '+91 98201 23456',
      clinicEmail: 'contact@skinglowclinic.com',
      clinicTagline: 'Advanced Dermatological & Aesthetic Care',
      clinicAddress: 'Radiant Medical Enclave, Linking Road, Bandra West, Mumbai',
      workingHours: '',
      whatsappNumber: '+91 98201 23456',
      instagramUrl: '',
      facebookUrl: '',
      youtubeUrl: '',
      fromEmail: 'SkinGlow Clinic <noreply@skinglowclinic.com>',
      rawMap: {},
    };
  }
};

/**
 * Core SMTP Mail Sender Helper
 */
export const sendMail = async ({ to, subject, html, logContext = '', from }) => {
  try {
    const mailer = getTransporter();

    if (!mailer) {
      logger.info(`[Mock Email] ${logContext || subject} -> to: ${to} from: ${from || getFromEmail()}`);
      return { mock: true, delivered: true, to, subject };
    }

    const mailOptions = {
      from: from || getFromEmail(),
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
    from: meta.fromEmail,
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
  const to = meta.clinicEmail || getClinicEmail();
  const { subject, html } = getEmailTemplate(EMAIL_ACTIONS.INQUIRY_NOTIFICATION, { inquiry }, meta);
  return sendMail({
    to,
    from: meta.fromEmail,
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
  const to = meta.clinicEmail || getClinicEmail();
  const treatmentTitle = escapeHtml(treatment?.title || 'Clinical Consultation');
  const safePatientName = escapeHtml(appointment?.patient_name);
  const subject = `[New Appointment Alert] #${appointment?.id} - ${safePatientName} (${treatmentTitle})`;

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
    from: meta.fromEmail,
    subject,
    html,
    logContext: `Staff alert for Appt #${appointment?.id}`,
  }).catch((err) => {
    logger.error('Failed to send staff appointment alert: %s', err.message);
  });
};
