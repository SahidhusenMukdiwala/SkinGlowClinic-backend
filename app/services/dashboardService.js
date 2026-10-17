import { Op } from 'sequelize';
import { Appointment, Inquiry, Treatment, UserMaster } from '../models/index.js';

export const getDashboardStats = async () => {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  // Parallel aggregate queries
  const [
    totalAppointments,
    todayAppointments,
    pendingAppointmentsCount,
    confirmedAppointments,
    completedAppointments,
    totalInquiries,
    unreadInquiriesCount,
    pendingAppointmentsRaw,
    unreadInquiries,
    recentAppointmentsRaw,
    recentInquiries,
  ] = await Promise.all([
    Appointment.count({ where: { is_delete: 0 } }),
    Appointment.count({
      where: {
        preferred_date_time: {
          [Op.between]: [todayStart, todayEnd],
        },
        is_delete: 0,
      },
    }),
    Appointment.count({ where: { status: 0, is_delete: 0 } }),
    Appointment.count({ where: { status: 1, is_delete: 0 } }),
    Appointment.count({ where: { status: 2, is_delete: 0 } }),
    Inquiry.count({ where: { is_delete: 0 } }),
    Inquiry.count({ where: { is_read: 0, is_delete: 0 } }),
    // Pending Appointments (status: 0)
    Appointment.findAll({
      where: { status: 0, is_delete: 0 },
      limit: 5,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Treatment,
          as: 'treatment',
          attributes: ['id', 'title', 'slug', 'category_id'],
        },
        {
          model: UserMaster,
          as: 'user',
          attributes: ['id', 'full_name', 'email', 'mobile', 'profile_image'],
        },
      ],
    }),
    // Unread Inquiries (is_read: 0)
    Inquiry.findAll({
      where: { is_read: 0, is_delete: 0 },
      limit: 5,
      order: [['createdAt', 'DESC']],
    }),
    // Recent Appointments (all statuses)
    Appointment.findAll({
      where: { is_delete: 0 },
      limit: 5,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Treatment,
          as: 'treatment',
          attributes: ['id', 'title', 'slug', 'category_id'],
        },
        {
          model: UserMaster,
          as: 'user',
          attributes: ['id', 'full_name', 'email', 'mobile', 'profile_image'],
        },
      ],
    }),
    // Recent Inquiries (all)
    Inquiry.findAll({
      where: { is_delete: 0 },
      limit: 5,
      order: [['createdAt', 'DESC']],
    }),
  ]);

  const mapAppointment = (appt) => {
    const raw = appt.toJSON();
    return {
      ...raw,
      reference_id: appt.id,
      patient_name: raw.user?.full_name || '',
      email: raw.user?.email || '',
      phone: raw.user?.mobile || '',
    };
  };

  return {
    kpis: {
      totalAppointments,
      todayAppointments,
      pendingAppointments: pendingAppointmentsCount,
      confirmedAppointments,
      completedAppointments,
      totalInquiries,
      unreadInquiries: unreadInquiriesCount,
    },
    pendingAppointments: pendingAppointmentsRaw.map(mapAppointment),
    unreadInquiries,
    recentAppointments: recentAppointmentsRaw.map(mapAppointment),
    recentInquiries,
  };
};
