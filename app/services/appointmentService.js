import { Op } from 'sequelize';
import { sequelize, Appointment, Treatment, UserMaster } from '../models/index.js';
import { 
  sendAppointmentConfirmation, 
  sendAppointmentConfirmed,
  sendAppointmentCompleted,
  sendAppointmentAlert,
  sendAppointmentCancellation 
} from '../utils/email.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { ROLES } from '../constants/roles.js';
import { generateReviewToken } from '../utils/reviewToken.js';
import { logger } from '../utils/logger.js';

// In-flight locking sets to serialize concurrent bookings and prevent race-condition multi-booking
const activeUserBookings = new Set();
const activeSlotBookings = new Set();

/**
 * Retrieve all booked time slots for a given date (YYYY-MM-DD)
 * Returns array of formatted slot strings (e.g. ['11:00 AM', '02:30 PM'])
 */
export const getBookedSlots = async (dateStr) => {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return [];
  }

  // Broad search window covering 24h of dateStr with timezone buffers
  const dayStart = new Date(`${dateStr}T00:00:00.000Z`);
  dayStart.setHours(dayStart.getHours() - 14);
  const dayEnd = new Date(`${dateStr}T23:59:59.999Z`);
  dayEnd.setHours(dayEnd.getHours() + 14);

  const appointments = await Appointment.findAll({
    where: {
      preferred_date_time: {
        [Op.between]: [dayStart, dayEnd],
      },
      status: {
        [Op.in]: [0, 1], // 0 = Pending, 1 = Confirmed (active reservations)
      },
      is_delete: 0,
    },
    attributes: ['preferred_date_time'],
  });

  const bookedSlots = new Set();
  for (const appt of appointments) {
    const d = new Date(appt.preferred_date_time);
    const istDate = d.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });

    if (istDate === dateStr) {
      const formattedTime = d.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Asia/Kolkata',
      });
      bookedSlots.add(formattedTime);
    }
  }

  return Array.from(bookedSlots);
};

/**
 * Atomically create an appointment with row-level lock and anti-abuse safeguards
 * to prevent double bookings, race conditions, and user appointment flooding.
 */
