import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { logger } from './logger.js';

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
 * Robust HTML entity escaping for user-supplied strings interpolated into emails
 */
export const escapeHtml = (str) => {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

const formatDateTime = (dateStr) => {
  try {
    const d = new Date(dateStr);
    return d.toLocaleString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kolkata',
    });
  } catch {
    return dateStr;
  }
};

export const sendInquiryNotification = async (inquiry) => {
  try {
    const mailer = getTransporter();
    const safeName = escapeHtml(inquiry.name);
    const safeEmail = escapeHtml(inquiry.email);
    const safePhone = escapeHtml(inquiry.phone || 'Not provided');
    const safeSubject = escapeHtml(inquiry.subject || 'General Inquiry');
    const safeMessage = escapeHtml(inquiry.message);

    if (!mailer) {
      logger.info(`[Mock Email] New inquiry received from: ${safeName} (${safeEmail}). Subject: "${safeSubject}"`);
      return;
    }

    const mailOptions = {
      from: getFromEmail(),
      to: getClinicEmail(),
      subject: `[SkinGlow Clinic] New Inquiry: ${safeSubject} from ${safeName}`,
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 620px; margin: 0 auto; color: #1a1a2e; border: 1px solid #e0d7c7; border-radius: 10px; padding: 28px; background-color: #ffffff;">
          <div style="border-bottom: 2px solid #c9a96e; padding-bottom: 16px; margin-bottom: 20px;">
            <h2 style="color: #1a1a2e; margin: 0; font-size: 22px;">New Patient Consultation Inquiry</h2>
            <p style="color: #6b7280; margin: 6px 0 0 0; font-size: 14px;">Submitted via website contact page</p>
          </div>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr><td style="padding: 8px 0; color: #6b7280; width: 120px;"><strong>Name:</strong></td><td style="padding: 8px 0; color: #1a1a2e;">${safeName}</td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280;"><strong>Email:</strong></td><td style="padding: 8px 0;"><a href="mailto:${safeEmail}" style="color: #c9a96e; text-decoration: none;">${safeEmail}</a></td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280;"><strong>Phone:</strong></td><td style="padding: 8px 0; color: #1a1a2e;">${safePhone}</td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280;"><strong>Subject:</strong></td><td style="padding: 8px 0; color: #1a1a2e;">${safeSubject}</td></tr>
          </table>
          <div style="background-color: #fdfbf7; border-left: 4px solid #c9a96e; padding: 16px; border-radius: 4px; margin: 16px 0;">
            <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #333; white-space: pre-wrap;">${safeMessage}</p>
          </div>
          <p style="font-size: 12px; color: #9ca3af; margin-top: 24px;">Received at: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
        </div>
      `,
    };

    await mailer.sendMail(mailOptions);
    logger.info(`Notification email sent for inquiry #${inquiry.id}`);
  } catch (error) {
    logger.error('Failed to send inquiry notification email:', error.message);
  }
};

export const sendAppointmentConfirmation = async ({ appointment, treatment }) => {
  try {
    const treatmentTitle = escapeHtml(treatment?.title || 'Clinical Consultation');
    const formattedDate = formatDateTime(appointment.preferred_date_time);
    const safePatientName = escapeHtml(appointment.patient_name);
    const safeEmail = escapeHtml(appointment.email);
    const safePhone = escapeHtml(appointment.phone);
    const safeMessage = escapeHtml(appointment.message);
    const mailer = getTransporter();

    if (!mailer) {
      logger.info(`[Mock Email] Appointment confirmation dispatched to patient: ${safePatientName} <${safeEmail}> for "${treatmentTitle}" on ${formattedDate}.`);
      return;
    }

    const mailOptions = {
      from: getFromEmail(),
      to: appointment.email,
      subject: `Appointment Request Received (Approval Pending): ${treatmentTitle} at SkinGlow Clinic`,
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 620px; margin: 0 auto; color: #1a1a2e; border: 1px solid #e0d7c7; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
          <div style="background: linear-gradient(135deg, #1A1A2E 0%, #16213E 100%); padding: 32px 28px; text-align: center; color: #ffffff;">
            <h1 style="margin: 0; font-size: 24px; letter-spacing: 0.5px; color: #c9a96e;">SkinGlow Clinic</h1>
            <p style="margin: 8px 0 0 0; font-size: 14px; opacity: 0.9;">Appointment Request Received (Approval Pending)</p>
          </div>
          <div style="padding: 28px;">
            <p style="font-size: 16px; margin: 0 0 16px 0;">Dear <strong>${safePatientName}</strong>,</p>
            <p style="font-size: 14px; color: #4b5563; line-height: 1.6; margin-bottom: 24px;">
              Thank you for choosing SkinGlow Clinic. We have successfully registered your appointment request. Your booking is currently <strong>Approval Pending</strong> while our clinical coordinator reviews doctor availability and finalizes your scheduled slot. We will notify you as soon as it is approved.
            </p>
            
            <div style="background-color: #fdfbf7; border: 1px solid #f0e6d6; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
              <h3 style="margin: 0 0 14px 0; color: #1a1a2e; font-size: 16px; border-bottom: 1px solid #e5dac9; padding-bottom: 8px;">
                Booking Details (Ref: #APPT-${appointment.id})
              </h3>
              <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                <tr>
                  <td style="padding: 6px 0; color: #6b7280; width: 140px;"><strong>Procedure:</strong></td>
                  <td style="padding: 6px 0; color: #1a1a2e; font-weight: 600;">${treatmentTitle}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #6b7280;"><strong>Scheduled Slot:</strong></td>
                  <td style="padding: 6px 0; color: #c9a96e; font-weight: 600;">${formattedDate}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #6b7280;"><strong>Status:</strong></td>
                  <td style="padding: 6px 0;">
                    <span style="background-color: #fef3c7; color: #92400e; padding: 4px 10px; border-radius: 6px; font-weight: 700; font-size: 13px; border: 1px solid #fde68a;">
                      Approval Pending
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #6b7280;"><strong>Phone:</strong></td>
                  <td style="padding: 6px 0; color: #1a1a2e;">${safePhone}</td>
                </tr>
                ${safeMessage ? `
                <tr>
                  <td style="padding: 6px 0; color: #6b7280; vertical-align: top;"><strong>Patient Note:</strong></td>
                  <td style="padding: 6px 0; color: #4b5563; font-style: italic;">${safeMessage}</td>
                </tr>` : ''}
              </table>
            </div>

            <div style="border-left: 3px solid #c9a96e; padding: 12px 16px; background-color: #faf7f2; border-radius: 0 6px 6px 0; margin-bottom: 24px;">
              <h4 style="margin: 0 0 6px 0; color: #1a1a2e; font-size: 14px;">Important Clinic Instructions:</h4>
              <ul style="margin: 0; padding-left: 18px; font-size: 13px; color: #4b5563; line-height: 1.6;">
                <li>Please arrive 10 minutes prior to your appointment time for clinical documentation.</li>
                <li>Avoid applying heavy cosmetics or active chemical exfoliants right before facial assessments.</li>
                <li>If you need to reschedule, kindly notify us at least 4 hours in advance.</li>
              </ul>
            </div>

            <p style="font-size: 13px; color: #6b7280; margin: 0 0 6px 0;">Warm regards,</p>
            <p style="font-size: 14px; font-weight: 600; color: #1a1a2e; margin: 0;">Dr. Aisha Sharma, MD & Clinical Team</p>
            <p style="font-size: 12px; color: #9ca3af; margin: 4px 0 0 0;">SkinGlow Clinic • Dermatology & Aesthetic Excellence</p>
          </div>
        </div>
      `,
    };

    await mailer.sendMail(mailOptions);
    logger.info(`Appointment confirmation email delivered to ${safeEmail} (Appt #${appointment.id})`);
  } catch (error) {
    logger.error('Failed to dispatch appointment confirmation email to patient:', error.message);
  }
};

export const sendAppointmentAlert = async ({ appointment, treatment }) => {
  try {
    const treatmentTitle = escapeHtml(treatment?.title || 'Clinical Consultation');
    const formattedDate = formatDateTime(appointment.preferred_date_time);
    const safePatientName = escapeHtml(appointment.patient_name);
    const safeEmail = escapeHtml(appointment.email);
    const safePhone = escapeHtml(appointment.phone);
    const safeMessage = escapeHtml(appointment.message);
    const mailer = getTransporter();

    if (!mailer) {
      logger.info(`[Mock Email] Clinic alert: New appointment #${appointment.id} booked by ${safePatientName} (${safePhone}) for "${treatmentTitle}" on ${formattedDate}.`);
      return;
    }

    const mailOptions = {
      from: getFromEmail(),
      to: getClinicEmail(),
      subject: `[New Appointment Alert] #${appointment.id} - ${safePatientName} (${treatmentTitle})`,
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 620px; margin: 0 auto; color: #1a1a2e; border: 1px solid #e0d7c7; border-radius: 10px; padding: 28px; background-color: #ffffff;">
          <div style="border-bottom: 2px solid #10b981; padding-bottom: 16px; margin-bottom: 20px;">
            <h2 style="color: #1a1a2e; margin: 0; font-size: 22px;">New Appointment Scheduled</h2>
            <p style="color: #6b7280; margin: 4px 0 0 0; font-size: 14px;">Immediate staff action notification</p>
          </div>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 20px;">
            <tr><td style="padding: 8px 0; color: #6b7280; width: 140px;"><strong>Appointment ID:</strong></td><td style="padding: 8px 0; color: #1a1a2e; font-weight: 700;">#${appointment.id}</td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280;"><strong>Patient Name:</strong></td><td style="padding: 8px 0; color: #1a1a2e; font-weight: 600;">${safePatientName}</td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280;"><strong>Contact Mobile:</strong></td><td style="padding: 8px 0; color: #1a1a2e;">${safePhone}</td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280;"><strong>Contact Email:</strong></td><td style="padding: 8px 0;"><a href="mailto:${safeEmail}" style="color: #c9a96e;">${safeEmail}</a></td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280;"><strong>Procedure:</strong></td><td style="padding: 8px 0; color: #1a1a2e; font-weight: 600;">${treatmentTitle}</td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280;"><strong>Preferred Slot:</strong></td><td style="padding: 8px 0; color: #16213e; font-weight: 600;">${formattedDate}</td></tr>
          </table>
          ${safeMessage ? `
          <div style="background-color: #fdfbf7; border-left: 4px solid #c9a96e; padding: 14px; border-radius: 4px; margin: 16px 0;">
            <p style="margin: 0; font-size: 13px; color: #333; line-height: 1.5;"><strong>Patient Notes:</strong><br />${safeMessage}</p>
          </div>` : ''}
          <div style="margin-top: 24px; text-align: center;">
            <a href="${env.CLIENT_URL || 'http://localhost:3000'}/admin/appointments" style="display: inline-block; background-color: #1a1a2e; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 600;">View in Admin Dashboard</a>
          </div>
        </div>
      `,
    };

    await mailer.sendMail(mailOptions);
    logger.info(`Clinic staff alert email sent for appointment #${appointment.id}`);
  } catch (error) {
    logger.error('Failed to send clinic staff appointment alert email:', error.message);
  }
};

export const sendAppointmentCancellation = async ({ appointment, treatment, reason }) => {
  try {
    const treatmentTitle = escapeHtml(treatment?.title || 'Clinical Consultation');
    const formattedDate = formatDateTime(appointment.preferred_date_time);
    const safePatientName = escapeHtml(appointment.patient_name);
    const safeEmail = escapeHtml(appointment.email);
    const safeReason = escapeHtml(reason || 'Operational schedule adjustment or doctor unavailability');
    const mailer = getTransporter();

    if (!mailer) {
      logger.info(`[Mock Email] Appointment cancellation dispatched to patient: ${safePatientName} <${safeEmail}> for "${treatmentTitle}". Reason: ${safeReason}`);
      return;
    }

    const mailOptions = {
      from: getFromEmail(),
      to: appointment.email,
      subject: `Notice of Cancellation: Appointment for ${treatmentTitle} at SkinGlow Clinic (#APPT-${appointment.id})`,
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 620px; margin: 0 auto; color: #1a1a2e; border: 1px solid #e0d7c7; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
          <div style="background: linear-gradient(135deg, #7f1d1d 0%, #450a0a 100%); padding: 32px 28px; text-align: center; color: #ffffff;">
            <h1 style="margin: 0; font-size: 24px; letter-spacing: 0.5px; color: #fecaca;">SkinGlow Clinic</h1>
            <p style="margin: 8px 0 0 0; font-size: 14px; opacity: 0.9;">Appointment Cancellation Notice</p>
          </div>
          <div style="padding: 28px;">
            <p style="font-size: 16px; margin: 0 0 16px 0;">Dear <strong>${safePatientName}</strong>,</p>
            <p style="font-size: 14px; color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
              We regret to inform you that your upcoming clinical consultation at SkinGlow Clinic has been <strong>cancelled</strong>.
            </p>
            
            <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-left: 4px solid #ef4444; border-radius: 8px; padding: 18px; margin-bottom: 24px;">
              <h3 style="margin: 0 0 8px 0; color: #991b1b; font-size: 15px;">
                Reason for Cancellation:
              </h3>
              <p style="margin: 0; font-size: 14px; color: #7f1d1d; line-height: 1.5; font-weight: 500;">
                ${safeReason}
              </p>
            </div>

            <div style="background-color: #fdfbf7; border: 1px solid #f0e6d6; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
              <h4 style="margin: 0 0 12px 0; color: #1a1a2e; font-size: 15px; border-bottom: 1px solid #e5dac9; padding-bottom: 8px;">
                Cancelled Appointment Details (Ref: #APPT-${appointment.id})
              </h4>
              <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                <tr>
                  <td style="padding: 6px 0; color: #6b7280; width: 140px;"><strong>Procedure:</strong></td>
                  <td style="padding: 6px 0; color: #1a1a2e; font-weight: 600;">${treatmentTitle}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #6b7280;"><strong>Originally Scheduled:</strong></td>
                  <td style="padding: 6px 0; color: #6b7280; text-decoration: line-through;">${formattedDate}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #6b7280;"><strong>Status:</strong></td>
                  <td style="padding: 6px 0;">
                    <span style="background-color: #fee2e2; color: #991b1b; padding: 4px 10px; border-radius: 6px; font-weight: 700; font-size: 13px; border: 1px solid #fca5a5;">
                      Cancelled
                    </span>
                  </td>
                </tr>
              </table>
            </div>

            <div style="border-left: 3px solid #c9a96e; padding: 12px 16px; background-color: #faf7f2; border-radius: 0 6px 6px 0; margin-bottom: 24px;">
              <h4 style="margin: 0 0 6px 0; color: #1a1a2e; font-size: 14px;">Need to Reschedule?</h4>
              <p style="margin: 0; font-size: 13px; color: #4b5563; line-height: 1.6;">
                We sincerely apologize for any inconvenience caused. You may easily pick another convenient time slot directly on our website or by contacting our clinic helpline.
              </p>
            </div>

            <p style="font-size: 13px; color: #6b7280; margin: 0 0 4px 0;">Clinic Helpline: <strong>+91 98765 43210</strong> • Email: contact@skinglow.com</p>
            <p style="font-size: 13px; color: #6b7280; margin: 16px 0 4px 0;">Warm regards,</p>
            <p style="font-size: 14px; font-weight: 600; color: #1a1a2e; margin: 0;">SkinGlow Aesthetic Clinic Team</p>
          </div>
        </div>
      `,
    };

    await mailer.sendMail(mailOptions);
    logger.info(`Appointment cancellation email dispatched to ${safeEmail} (Appt #${appointment.id})`);
  } catch (error) {
    logger.error('Failed to dispatch appointment cancellation email:', error.message);
  }
};
