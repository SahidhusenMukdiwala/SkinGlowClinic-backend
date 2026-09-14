import { Op } from 'sequelize';
import { Inquiry } from '../models/index.js';
import { sendInquiryNotification } from '../utils/email.js';

export const createInquiry = async (data) => {
  const inquiry = await Inquiry.create({
    name: data.name.trim(),
    email: data.email.trim().toLowerCase(),
    phone: data.phone.trim(),
    subject: data.subject.trim(),
    message: data.message.trim(),
    is_read: 0,
  });

  // Trigger asynchronous email alert to clinic (non-blocking)
  sendInquiryNotification(inquiry).catch(() => {});

  return inquiry;
};

/**
 * Retrieve paginated inquiries for admin triage with read status and keyword search
 */
export const getAdminInquiries = async ({
  page = 1,
  limit = 10,
  is_read,
  search,
}) => {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
  const offset = (pageNum - 1) * limitNum;

  const where = { is_delete: 0 };

  if (is_read !== undefined && is_read !== null && is_read !== '' && is_read !== 'all') {
    where.is_read = parseInt(is_read, 10);
  }

  if (search && search.trim()) {
    const term = `%${search.trim()}%`;
    where[Op.or] = [
      { name: { [Op.like]: term } },
      { email: { [Op.like]: term } },
      { phone: { [Op.like]: term } },
      { subject: { [Op.like]: term } },
    ];
  }

  const { count, rows } = await Inquiry.findAndCountAll({
    where,
    limit: limitNum,
    offset,
    order: [['createdAt', 'DESC']],
  });

  return {
    inquiries: rows,
    total: count,
    totalPages: Math.ceil(count / limitNum),
    currentPage: pageNum,
    limit: limitNum,
  };
};

/**
 * Get inquiry by ID
 */
export const getInquiryById = async (id) => {
  const inquiry = await Inquiry.findOne({ where: { id, is_delete: 0 } });
  if (!inquiry) {
    const error = new Error('Inquiry not found');
    error.statusCode = 404;
    throw error;
  }
  return inquiry;
};

/**
 * Update inquiry read status
 */
export const updateInquiryReadStatus = async (id, is_read = 1) => {
  const inquiry = await Inquiry.findOne({ where: { id, is_delete: 0 } });
  if (!inquiry) {
    const error = new Error('Inquiry not found');
    error.statusCode = 404;
    throw error;
  }

  await inquiry.update({ is_read: parseInt(is_read, 10) });
  return inquiry;
};

/**
 * Delete inquiry
 */
export const deleteInquiry = async (id) => {
  const inquiry = await Inquiry.findOne({ where: { id, is_delete: 0 } });
  if (!inquiry) {
    const error = new Error('Inquiry not found');
    error.statusCode = 404;
    throw error;
  }

  await inquiry.update({ is_delete: 1 });
  return { id: parseInt(id, 10), softDeleted: true, message: 'Inquiry deleted successfully' };
};