export const createAppointment = async (data) => {
  // 1. Verify treatment exists
  const treatment = await Treatment.findOne({
    where: {
      id: data.treatment_id,
      is_active: 1,
      is_delete: 0,
    },
  });
  if (!treatment) {
    const error = new Error('The selected treatment is either unavailable or does not exist.');
    error.statusCode = 404;
    throw error;
  }

  // 2. Verify patient user exists
  const user = await UserMaster.findOne({
    where: {
      id: data.user_id,
      is_active: 1,
    },
  });
  if (!user) {
    const error = new Error('Patient account not found or inactive.');
    error.statusCode = 404;
    throw error;
  }

  // 3. Verify appointment date is in a valid future window
  const appointmentDate = new Date(data.preferred_date_time);
  if (isNaN(appointmentDate.getTime())) {
    const error = new Error('Invalid appointment date and time format.');
    error.statusCode = 400;
    throw error;
  }

  const now = Date.now();
  if (appointmentDate.getTime() <= now + 30 * 60 * 1000) {
    const error = new Error('Appointments must be scheduled at least 30 minutes in advance.');
    error.statusCode = 400;
    throw error;
  }

  if (appointmentDate.getTime() > now + 90 * 24 * 60 * 60 * 1000) {
    const error = new Error('Appointments can only be scheduled up to 90 days in advance.');
    error.statusCode = 400;
    throw error;
  }

  // 4. Concurrency Guard: in-flight mutex per user and target time slot
  const userLockKey = `user_${user.id}`;
  const slotDateKey = appointmentDate.toISOString().slice(0, 16);
  const slotLockKey = `slot_${slotDateKey}`;

  if (activeUserBookings.has(userLockKey)) {
    const error = new Error('An appointment request is currently being processed for your account. Please wait a moment.');
    error.statusCode = 429;
    throw error;
  }

  if (activeSlotBookings.has(slotLockKey)) {
    const conflictError = new Error('This time slot was just reserved by another patient. Please select an alternate slot.');
    conflictError.statusCode = 409;
    throw conflictError;
  }

  // 5. Anti-Abuse Guard: Cooldown check (prevent rapid sequential submissions within 15 seconds)
  const recentUserBooking = await Appointment.findOne({
    where: {
      user_id: user.id,
      createdAt: { [Op.gte]: new Date(now - 15 * 1000) },
    },
    attributes: ['id'],
  });
  if (recentUserBooking) {
    const error = new Error('You recently submitted an appointment request. Please wait a moment before booking another.');
    error.statusCode = 429;
    throw error;
  }

  // 6. Anti-Abuse Guard: Maximum 3 active upcoming appointments per patient
  const activeUpcomingCount = await Appointment.count({
    where: {
      user_id: user.id,
      status: { [Op.in]: [0, 1] }, // 0 = Pending, 1 = Confirmed
      is_delete: 0,
      preferred_date_time: { [Op.gte]: new Date() },
    },
  });
  if (activeUpcomingCount >= 3) {
    const error = new Error('You have reached the maximum limit of 3 active upcoming appointments. Please attend or manage your existing appointments before booking another.');
    error.statusCode = 400;
    throw error;
  }

  // 7. Anti-Abuse Guard: Prevent same-day duplicate active appointment for the same user
  const targetDayStart = new Date(appointmentDate);
  targetDayStart.setHours(0, 0, 0, 0);
  const targetDayEnd = new Date(appointmentDate);
  targetDayEnd.setHours(23, 59, 59, 999);

  const existingUserDayAppt = await Appointment.findOne({
    where: {
      user_id: user.id,
      preferred_date_time: {
        [Op.between]: [targetDayStart, targetDayEnd],
      },
      status: { [Op.in]: [0, 1] },
      is_delete: 0,
    },
    attributes: ['id'],
  });
  if (existingUserDayAppt) {
    const error = new Error('You already have an active appointment scheduled for this date. Please manage your existing appointment or select another day.');
    error.statusCode = 409;
    throw error;
  }

  // 8. Managed Transaction with row-level lock and deadlock retry
  activeUserBookings.add(userLockKey);
  activeSlotBookings.add(slotLockKey);

  try {
    const executeBooking = async () => {
      return await sequelize.transaction(async (t) => {
        // Check if slot within 25 minutes window is already occupied by active appointment
        const slotStart = new Date(appointmentDate.getTime() - 25 * 60 * 1000);
        const slotEnd = new Date(appointmentDate.getTime() + 25 * 60 * 1000);

        const existingAppointment = await Appointment.findOne({
          where: {
            preferred_date_time: {
              [Op.between]: [slotStart, slotEnd],
            },
            status: {
              [Op.in]: [0, 1], // 0 = Pending, 1 = Confirmed
            },
            is_delete: 0,
          },
          transaction: t,
          lock: t.LOCK.UPDATE, // Enforces exclusive lock in MySQL
        });

        if (existingAppointment) {
          const conflictError = new Error('This time slot was just reserved by another patient. Please select an alternate slot.');
          conflictError.statusCode = 409; // HTTP 409 Conflict
          throw conflictError;
        }

        // Insert new appointment
        const appointment = await Appointment.create({
          user_id: user.id,
          treatment_id: treatment.id,
          preferred_date_time: appointmentDate,
          message: data.message ? data.message.trim() : '',
          status: 0, // Pending
          is_delete: 0,
          admin_notes: null,
        }, { transaction: t });

        const appointmentWithUser = {
          ...appointment.toJSON(),
          patient_name: user.full_name,
          email: user.email,
          phone: user.mobile,
          user,
        };

        // Asynchronously dispatch email to both patient and doctor
        t.afterCommit(() => {
          sendAppointmentConfirmation({ appointment: appointmentWithUser, treatment }).catch(() => {});
          sendAppointmentAlert({ appointment: appointmentWithUser, treatment }).catch(() => {});
        });

        return {
          id: appointment.id,
          reference_id: appointment.id,
          user_id: user.id,
          patient_name: user.full_name,
          email: user.email,
          phone: user.mobile,
          preferred_date_time: appointment.preferred_date_time,
          status: appointment.status,
          message: appointment.message,
          treatment: {
            id: treatment.id,
            title: treatment.title,
            slug: treatment.slug,
            price: treatment.price ?? 0,
            duration: treatment.duration,
            category_id: treatment.category_id,
          },
          createdAt: appointment.createdAt,
        };
      });
    };

    let attempts = 0;
    while (attempts < 3) {
      try {
        return await executeBooking();
      } catch (err) {
        attempts++;
        const isDeadlock =
          err.name === 'SequelizeDatabaseError' &&
          (err.original?.code === 'ER_LOCK_DEADLOCK' || err.message?.includes('Deadlock'));
        if (isDeadlock && attempts < 3) {
          await new Promise((resolve) => setTimeout(resolve, 50 * attempts));
          continue;
        }
        throw err;
      }
    }
  } finally {
    activeUserBookings.delete(userLockKey);
    activeSlotBookings.delete(slotLockKey);
  }
};

