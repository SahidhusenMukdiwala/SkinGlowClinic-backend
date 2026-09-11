import { Op } from 'sequelize';
import { Treatment, Appointment, Category } from '../models/index.js';
import { uploadBufferToCloudinary, deleteFromCloudinary } from '../utils/cloudinary.js';

/**
 * Generate a clean URL-friendly slug
 */
const generateSlug = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const getActiveTreatments = async (category) => {
  const whereClause = { is_active: 1 };
  if (category) {
    const parsedCategory = parseInt(category, 10);
    if (!isNaN(parsedCategory) && parsedCategory > 0) {
      whereClause.category_id = parsedCategory;
    }
  }

  return Treatment.findAll({
    where: whereClause,
    attributes: [
      'id',
      'title',
      'slug',
      'category_id',
      'short_description',
      'image_url',
      'duration',
      'display_order',
      'createdAt',
    ],
    include: [
      {
        model: Category,
        as: 'category',
        attributes: ['id', 'name'],
      },
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
    include: [
      {
        model: Category,
        as: 'category',
        attributes: ['id', 'name'],
      },
    ],
  });

  if (!treatment) {
    return null;
  }

  // Fetch up to 3 related treatments in same category or adjacent
  const relatedTreatments = await Treatment.findAll({
    where: {
      id: { [Op.ne]: treatment.id },
      category_id: treatment.category_id,
      is_active: 1,
    },
    attributes: ['id', 'title', 'slug', 'category_id', 'short_description', 'image_url', 'duration'],
    include: [
      {
        model: Category,
        as: 'category',
        attributes: ['id', 'name'],
      },
    ],
    limit: 3,
    order: [['display_order', 'ASC']],
  });

  return {
    treatment,
    related: relatedTreatments,
  };
};

/**
 * Get paginated treatments for Admin Console
 */
export const getAdminTreatments = async ({
  page = 1,
  limit = 10,
  category,
  category_id,
  is_active,
  search,
}) => {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
  const offset = (pageNum - 1) * limitNum;

  const where = {};
  const filterCat = category_id || category;

  if (filterCat !== undefined && filterCat !== null && filterCat !== '' && filterCat !== 'all') {
    where.category_id = parseInt(filterCat, 10);
  }

  if (is_active !== undefined && is_active !== null && is_active !== '' && is_active !== 'all') {
    where.is_active = parseInt(is_active, 10);
  }

  if (search && search.trim()) {
    const term = `%${search.trim()}%`;
    where[Op.or] = [
      { title: { [Op.like]: term } },
      { slug: { [Op.like]: term } },
      { short_description: { [Op.like]: term } },
    ];
  }

  const { count, rows } = await Treatment.findAndCountAll({
    where,
    include: [
      {
        model: Category,
        as: 'category',
        attributes: ['id', 'name'],
      },
    ],
    limit: limitNum,
    offset,
    order: [
      ['display_order', 'ASC'],
      ['id', 'DESC'],
    ],
  });

  return {
    treatments: rows,
    total: count,
    totalPages: Math.ceil(count / limitNum),
    currentPage: pageNum,
    limit: limitNum,
  };
};

/**
 * Get single treatment by ID
 */
export const getTreatmentById = async (id) => {
  const treatment = await Treatment.findByPk(id, {
    include: [
      {
        model: Category,
        as: 'category',
        attributes: ['id', 'name'],
      },
    ],
  });
  if (!treatment) {
    const error = new Error(`Treatment not found with ID: ${id}`);
    error.statusCode = 404;
    throw error;
  }
  return treatment;
};

/**
 * Create a new treatment
 */
export const createTreatment = async (data, file) => {
  let slug = data.slug ? generateSlug(data.slug) : generateSlug(data.title);

  // Check slug uniqueness
  const existingWithSlug = await Treatment.findOne({ where: { slug } });
  if (existingWithSlug) {
    slug = `${slug}-${Date.now().toString().slice(-4)}`;
  }

  let imageUrl = data.image_url || null;
  if (file && file.buffer) {
    const uploadResult = await uploadBufferToCloudinary(file.buffer, 'skinglowclinic/treatments');
    imageUrl = uploadResult.secure_url;
  }

  const rawCat = data.category_id !== undefined ? data.category_id : data.category;
  const category_id = parseInt(rawCat, 10);

  const treatment = await Treatment.create({
    title: data.title.trim(),
    slug,
    category_id,
    short_description: data.short_description ? data.short_description.trim() : null,
    full_description: data.full_description ? data.full_description.trim() : null,
    image_url: imageUrl,
    duration: data.duration ? data.duration.trim() : null,
    is_active: data.is_active !== undefined ? parseInt(data.is_active, 10) : 1,
    display_order: data.display_order !== undefined ? parseInt(data.display_order, 10) : 0,
  });

  return getTreatmentById(treatment.id);
};

/**
 * Update an existing treatment
 */
export const updateTreatment = async (id, data, file) => {
  const treatment = await Treatment.findByPk(id);
  if (!treatment) {
    const error = new Error(`Treatment not found with ID: ${id}`);
    error.statusCode = 404;
    throw error;
  }

  let slug = treatment.slug;
  if (data.slug && data.slug !== treatment.slug) {
    slug = generateSlug(data.slug);
    const existingWithSlug = await Treatment.findOne({
      where: {
        slug,
        id: { [Op.ne]: id },
      },
    });
    if (existingWithSlug) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }
  }

  let imageUrl = treatment.image_url;
  if (file && file.buffer) {
    const uploadResult = await uploadBufferToCloudinary(file.buffer, 'skinglowclinic/treatments');
    imageUrl = uploadResult.secure_url;
  } else if (data.image_url !== undefined) {
    imageUrl = data.image_url;
  }

  const rawCat = data.category_id !== undefined ? data.category_id : data.category;
  const updatedCategoryId = rawCat !== undefined ? parseInt(rawCat, 10) : treatment.category_id;

  await treatment.update({
    title: data.title !== undefined ? data.title.trim() : treatment.title,
    slug,
    category_id: updatedCategoryId,
    short_description: data.short_description !== undefined ? data.short_description : treatment.short_description,
    full_description: data.full_description !== undefined ? data.full_description : treatment.full_description,
    image_url: imageUrl,
    duration: data.duration !== undefined ? data.duration : treatment.duration,
    is_active: data.is_active !== undefined ? parseInt(data.is_active, 10) : treatment.is_active,
    display_order: data.display_order !== undefined ? parseInt(data.display_order, 10) : treatment.display_order,
  });

  return getTreatmentById(treatment.id);
};

/**
 * Delete a treatment (Soft delete if booked in appointments, otherwise hard delete)
 */
export const deleteTreatment = async (id) => {
  const treatment = await Treatment.findByPk(id);
  if (!treatment) {
    const error = new Error(`Treatment not found with ID: ${id}`);
    error.statusCode = 404;
    throw error;
  }

  // Check if any appointments reference this treatment
  const appointmentCount = await Appointment.count({ where: { treatment_id: id } });
  if (appointmentCount > 0) {
    // Soft delete / deactivate to maintain referential integrity
    await treatment.update({ is_active: 0 });
    return {
      id: treatment.id,
      softDeleted: true,
      message: 'Treatment has existing patient appointments and was marked inactive instead of permanently deleted.',
    };
  }

  await treatment.destroy();
  return {
    id: parseInt(id, 10),
    softDeleted: false,
    message: 'Treatment deleted permanently.',
  };
};
