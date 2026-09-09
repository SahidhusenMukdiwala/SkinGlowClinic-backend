import { Op } from 'sequelize';
import { Appointment, Inquiry, Treatment } from '../models/index.js';

export const getDashboardStats = async () => {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  // Parallel aggregate queries
  const [
    totalAppointments,
    todayAppointments,
    pendingAppointments,
    confirmedAppointments,
    completedAppointments,
    totalInquiries,
    unreadInquiries,
    recentAppointments,
    recentInquiries,
  ] = await Promise.all([
    Appointment.count(),
    Appointment.count({
      where: {
        preferred_date_time: {
          [Op.between]: [todayStart, todayEnd],
        },
      },
    }),
    Appointment.count({ where: { status: 0 } }),
    Appointment.count({ where: { status: 1 } }),
    Appointment.count({ where: { status: 2 } }),
    Inquiry.count(),
    Inquiry.count({ where: { is_read: 0 } }),
    Appointment.findAll({
      limit: 5,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Treatment,
          as: 'treatment',
          attributes: ['id', 'title', 'slug', 'category'],
        },
      ],
    }),
    Inquiry.findAll({
      limit: 5,
      order: [['createdAt', 'DESC']],
    }),
  ]);

  return {
    kpis: {
      totalAppointments,
      todayAppointments,
      pendingAppointments,
      confirmedAppointments,
      completedAppointments,
      totalInquiries,
      unreadInquiries,
    },
    recentAppointments,
    recentInquiries,
  };
};
