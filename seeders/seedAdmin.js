import bcrypt from 'bcryptjs';
import { UserMaster } from '../app/models/index.js';
import { logger } from '../app/utils/logger.js';

export const seedAdmin = async () => {
  try {
    const count = await UserMaster.count();
    if (count === 0) {
      const hashedPassword = await bcrypt.hash('Admin@123', 12);
      await UserMaster.create({
        full_name: 'Dr. Aisha Sharma (Super Admin)',
        email: 'admin@skinglow.com',
        password: hashedPassword,
        role: 0, // Super Admin
      });
      logger.info(' Default admin user created: admin@skinglow.com / Admin@123');
    } else {
      logger.info('ℹ️ Admin user already exists. Skipping admin seed.');
    }
  } catch (error) {
    logger.error('Error seeding admin user:', error);
  }
};
