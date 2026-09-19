/**
 * System-wide User Role Definitions & Permission Groups
 *
 * 0 = Super Admin (Full system, doctor & operational privileges)
 * 1 = Admin (Clinical staff & operational management)
 * 2 = Customer / Patient (Appointments, inquiries & personal profile)
 */

export const ROLES = Object.freeze({
  SUPER_ADMIN: 0,
  ADMIN: 1,
  CUSTOMER: 2,
});

export const ROLE_NAMES = Object.freeze({
  [ROLES.SUPER_ADMIN]: 'Super Admin',
  [ROLES.ADMIN]: 'Admin',
  [ROLES.CUSTOMER]: 'Customer',
});

export const ROLE_GROUPS = Object.freeze({
  SUPER_ADMIN_ONLY: Object.freeze([ROLES.SUPER_ADMIN]),
  ADMINS_ONLY: Object.freeze([ROLES.SUPER_ADMIN, ROLES.ADMIN]),
  CUSTOMERS_ONLY: Object.freeze([ROLES.CUSTOMER]),
  ALL_AUTHENTICATED: Object.freeze([ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.CUSTOMER]),
});

/**
 * Check if a role has administrative privileges (Super Admin or Admin)
 */
export const isAdminRole = (role) => {
  return role === ROLES.SUPER_ADMIN || role === ROLES.ADMIN;
};

/**
 * Check if a role is strictly a customer/patient
 */
export const isCustomerRole = (role) => {
  return role === ROLES.CUSTOMER;
};

/**
 * Get human-readable role name safely
 */
export const getRoleName = (role) => {
  return ROLE_NAMES[role] || 'Unknown';
};
