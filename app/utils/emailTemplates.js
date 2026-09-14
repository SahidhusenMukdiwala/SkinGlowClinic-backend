/**
 * Centralized HTML Email Template Engine for SkinGlow Clinic
 * Provides secure escaping, responsive layout shell, and action-driven template generation.
 */

export const EMAIL_ACTIONS = {
  APPOINTMENT_PENDING: 'APPOINTMENT_PENDING',     // Initial request submitted by patient
  APPOINTMENT_CONFIRMED: 'APPOINTMENT_CONFIRMED', // Admin marks appointment confirmed (1)
  APPOINTMENT_COMPLETED: 'APPOINTMENT_COMPLETED', // Admin marks appointment completed (2)
  APPOINTMENT_CANCELLED: 'APPOINTMENT_CANCELLED', // Admin marks appointment cancelled (3)
  INQUIRY_NOTIFICATION: 'INQUIRY_NOTIFICATION',   // Staff alert on contact inquiry
};

/**
 * Robust HTML entity escaping for user-supplied strings interpolated into HTML
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

/**
 * Human-friendly date and time formatter
 */
export const formatDateTime = (dateStr) => {
  if (!dateStr) return 'Date to be finalized';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return String(dateStr);
  return date.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

/**
 * Responsive Base Email Layout
 * Wraps content with brand header, styled card, and verified clinic footer.
 */
export const baseEmailLayout = ({
  headerTitle,
  headerSubtitle,
  headerGradient = 'linear-gradient(135deg, #1A1A2E 0%, #16213E 100%)',
  headerColor = '#c9a96e',
  contentHtml,
  clinicMeta = {},
}) => {
  const safeClinicName = escapeHtml(clinicMeta.clinicName || 'SkinGlow Clinic');
  const safeClinicTagline = escapeHtml(clinicMeta.clinicTagline || 'Dermatology & Aesthetic Excellence');
  const safeClinicPhone = escapeHtml(clinicMeta.clinicPhone || '+91 98765 43210');
  const safeClinicEmail = escapeHtml(clinicMeta.clinicEmail || 'contact@skinglow.com');
  const safeDoctorTitle = escapeHtml(clinicMeta.doctorTitle || 'Dr. Aisha Sharma, MD & Clinical Team');
  const safeAddress = escapeHtml(clinicMeta.clinicAddress || 'SkinGlow Clinic, Medical Arts Pavilion');

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${escapeHtml(headerTitle)}</title>
      </head>
      <body style="margin: 0; padding: 24px 0; background-color: #f3f4f6; font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
        <div style="max-width: 620px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);">
          
          <!-- Clinic Header -->
          <div style="background: ${headerGradient}; padding: 32px 28px; text-align: center; color: #ffffff;">
            <h1 style="margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 0.5px; color: ${headerColor};">
              ${safeClinicName}
            </h1>
            <p style="margin: 8px 0 0 0; font-size: 14px; opacity: 0.92; color: #e2e8f0; letter-spacing: 0.3px;">
              ${escapeHtml(headerSubtitle || safeClinicTagline)}
            </p>
          </div>

          <!-- Email Body -->
          <div style="padding: 32px 28px; color: #1f2937;">
            ${contentHtml}
            
            <!-- Standardized Warm Sign-off -->
            <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #f3f4f6;">
              <p style="font-size: 13px; color: #6b7280; margin: 0 0 4px 0;">Warm regards,</p>
              <p style="font-size: 14px; font-weight: 700; color: #111827; margin: 0;">${safeDoctorTitle}</p>
              <p style="font-size: 12px; color: #9ca3af; margin: 4px 0 0 0;">${safeClinicName} • ${safeClinicTagline}</p>
            </div>
          </div>

          <!-- Clinic Footer -->
          <div style="background-color: #f9fafb; padding: 20px 28px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; line-height: 1.6; text-align: center;">
            <p style="margin: 0 0 4px 0;">
              <strong>Helpline:</strong> ${safeClinicPhone} &nbsp;•&nbsp; <strong>Email:</strong> <a href="mailto:${safeClinicEmail}" style="color: #c9a96e; text-decoration: none;">${safeClinicEmail}</a>
            </p>
            <p style="margin: 0; color: #9ca3af; font-size: 11px;">
              ${safeAddress} &nbsp;•&nbsp; Confidential & Proprietary Medical Communications
            </p>
          </div>

        </div>
      </body>
    </html>
  `;
};

/**
 * 1. Appointment Pending (Booking Request Received)
 */
export const renderAppointmentPending = ({ appointment, treatment }, clinicMeta = {}) => {
  const rawTreatmentTitle = treatment?.title || 'Clinical Consultation';
  const rawClinicName = clinicMeta?.clinicName || 'SkinGlow Clinic';
  const treatmentTitle = escapeHtml(rawTreatmentTitle);
  const formattedDate = formatDateTime(appointment.preferred_date_time);
  const safePatientName = escapeHtml(appointment.patient_name);
  const safePhone = escapeHtml(appointment.phone);
  const safeMessage = escapeHtml(appointment.message);
  const safeClinicName = escapeHtml(rawClinicName);

  const subject = `Appointment Request Received (Approval Pending): ${rawTreatmentTitle} at ${rawClinicName}`;

  const contentHtml = `
    <p style="font-size: 16px; margin: 0 0 16px 0;">Dear <strong>${safePatientName}</strong>,</p>
    <p style="font-size: 14px; color: #4b5563; line-height: 1.6; margin-bottom: 24px;">
      Thank you for choosing ${safeClinicName}. We have successfully received your appointment request. Your booking is currently <strong>Approval Pending</strong> while our clinical coordinator reviews schedule availability. You will receive an official confirmation notice as soon as it is confirmed.
    </p>

    <div style="background-color: #fdfbf7; border: 1px solid #f0e6d6; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
      <h3 style="margin: 0 0 14px 0; color: #1a1a2e; font-size: 15px; border-bottom: 1px solid #e5dac9; padding-bottom: 8px;">
        Booking Request Summary (Ref: #APPT-${appointment.id})
      </h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr>
          <td style="padding: 6px 0; color: #6b7280; width: 140px;"><strong>Procedure:</strong></td>
          <td style="padding: 6px 0; color: #1a1a2e; font-weight: 600;">${treatmentTitle}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #6b7280;"><strong>Requested Slot:</strong></td>
          <td style="padding: 6px 0; color: #c9a96e; font-weight: 600;">${formattedDate}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #6b7280;"><strong>Status:</strong></td>
          <td style="padding: 6px 0;">
            <span style="background-color: #fef3c7; color: #92400e; padding: 4px 10px; border-radius: 6px; font-weight: 700; font-size: 12px; border: 1px solid #fde68a;">
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

    <div style="border-left: 3px solid #c9a96e; padding: 12px 16px; background-color: #faf7f2; border-radius: 0 6px 6px 0; margin-bottom: 8px;">
      <h4 style="margin: 0 0 6px 0; color: #1a1a2e; font-size: 14px;">Next Steps:</h4>
      <p style="margin: 0; font-size: 13px; color: #4b5563; line-height: 1.5;">
        Our team reviews all incoming requests promptly. If you need immediate assistance or would like to request priority rescheduling, please reach out directly to our clinic desk.
      </p>
    </div>
  `;

  const html = baseEmailLayout({
    headerTitle: 'Appointment Request Received',
    headerSubtitle: 'Status: Approval Pending',
    contentHtml,
    clinicMeta,
  });

  return { subject, html };
};

/**
 * 2. Appointment Confirmed (Officially Approved by Clinic)
 */
export const renderAppointmentConfirmed = ({ appointment, treatment }, clinicMeta = {}) => {
  const rawTreatmentTitle = treatment?.title || 'Clinical Consultation';
  const rawClinicName = clinicMeta?.clinicName || 'SkinGlow Clinic';
  const treatmentTitle = escapeHtml(rawTreatmentTitle);
  const duration = escapeHtml(treatment?.duration || '45 mins');
  const formattedDate = formatDateTime(appointment.preferred_date_time);
  const safePatientName = escapeHtml(appointment.patient_name);
  const safeClinicName = escapeHtml(rawClinicName);
  const safeDoctorTitle = escapeHtml(clinicMeta?.doctorTitle || 'Dr. Aisha Sharma, MD & Clinical Team');

  const subject = `Appointment Confirmed: ${rawTreatmentTitle} at ${rawClinicName} (#APPT-${appointment.id})`;

  const contentHtml = `
    <p style="font-size: 16px; margin: 0 0 16px 0;">Dear <strong>${safePatientName}</strong>,</p>
    <p style="font-size: 14px; color: #4b5563; line-height: 1.6; margin-bottom: 24px;">
      Great news! Your clinical appointment at <strong>${safeClinicName}</strong> has been officially <strong>confirmed and scheduled</strong>. Our clinical team is prepared for your visit.
    </p>

    <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
      <h3 style="margin: 0 0 14px 0; color: #166534; font-size: 15px; border-bottom: 1px solid #dcfce7; padding-bottom: 8px;">
        Confirmed Appointment Details (Ref: #APPT-${appointment.id})
      </h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr>
          <td style="padding: 6px 0; color: #6b7280; width: 140px;"><strong>Procedure:</strong></td>
          <td style="padding: 6px 0; color: #1a1a2e; font-weight: 700;">${treatmentTitle}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #6b7280;"><strong>Confirmed Slot:</strong></td>
          <td style="padding: 6px 0; color: #15803d; font-weight: 700; font-size: 15px;">${formattedDate}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #6b7280;"><strong>Estimated Duration:</strong></td>
          <td style="padding: 6px 0; color: #1a1a2e;">${duration}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #6b7280;"><strong>Doctor / Specialist:</strong></td>
          <td style="padding: 6px 0; color: #1a1a2e; font-weight: 600;">${safeDoctorTitle}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #6b7280;"><strong>Status:</strong></td>
          <td style="padding: 6px 0;">
            <span style="background-color: #dcfce7; color: #166534; padding: 4px 10px; border-radius: 6px; font-weight: 700; font-size: 12px; border: 1px solid #86efac;">
              Confirmed
            </span>
          </td>
        </tr>
      </table>
    </div>

    <div style="border-left: 3px solid #16a34a; padding: 12px 16px; background-color: #f0fdf4; border-radius: 0 6px 6px 0; margin-bottom: 16px;">
      <h4 style="margin: 0 0 6px 0; color: #166534; font-size: 14px;">Important Pre-Visit Instructions:</h4>
      <ul style="margin: 0; padding-left: 18px; font-size: 13px; color: #374151; line-height: 1.6;">
        <li>Please arrive <strong>10 minutes prior</strong> to your scheduled slot for registration.</li>
        <li>Avoid applying heavy makeup, chemical peels, or harsh topicals prior to facial appointments.</li>
        <li>If you need to reschedule or cannot make it, please notify us at least 4 hours in advance.</li>
      </ul>
    </div>
  `;

  const html = baseEmailLayout({
    headerTitle: 'Appointment Confirmed',
    headerSubtitle: 'Your appointment is officially scheduled',
    headerGradient: 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)',
    headerColor: '#a7f3d0',
    contentHtml,
    clinicMeta,
  });

  return { subject, html };
};

/**
 * 3. Appointment Completed (Post-Treatment Follow-up & Thank You)
 */
export const renderAppointmentCompleted = ({ appointment, treatment }, clinicMeta = {}) => {
  const rawTreatmentTitle = treatment?.title || 'Clinical Consultation';
  const rawClinicName = clinicMeta?.clinicName || 'SkinGlow Clinic';
  const treatmentTitle = escapeHtml(rawTreatmentTitle);
  const safePatientName = escapeHtml(appointment.patient_name);
  const safeClinicName = escapeHtml(rawClinicName);

  const subject = `Thank You for Visiting ${rawClinicName} (#APPT-${appointment.id})`;

  const contentHtml = `
    <p style="font-size: 16px; margin: 0 0 16px 0;">Dear <strong>${safePatientName}</strong>,</p>
    <p style="font-size: 14px; color: #4b5563; line-height: 1.6; margin-bottom: 24px;">
      Thank you for visiting <strong>${safeClinicName}</strong> for your <strong>${treatmentTitle}</strong>. It was a pleasure caring for you today. We hope your experience was comfortable, professional, and rejuvenating.
    </p>

    <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
      <h3 style="margin: 0 0 12px 0; color: #1e40af; font-size: 15px; border-bottom: 1px solid #dbeafe; padding-bottom: 8px;">
        General Clinical Aftercare Reminder
      </h3>
      <ul style="margin: 0; padding-left: 18px; font-size: 13px; color: #1e3a8a; line-height: 1.6;">
        <li>Keep your skin well hydrated and follow the prescribed post-procedure regimen.</li>
        <li>Always apply broad-spectrum sunscreen (SPF 50+) when going outdoors.</li>
        <li>Avoid direct sun exposure, saunas, and intense workouts for 24–48 hours if advised.</li>
      </ul>
    </div>

    <div style="background-color: #fdfbf7; border: 1px solid #f0e6d6; border-radius: 8px; padding: 18px; text-align: center; margin-bottom: 8px;">
      <h4 style="margin: 0 0 8px 0; color: #1a1a2e; font-size: 15px;">How was your experience?</h4>
      <p style="margin: 0 0 12px 0; font-size: 13px; color: #6b7280; line-height: 1.5;">
        Your feedback helps us continuously deliver exceptional aesthetic care. If you have any post-care questions, our helpline is always available.
      </p>
    </div>
  `;

  const html = baseEmailLayout({
    headerTitle: 'Thank You for Visiting',
    headerSubtitle: 'We appreciate the trust you place in us',
    headerGradient: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
    headerColor: '#93c5fd',
    contentHtml,
    clinicMeta,
  });

  return { subject, html };
};

/**
 * 4. Appointment Cancelled
 */
export const renderAppointmentCancelled = ({ appointment, treatment, reason }, clinicMeta = {}) => {
  const rawTreatmentTitle = treatment?.title || 'Clinical Consultation';
  const rawClinicName = clinicMeta?.clinicName || 'SkinGlow Clinic';
  const rawReason = reason || 'Operational schedule adjustment or specialist unavailability';
  const treatmentTitle = escapeHtml(rawTreatmentTitle);
  const formattedDate = formatDateTime(appointment.preferred_date_time);
  const safePatientName = escapeHtml(appointment.patient_name);
  const safeClinicName = escapeHtml(rawClinicName);
  const safeReason = escapeHtml(rawReason);

  const subject = `Notice of Cancellation: Appointment for ${rawTreatmentTitle} at ${rawClinicName} (#APPT-${appointment.id})`;

  const contentHtml = `
    <p style="font-size: 16px; margin: 0 0 16px 0;">Dear <strong>${safePatientName}</strong>,</p>
    <p style="font-size: 14px; color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
      We regret to inform you that your scheduled appointment at <strong>${safeClinicName}</strong> has been <strong>cancelled</strong>.
    </p>

    <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-left: 4px solid #ef4444; border-radius: 8px; padding: 18px; margin-bottom: 24px;">
      <h3 style="margin: 0 0 8px 0; color: #991b1b; font-size: 14px;">
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
            <span style="background-color: #fee2e2; color: #991b1b; padding: 4px 10px; border-radius: 6px; font-weight: 700; font-size: 12px; border: 1px solid #fca5a5;">
              Cancelled
            </span>
          </td>
        </tr>
      </table>
    </div>

    <div style="border-left: 3px solid #c9a96e; padding: 12px 16px; background-color: #faf7f2; border-radius: 0 6px 6px 0; margin-bottom: 8px;">
      <h4 style="margin: 0 0 6px 0; color: #1a1a2e; font-size: 14px;">Need to Reschedule?</h4>
      <p style="margin: 0; font-size: 13px; color: #4b5563; line-height: 1.6;">
        We sincerely apologize for any inconvenience caused. You can pick another convenient time slot directly on our website or by contacting our helpline.
      </p>
    </div>
  `;

  const html = baseEmailLayout({
    headerTitle: 'Appointment Cancelled',
    headerSubtitle: 'Cancellation notification & details',
    headerGradient: 'linear-gradient(135deg, #7f1d1d 0%, #450a0a 100%)',
    headerColor: '#fecaca',
    contentHtml,
    clinicMeta,
  });

  return { subject, html };
};

/**
 * 5. Inquiry Notification (Staff Alert)
 */
export const renderInquiryNotification = ({ inquiry }, clinicMeta = {}) => {
  const rawSubject = inquiry?.subject || 'General Inquiry';
  const rawClinicName = clinicMeta?.clinicName || 'SkinGlow Clinic';
  const safeName = escapeHtml(inquiry.name);
  const safeEmail = escapeHtml(inquiry.email);
  const safePhone = escapeHtml(inquiry.phone);
  const safeSubject = escapeHtml(rawSubject);
  const safeMessage = escapeHtml(inquiry.message);
  const safeClinicName = escapeHtml(rawClinicName);

  const subject = `[New Website Inquiry] #${inquiry.id}: ${rawSubject}`;

  const contentHtml = `
    <div style="border-bottom: 2px solid #10b981; padding-bottom: 12px; margin-bottom: 20px;">
      <h2 style="color: #1a1a2e; margin: 0; font-size: 18px;">New Patient Inquiry Received</h2>
      <p style="color: #6b7280; margin: 4px 0 0 0; font-size: 13px;">Immediate staff triage notification</p>
    </div>

    <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 20px;">
      <tr>
        <td style="padding: 6px 0; color: #6b7280; width: 130px;"><strong>Inquiry ID:</strong></td>
        <td style="padding: 6px 0; color: #1a1a2e; font-weight: 700;">#${inquiry.id}</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; color: #6b7280;"><strong>Sender Name:</strong></td>
        <td style="padding: 6px 0; color: #1a1a2e; font-weight: 600;">${safeName}</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; color: #6b7280;"><strong>Contact Mobile:</strong></td>
        <td style="padding: 6px 0; color: #1a1a2e;">${safePhone}</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; color: #6b7280;"><strong>Email Address:</strong></td>
        <td style="padding: 6px 0;"><a href="mailto:${safeEmail}" style="color: #c9a96e; text-decoration: none;">${safeEmail}</a></td>
      </tr>
      <tr>
        <td style="padding: 6px 0; color: #6b7280;"><strong>Subject:</strong></td>
        <td style="padding: 6px 0; color: #1a1a2e; font-weight: 600;">${safeSubject}</td>
      </tr>
    </table>

    <div style="background-color: #fdfbf7; border-left: 4px solid #c9a96e; padding: 14px; border-radius: 4px; margin: 16px 0;">
      <p style="margin: 0; font-size: 13px; color: #374151; line-height: 1.6;">
        <strong>Patient Message:</strong><br />${safeMessage}
      </p>
    </div>
  `;

  const html = baseEmailLayout({
    headerTitle: safeClinicName,
    headerSubtitle: 'Patient Inquiry Notification',
    contentHtml,
    clinicMeta,
  });

  return { subject, html };
};

/**
 * Master Template Factory
 * Dispatches payload to the corresponding renderer based on action
 */
export const getEmailTemplate = (action, payload, clinicMeta = {}) => {
  switch (action) {
    case EMAIL_ACTIONS.APPOINTMENT_PENDING:
      return renderAppointmentPending(payload, clinicMeta);
    case EMAIL_ACTIONS.APPOINTMENT_CONFIRMED:
      return renderAppointmentConfirmed(payload, clinicMeta);
    case EMAIL_ACTIONS.APPOINTMENT_COMPLETED:
      return renderAppointmentCompleted(payload, clinicMeta);
    case EMAIL_ACTIONS.APPOINTMENT_CANCELLED:
      return renderAppointmentCancelled(payload, clinicMeta);
    case EMAIL_ACTIONS.INQUIRY_NOTIFICATION:
      return renderInquiryNotification(payload, clinicMeta);
    default:
      throw new Error(`Unknown email template action: ${action}`);
  }
};
