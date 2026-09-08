import { Op } from 'sequelize';
import { Treatment } from '../models/index.js';

export const getActiveTreatments = async (category) => {
  const whereClause = { is_active: 1 };
  if (category) {
    const parsedCategory = parseInt(category, 10);
    if (!isNaN(parsedCategory)) {
      whereClause.category = parsedCategory;
    }
  }

  return Treatment.findAll({
    where: whereClause,
    attributes: [
      'id',
      'title',
      'slug',
      'category',
      'short_description',
      'image_url',
      'duration',
      'display_order',
      'createdAt',
    ],
    order: [
      ['display_order', 'ASC'],
      ['id', 'ASC'],
    ],
  });
};

export const getTreatmentBySlug = async (slug) => {
  const treatment = await Treatment.findOne({
    where: {
      slug,
      is_active: 1,
    },
  });

  if (!treatment) {
    return null;
  }

  // Fetch up to 3 related treatments in same category or adjacent
  const relatedTreatments = await Treatment.findAll({
    where: {
      id: { [Op.ne]: treatment.id },
      category: treatment.category,
      is_active: 1,
    },
    attributes: ['id', 'title', 'slug', 'category', 'short_description', 'image_url', 'duration'],
    limit: 3,
    order: [['display_order', 'ASC']],
  });

  return {
    treatment,
    related: relatedTreatments,
  };
};
