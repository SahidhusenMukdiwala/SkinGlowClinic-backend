import { Op } from 'sequelize';
import { UserMaster, SessionMaster, Appointment, Treatment } from '../models/index.js';

/**
 * Get paginated list of customers (role: 2) for Admin Console with search and filters
 */
export const getAdminCustomers = async (query = {}) => {
  const { page = 1, limit = 10, search, status } = query;

  const parsedPage = Math.max(1, parseInt(page, 10) || 1);
  const parsedLimit = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
  const offset = (parsedPage - 1) * parsedLimit;

  // Base condition: Strictly customer role 2
  const where = {
    role: 2,
  };

  // Status filtering: 'all', '1'/'active', '0'/'inactive'
  if (status !== undefined && status !== null && status !== '' && status !== 'all') {
    if (status === '1' || status === 'active' || status === 1) {
      where.is_active = 1;
    } else if (status === '0' || status === 'inactive' || status === 0) {
      where.is_active = 0;
    }
  }

  // Search filtering across full_name, email, and mobile
  if (search && search.trim() !== '') {
    const cleanSearch = search.trim();
    const digitsOnly = cleanSearch.replace(/\D/g, '');

    const searchConditions = [
      { full_name: { [Op.like]: `%${cleanSearch}%` } },
      { email: { [Op.like]: `%${cleanSearch}%` } },
      { mobile: { [Op.like]: `%${cleanSearch}%` } },
    ];

    if (digitsOnly.length >= 4) {
      searchConditions.push({ mobile: { [Op.like]: `%${digitsOnly}%` } });
    }

    where[Op.and] = [
      ...(where[Op.and] || []),
      { [Op.or]: searchConditions },
    ];
  }

  const [{ count, rows }, totalCount, activeCount, inactiveCount] = await Promise.all([
    UserMaster.findAndCountAll({
      where,
      attributes: ['id', 'full_name', 'email', 'mobile', 'role', 'is_active', 'createdAt', 'updatedAt'],
      order: [['createdAt', 'DESC']],
      limit: parsedLimit,
      offset,
    }),
    UserMaster.count({ where: { role: 2 } }),
    UserMaster.count({ where: { role: 2, is_active: 1 } }),
    UserMaster.count({ where: { role: 2, is_active: 0 } }),
  ]);

  return {
    customers: rows,
    pagination: {
      total: count,
      page: parsedPage,
      limit: parsedLimit,
      totalPages: Math.ceil(count / parsedLimit) || 1,
    },
    stats: {
      total: totalCount,
      active: activeCount,
      inactive: inactiveCount,
    },
  };
};

/**
 * Get customer by ID along with their appointment booking history
 */
export const getCustomerById = async (id) => {
  const customer = await UserMaster.findOne({
    where: { id, role: 2 },
    attributes: ['id', 'full_name', 'email', 'mobile', 'role', 'is_active', 'createdAt', 'updatedAt'],
  });

  if (!customer) {
    const error = new Error('Customer account not found or is not a patient profile.');
    error.statusCode = 404;
    throw error;
  }

  // Fetch appointment history associated with this patient's email or phone
  const appointments = await Appointment.findAll({
    where: {
      [Op.or]: [
        { email: customer.email },
        { phone: customer.mobile },
      ],
      is_delete: 0,
    },
    include: [
      {
        model: Treatment,
        as: 'treatment',
        attributes: ['id', 'title', 'slug', 'image_url'],
      },
    ],
    order: [['preferred_date_time', 'DESC']],
  });

  return {
    customer,
    appointments,
  };
};

/**
 * Update customer active/inactive status and revoke sessions if deactivated
 */
export const updateCustomerStatus = async (id, isActive) => {
  const customer = await UserMaster.findOne({
    where: { id, role: 2 },
  });

  if (!customer) {
    const error = new Error('Customer account not found or is not a patient profile.');
    error.statusCode = 404;
    throw error;
  }

  const targetStatus = isActive ? 1 : 0;
  await customer.update({ is_active: targetStatus });

  // Security enforcement: When deactivating, revoke all active sessions immediately
  if (targetStatus === 0) {
    await SessionMaster.destroy({
      where: { user_id: id },
    });
  }

  return {
    id: customer.id,
    full_name: customer.full_name,
    email: customer.email,
    mobile: customer.mobile,
    role: customer.role,
    is_active: customer.is_active,
    updatedAt: customer.updatedAt,
  };
};
