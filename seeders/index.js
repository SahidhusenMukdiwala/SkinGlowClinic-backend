import { seedAdmin } from './seedAdmin.js';
import { seedSettings } from './seedSettings.js';
import { seedTreatments } from './seedTreatments.js';
import { seedTestimonials } from './seedTestimonials.js';
import { logger } from '../app/utils/logger.js';

export const runSeeders = async () => {
  logger.info(' Running initial database seeders...');
  await seedAdmin();
  await seedSettings();
  await seedTreatments();
  await seedTestimonials();
  logger.info(' Database seeders completed.');
};
