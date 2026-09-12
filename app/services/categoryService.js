import { Op } from 'sequelize';
import { Category, Treatment, sequelize } from '../models/index.js';

/**
 * Get active non-deleted categories for public dropdowns and filters
 */
export const getActiveCategories = async () => {
  return Category.findAll({
    where: {
      status: 1,
      is_delete: 0,
    },
    attributes: ['id', 'name', 'status', 'createdAt'],
    order: [['name', 'ASC']],
  });
};

/**
 * Get all non-deleted categories for Admin console with treatment counts
 */
export const getAdminCategories = async (query = {}) => {
  const { search, status } = query;
  const where = { is_delete: 0 };

  if (search && search.trim() !== '') {
    where.name = { [Op.like]: `%${search.trim()}%` };
  }

  if (status !== undefined && status !== null && status !== '' && status !== 'all') {
    where.status = parseInt(status, 10);
  }

  return Category.findAll({
    where,
    attributes: [
      'id',
      'name',
      'status',
      'createdAt',
      'modifiedAt',
      [sequelize.fn('COUNT', sequelize.col('treatments.id')), 'treatmentCount'],
    ],
    include: [
      {
        model: Treatment,
        as: 'treatments',
        attributes: [],
        where: { is_delete: 0 },
        required: false,
      },
    ],
    group: ['categories.id'],
    order: [['id', 'ASC']],
  });
};

/**
 * Get single category by ID
 */
export const getCategoryById = async (id) => {
  const category = await Category.findOne({
    where: { id, is_delete: 0 },
    attributes: ['id', 'name', 'status', 'createdAt', 'modifiedAt'],
  });

  if (!category) {
    const error = new Error('Category not found');
    error.statusCode = 404;
    throw error;
  }

  return category;
};

/**
 * Create new category
 */
export const createCategory = async (data) => {
  const cleanName = data.name.trim();

  // Check uniqueness among non-deleted categories
  const existing = await Category.findOne({
    where: {
      name: cleanName,
      is_delete: 0,
    },
  });

  if (existing) {
    const error = new Error(`Category "${cleanName}" already exists.`);
    error.statusCode = 409;
    throw error;
  }

  return Category.create({
    name: cleanName,
    status: data.status !== undefined ? parseInt(data.status, 10) : 1,
    is_delete: 0,
  });
};

/**
 * Update existing category
 */
export const updateCategory = async (id, data) => {
  const category = await getCategoryById(id);

  if (data.name) {
    const cleanName = data.name.trim();
    if (cleanName.toLowerCase() !== category.name.toLowerCase()) {
      const existing = await Category.findOne({
        where: {
          name: cleanName,
          is_delete: 0,
          id: { [Op.ne]: id },
        },
      });

      if (existing) {
        const error = new Error(`Another category named "${cleanName}" already exists.`);
        error.statusCode = 409;
        throw error;
      }
    }
    category.name = cleanName;
  }

  if (data.status !== undefined) {
    category.status = parseInt(data.status, 10);
  }

  await category.save();
  return category;
};

/**
 * Soft delete category (is_delete = 1)
 */
export const deleteCategory = async (id) => {
  const category = await getCategoryById(id);

  // Check if any active non-deleted treatments currently link to this category
  const linkedTreatmentsCount = await Treatment.count({
    where: { category_id: id, is_delete: 0 },
  });

  if (linkedTreatmentsCount > 0) {
    const error = new Error(
      `Cannot delete category "${category.name}". It is currently linked to ${linkedTreatmentsCount} clinical treatment(s). Please reassign or remove them first.`
    );
    error.statusCode = 400;
    throw error;
  }

  category.is_delete = 1;
  await category.save();

  return { message: `Category "${category.name}" removed successfully.` };
};