/**
 * Retrieve paginated appointments for admin management with multi-criteria filtering
 */
export const getAdminAppointments = async ({
  page = 1,
  limit = 10,
  status,
  search,
  startDate,
  endDate,
  treatmentId,
}) => {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
  const offset = (pageNum - 1) * limitNum;

  const where = { is_delete: 0 };

  // Status filtering (0: Pending, 1: Confirmed, 2: Completed, 3: Cancelled)
  if (status !== undefined && status !== null && status !== '' && status !== 'all') {
    where.status = parseInt(status, 10);
  }

  // Treatment filtering
  if (treatmentId) {
    where.treatment_id = parseInt(treatmentId, 10);
  }

  // Date range filtering
  if (startDate && endDate) {
    where.preferred_date_time = {
      [Op.between]: [new Date(`${startDate}T00:00:00.000Z`), new Date(`${endDate}T23:59:59.999Z`)],
    };
  } else if (startDate) {
    where.preferred_date_time = {
      [Op.gte]: new Date(`${startDate}T00:00:00.000Z`),
    };
  } else if (endDate) {
    where.preferred_date_time = {
      [Op.lte]: new Date(`${endDate}T23:59:59.999Z`),
    };
  }

  // Search filtering (patient name, email, mobile via user association)
  if (search && search.trim()) {
    const term = `%${search.trim()}%`;
    where[Op.or] = [
      sequelize.where(sequelize.col('user.full_name'), { [Op.like]: term }),
      sequelize.where(sequelize.col('user.email'), { [Op.like]: term }),
      sequelize.where(sequelize.col('user.mobile'), { [Op.like]: term }),
    ];
  }

  const { count, rows } = await Appointment.findAndCountAll({
    where,
    limit: limitNum,
    offset,
    subQuery: false,
    distinct: true,
    order: [['preferred_date_time', 'DESC']],
    include: [
      {
        model: Treatment,
        as: 'treatment',
        attributes: ['id', 'title', 'slug', 'category_id', 'price', 'duration'],
      },
      {
        model: UserMaster,
        as: 'user',
        attributes: ['id', 'full_name', 'email', 'mobile', 'profile_image'],
      },
    ],
  });

  const formattedRows = rows.map((appt) => {
    const raw = appt.toJSON();
    return {
      ...raw,
      reference_id: appt.id,
      patient_name: raw.user?.full_name || '',
      email: raw.user?.email || '',
      phone: raw.user?.mobile || '',
    };
  });

  return {
    appointments: formattedRows,
    total: count,
    totalPages: Math.ceil(count / limitNum),
    currentPage: pageNum,
    limit: limitNum,
  };
};

/**
 * Get single appointment by ID
 */
export const getAppointmentById = async (id) => {
  const appointment = await Appointment.findOne({
    where: {
      id,
      is_delete: 0,
    },
    include: [
      {
        model: Treatment,
        as: 'treatment',
        attributes: ['id', 'title', 'slug', 'category_id', 'price', 'duration'],
      },
      {
        model: UserMaster,
        as: 'user',
        attributes: ['id', 'full_name', 'email', 'mobile', 'profile_image'],
      },
    ],
  });

  if (!appointment) {
    const error = new Error('Appointment not found');
    error.statusCode = 404;
    throw error;
  }

  const raw = appointment.toJSON();
  return {
    ...raw,
    reference_id: appointment.id,
    patient_name: raw.user?.full_name || '',
    email: raw.user?.email || '',
    phone: raw.user?.mobile || '',
  };
};

