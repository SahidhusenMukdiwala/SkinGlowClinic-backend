import { Testimonial } from '../models/index.js';

export const getActiveTestimonials = async () => {
  return Testimonial.findAll({
    where: { is_active: 1 },
    attributes: ['id', 'patient_name', 'patient_image', 'review_text', 'rating', 'createdAt'],
    order: [['id', 'DESC']],
  });
};
