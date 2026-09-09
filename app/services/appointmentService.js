import { Op } from 'sequelize';
import { sequelize, Appointment, Treatment } from '../models/index.js';
import { sendAppointmentConfirmation, sendAppointmentAlert } from '../utils/email.js';

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
    },
    attributes: ['preferred_date_time'],
  });

  const bookedSlots = new Set();
  for (const appt of appointments) {
    const d = new Date(appt.preferred_date_time);
    const istDate = d.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
    const utcDate = d.toISOString().split('T')[0];

    if (istDate === dateStr || utcDate === dateStr) {
      const activeZone = istDate === dateStr ? 'Asia/Kolkata' : 'UTC';
      const formattedTime = d.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: activeZone,
      });
      bookedSlots.add(formattedTime);
    }
  }

  return Array.from(bookedSlots);
};

/**
 * Atomically create an appointment with row-level lock to prevent double booking race conditions
 */
export const createAppointment = async (data) => {
  // 1. Verify treatment exists
  const treatment = await Treatment.findByPk(data.treatment_id);
  if (!treatment || !treatment.is_active) {
    const error = new Error('The selected treatment is either unavailable or does not exist.');
    error.statusCode = 404;
    throw error;
  }

  // 2. Verify appointment date is in the future
  const appointmentDate = new Date(data.preferred_date_time);
  if (isNaN(appointmentDate.getTime())) {
    const error = new Error('Invalid appointment date and time format.');
    error.statusCode = 400;
    throw error;
  }

  if (appointmentDate.getTime() <= Date.now()) {
    const error = new Error('Appointment date and time must be scheduled for a future slot.');
    error.statusCode = 400;
    throw error;
  }

  // 3. Managed Transaction with row-level concurrency lock
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
      treatment_id: treatment.id,
      patient_name: data.patient_name.trim(),
      email: data.email.trim().toLowerCase(),
      phone: data.phone.trim(),
      preferred_date_time: appointmentDate,
      message: data.message ? data.message.trim() : '',
      status: 0, // Pending
      admin_notes: null,
    }, { transaction: t });

    // Asynchronously dispatch emails only after transaction commits successfully
    t.afterCommit(() => {
      sendAppointmentConfirmation({ appointment, treatment }).catch(() => {});
      sendAppointmentAlert({ appointment, treatment }).catch(() => {});
    });

    return {
      id: appointment.id,
      reference_id: `SG-${String(appointment.id).padStart(5, '0')}`,
      patient_name: appointment.patient_name,
      email: appointment.email,
      phone: appointment.phone,
      preferred_date_time: appointment.preferred_date_time,
      status: appointment.status,
      message: appointment.message,
      treatment: {
        id: treatment.id,
        title: treatment.title,
        slug: treatment.slug,
        duration: treatment.duration,
        category: treatment.category,
      },
      createdAt: appointment.createdAt,
    };
  });
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

  const where = {};

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

  // Search filtering (patient_name, email, phone)
  if (search && search.trim()) {
    const term = `%${search.trim()}%`;
    where[Op.or] = [
      { patient_name: { [Op.like]: term } },
      { email: { [Op.like]: term } },
      { phone: { [Op.like]: term } },
    ];
  }

  const { count, rows } = await Appointment.findAndCountAll({
    where,
    limit: limitNum,
    offset,
    order: [['preferred_date_time', 'DESC']],
    include: [
      {
        model: Treatment,
        as: 'treatment',
        attributes: ['id', 'title', 'slug', 'category', 'duration'],
      },
    ],
  });

  const formattedRows = rows.map((appt) => ({
    ...appt.toJSON(),
    reference_id: `SG-${String(appt.id).padStart(5, '0')}`,
  }));

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
  const appointment = await Appointment.findByPk(id, {
    include: [
      {
        model: Treatment,
        as: 'treatment',
        attributes: ['id', 'title', 'slug', 'category', 'duration'],
      },
    ],
  });

  if (!appointment) {
    const error = new Error('Appointment not found');
    error.statusCode = 404;
    throw error;
  }

  return {
    ...appointment.toJSON(),
    reference_id: `SG-${String(appointment.id).padStart(5, '0')}`,
  };
};

/**
 * Update appointment status and/or admin notes
 */
export const updateAppointment = async (id, data) => {
  const appointment = await Appointment.findByPk(id);
  if (!appointment) {
    const error = new Error('Appointment not found');
    error.statusCode = 404;
    throw error;
  }

  const updates = {};
  if (data.status !== undefined && data.status !== null) {
    updates.status = parseInt(data.status, 10);
  }
  if (data.admin_notes !== undefined) {
    updates.admin_notes = data.admin_notes;
  }

  await appointment.update(updates);

  return getAppointmentById(id);
};

/**
 * Delete an appointment
 */
export const deleteAppointment = async (id) => {
  const appointment = await Appointment.findByPk(id);
  if (!appointment) {
    const error = new Error('Appointment not found');
    error.statusCode = 404;
    throw error;
  }

  await appointment.destroy();
  return { id: parseInt(id, 10), message: 'Appointment deleted successfully' };
};