/**
 * Update appointment status and/or admin notes
 */
export const updateAppointment = async (id, data) => {
  const appointment = await Appointment.findOne({
    where: {
      id,
      is_delete: 0,
    },
    include: [
      {
        model: Treatment,
        as: 'treatment',
        attributes: ['id', 'title', 'slug', 'category_id', 'price', 'duration'],
      },
      {
        model: UserMaster,
        as: 'user',
        attributes: ['id', 'full_name', 'email', 'mobile', 'profile_image'],
      },
    ],
  });
  if (!appointment) {
    const error = new Error('Appointment not found');
    error.statusCode = 404;
    throw error;
  }

  const previousStatus = appointment.status;
  const updates = {};
  if (data.status !== undefined && data.status !== null) {
    updates.status = parseInt(data.status, 10);
  }

  const reason = (data.cancellation_reason || '').trim();

  if (data.admin_notes !== undefined) {
    updates.admin_notes = data.admin_notes;
  } else if (reason && updates.status === 3) {
    const cancelNote = `[Cancellation Reason]: ${reason}`;
    updates.admin_notes = appointment.admin_notes
      ? `${appointment.admin_notes}\n${cancelNote}`
      : cancelNote;
  }

  await appointment.update(updates);

  // Prepare appointment object with patient details for emails
  const apptForEmail = {
    ...appointment.toJSON(),
    ...updates,
    patient_name: appointment.user?.full_name || '',
    email: appointment.user?.email || '',
    phone: appointment.user?.mobile || '',
    user: appointment.user,
    treatment: appointment.treatment,
  };

  // Dispatch action-based notification email to patient on status transition
  if (updates.status !== undefined && updates.status !== previousStatus) {
    if (updates.status === 1) {
      // Status = 1: Confirmed / Approved
      sendAppointmentConfirmed({
        appointment: apptForEmail,
        treatment: appointment.treatment,
      }).catch((err) => {
        logger.error('Failed to dispatch appointment confirmation email for #%s: %s', id, err.message);
      });
    } else if (updates.status === 2) {
      // Status = 2: Completed
      const reviewToken = generateReviewToken({
        appointmentId: appointment.id,
        userId: appointment.user_id,
      });

      sendAppointmentCompleted({
        appointment: apptForEmail,
        treatment: appointment.treatment,
        reviewToken,
      }).catch((err) => {
        logger.error('Failed to dispatch appointment completion email for #%s: %s', id, err.message);
      });
    } else if (updates.status === 3) {
      // Status = 3: Cancelled
      sendAppointmentCancellation({
        appointment: apptForEmail,
        treatment: appointment.treatment,
        reason: reason || updates.admin_notes || appointment.admin_notes,
      }).catch((err) => {
        logger.error('Failed to dispatch appointment cancellation email for #%s: %s', id, err.message);
      });
    }
  }

  return getAppointmentById(id);
};

/**
 * Delete an appointment (Soft delete by setting is_delete = 1)
 */
export const deleteAppointment = async (id) => {
  const appointment = await Appointment.findOne({
    where: {
      id,
      is_delete: 0,
    },
  });
  if (!appointment) {
    const error = new Error('Appointment not found');
    error.statusCode = 404;
    throw error;
  }

  await appointment.update({ is_delete: 1 });
  return { id: parseInt(id, 10), softDeleted: true, message: 'Appointment deleted successfully' };
};

/**
 * Create an appointment directly from the Admin Console (for walk-in patients or phone bookings).
 * Links to an existing patient account if mobile/email matches, or creates a customer profile automatically.
 */
