import { Op } from 'sequelize';
import { Testimonial } from '../models/index.js';
import { uploadBufferToCloudinary } from '../utils/cloudinary.js';

const DEFAULT_PATIENT_AVATAR = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';

export const getActiveTestimonials = async () => {
  return Testimonial.findAll({
    where: { is_active: 1 },
    attributes: ['id', 'patient_name', 'patient_image', 'review_text', 'rating', 'createdAt'],
    order: [['id', 'DESC']],
  });
};

/**
 * Get paginated testimonials for admin
 */
export const getAdminTestimonials = async ({
  page = 1,
  limit = 10,
  search,
  is_active,
}) => {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
  const offset = (pageNum - 1) * limitNum;

  const where = {};

  if (is_active !== undefined && is_active !== null && is_active !== '' && is_active !== 'all') {
    where.is_active = parseInt(is_active, 10);
  }

  if (search && search.trim()) {
    const term = `%${search.trim()}%`;
    where[Op.or] = [
      { patient_name: { [Op.like]: term } },
      { review_text: { [Op.like]: term } },
    ];
  }

  const { count, rows } = await Testimonial.findAndCountAll({
    where,
    limit: limitNum,
    offset,
    order: [['id', 'DESC']],
  });

  return {
    testimonials: rows,
    total: count,
    totalPages: Math.ceil(count / limitNum),
    currentPage: pageNum,
    limit: limitNum,
  };
};

/**
 * Get testimonial by ID
 */
export const getTestimonialById = async (id) => {
  const testimonial = await Testimonial.findByPk(id);
  if (!testimonial) {
    const error = new Error(`Testimonial not found with ID: ${id}`);
    error.statusCode = 404;
    throw error;
  }
  return testimonial;
};

/**
 * Create a new testimonial
 */
export const createTestimonial = async (data, file) => {
  let imageUrl = data.patient_image || DEFAULT_PATIENT_AVATAR;

  if (file && file.buffer) {
    const uploadResult = await uploadBufferToCloudinary(file.buffer, 'skinglowclinic/testimonials');
    imageUrl = uploadResult.secure_url;
  }

  const testimonial = await Testimonial.create({
    patient_name: data.patient_name.trim(),
    patient_image: imageUrl,
    review_text: data.review_text.trim(),
    rating: parseInt(data.rating, 10),
    is_active: data.is_active !== undefined ? parseInt(data.is_active, 10) : 1,
  });

  return testimonial;
};

/**
 * Update an existing testimonial
 */
export const updateTestimonial = async (id, data, file) => {
  const testimonial = await Testimonial.findByPk(id);
  if (!testimonial) {
    const error = new Error(`Testimonial not found with ID: ${id}`);
    error.statusCode = 404;
    throw error;
  }

  let imageUrl = testimonial.patient_image;
  if (file && file.buffer) {
    const uploadResult = await uploadBufferToCloudinary(file.buffer, 'skinglowclinic/testimonials');
    imageUrl = uploadResult.secure_url;
  } else if (data.patient_image !== undefined && data.patient_image.trim()) {
    imageUrl = data.patient_image.trim();
  }

  await testimonial.update({
    patient_name: data.patient_name !== undefined ? data.patient_name.trim() : testimonial.patient_name,
    patient_image: imageUrl,
    review_text: data.review_text !== undefined ? data.review_text.trim() : testimonial.review_text,
    rating: data.rating !== undefined ? parseInt(data.rating, 10) : testimonial.rating,
    is_active: data.is_active !== undefined ? parseInt(data.is_active, 10) : testimonial.is_active,
  });

  return testimonial;
};

/**
 * Delete a testimonial
 */
export const deleteTestimonial = async (id) => {
  const testimonial = await Testimonial.findByPk(id);
  if (!testimonial) {
    const error = new Error(`Testimonial not found with ID: ${id}`);
    error.statusCode = 404;
    throw error;
  }

  await testimonial.destroy();
  return {
    id: parseInt(id, 10),
    message: 'Testimonial deleted successfully',
  };
};
