import { Op } from 'sequelize';
import { Faq } from '../models/index.js';

/**
 * Public: Retrieve all active, non-deleted FAQs ordered by latest created first
 */
export const getPublicFaqs = async () => {
  return await Faq.findAll({
    where: {
      is_delete: 0,
      is_active: 1,
    },
    attributes: ['id', 'question', 'answer', 'createdAt'],
    order: [
      ['createdAt', 'DESC'],
      ['id', 'DESC'],
    ],
  });
};

/**
 * Admin: Retrieve paginated FAQs with search and status filtering
 */
export const getAdminFaqs = async ({
  page = 1,
  limit = 10,
  search,
  is_active,
  status,
}) => {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
  const offset = (pageNum - 1) * limitNum;

  const where = { is_delete: 0 };

  const activeParam = is_active !== undefined ? is_active : status;
  if (activeParam !== undefined && activeParam !== null && activeParam !== '' && activeParam !== 'all') {
    where.is_active = (activeParam === '1' || activeParam === 1 || activeParam === 'active') ? 1 : 0;
  }

  if (search && search.trim()) {
    const term = `%${search.trim()}%`;
    where[Op.or] = [
      { question: { [Op.like]: term } },
      { answer: { [Op.like]: term } },
    ];
  }

  const { count, rows } = await Faq.findAndCountAll({
    where,
    limit: limitNum,
    offset,
    order: [
      ['createdAt', 'DESC'],
      ['id', 'DESC'],
    ],
  });

  return {
    faqs: rows,
    total: count,
    totalPages: Math.ceil(count / limitNum),
    currentPage: pageNum,
    limit: limitNum,
  };
};

/**
 * Admin: Get single FAQ by ID
 */
export const getFaqById = async (id) => {
  const faq = await Faq.findOne({
    where: {
      id,
      is_delete: 0,
    },
  });

  if (!faq) {
    const error = new Error('FAQ item not found.');
    error.statusCode = 404;
    throw error;
  }

  return faq;
};

/**
 * Admin: Create new FAQ
 */
export const createFaq = async ({ question, answer, is_active = 1 }) => {
  return await Faq.create({
    question: question.trim(),
    answer: answer.trim(),
    is_active: is_active !== undefined ? Number(is_active) : 1,
    is_delete: 0,
  });
};

/**
 * Admin: Update existing FAQ
 */
export const updateFaq = async (id, data) => {
  const faq = await getFaqById(id);

  const updates = {};
  if (data.question !== undefined) updates.question = data.question.trim();
  if (data.answer !== undefined) updates.answer = data.answer.trim();
  if (data.is_active !== undefined) updates.is_active = Number(data.is_active);

  await faq.update(updates);
  return faq;
};

/**
 * Admin: Soft delete FAQ
 */
export const deleteFaq = async (id) => {
  const faq = await getFaqById(id);
  await faq.update({ is_delete: 1, is_active: 0 });

  return {
    id: faq.id,
    deleted: true,
    message: 'FAQ item deleted successfully.',
  };
};