export const createAdminAppointment = async (data) => {
  // 1. Verify treatment
  const treatment = await Treatment.findOne({
    where: {
      id: data.treatment_id,
      is_active: 1,
      is_delete: 0,
    },
  });
  if (!treatment) {
    const error = new Error('The selected treatment is either unavailable or does not exist.');
    error.statusCode = 404;
    throw error;
  }

  // 2. Parse appointment date
  const appointmentDate = new Date(data.preferred_date_time);
  if (isNaN(appointmentDate.getTime())) {
    const error = new Error('Invalid appointment date and time format.');
    error.statusCode = 400;
    throw error;
  }

  // 3. Clean and resolve patient account
  const cleanName = (data.patient_name || '').trim();
  const rawMobile = (data.phone || '').trim();
  const digitsOnly = rawMobile.replace(/\D/g, '');
  const last10 = digitsOnly.slice(-10);
  const formattedMobile = last10.length === 10 ? `+91 ${last10}` : rawMobile;
  const cleanEmail = (data.email || '').trim().toLowerCase();

  // Search existing user by email or mobile
  const whereConditions = [];
  if (cleanEmail) {
    whereConditions.push({ email: cleanEmail });
  }
  if (last10.length >= 10) {
    whereConditions.push({ mobile: last10 });
    whereConditions.push({ mobile: `+91${last10}` });
    whereConditions.push({ mobile: `+91 ${last10}` });
    whereConditions.push({ mobile: { [Op.like]: `%${last10}%` } });
  } else if (rawMobile) {
    whereConditions.push({ mobile: rawMobile });
  }

  let user = null;
  if (whereConditions.length > 0) {
    user = await UserMaster.findOne({
      where: {
        [Op.or]: whereConditions,
        role: ROLES.CUSTOMER,
      },
    });
  }

  // If user does not exist, create a new customer record
  if (!user) {
    const randomHex = crypto.randomBytes ? crypto.randomBytes(16).toString('hex') : Math.random().toString(36);
    const dummyPassword = await bcrypt.hash(randomHex, 10);
    const finalEmail = cleanEmail || `patient_${last10 || Date.now()}@skinglowclinic.local`;

    user = await UserMaster.create({
      full_name: cleanName,
      email: finalEmail,
      mobile: formattedMobile,
      password: dummyPassword,
      role: ROLES.CUSTOMER,
      is_active: 1,
    });
  }

  // 4. Create appointment inside transaction with collision checking
  return await sequelize.transaction(async (t) => {
    const slotStart = new Date(appointmentDate.getTime() - 25 * 60 * 1000);
    const slotEnd = new Date(appointmentDate.getTime() + 25 * 60 * 1000);

    const existingAppointment = await Appointment.findOne({
      where: {
        preferred_date_time: {
          [Op.between]: [slotStart, slotEnd],
        },
        status: {
          [Op.in]: [0, 1], // 0 = Pending, 1 = Confirmed
        },
        is_delete: 0,
      },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (existingAppointment) {
      const conflictError = new Error('This time slot is already reserved by another appointment. Please choose another time.');
      conflictError.statusCode = 409;
      throw conflictError;
    }

    const appointment = await Appointment.create({
      user_id: user.id,
      treatment_id: treatment.id,
      preferred_date_time: appointmentDate,
      message: data.message ? data.message.trim() : '',
      status: data.status !== undefined ? parseInt(data.status, 10) : 1, // Default Confirmed (1)
      is_delete: 0,
      admin_notes: data.admin_notes ? data.admin_notes.trim() : 'Scheduled by Clinic Staff',
    }, { transaction: t });

    const appointmentWithUser = {
      ...appointment.toJSON(),
      patient_name: cleanName || user.full_name,
      email: cleanEmail || user.email,
      phone: formattedMobile || user.mobile,
      user,
    };

    // If an email address is provided, dispatch confirmation email asynchronously
    if (cleanEmail && !cleanEmail.endsWith('@skinglowclinic.local')) {
      t.afterCommit(() => {
        if (appointment.status === 1) {
          sendAppointmentConfirmed({ appointment: appointmentWithUser, treatment }).catch(() => {});
        } else {
          sendAppointmentConfirmation({ appointment: appointmentWithUser, treatment }).catch(() => {});
        }
      });
    }

    return {
      id: appointment.id,
      user_id: user.id,
      patient_name: cleanName || user.full_name,
      email: cleanEmail || user.email,
      phone: formattedMobile || user.mobile,
      preferred_date_time: appointment.preferred_date_time,
      status: appointment.status,
      message: appointment.message,
      admin_notes: appointment.admin_notes,
      treatment: {
        id: treatment.id,
        title: treatment.title,
        price: treatment.price ?? 0,
        duration: treatment.duration,
      },
      createdAt: appointment.createdAt,
    };
  });
};

