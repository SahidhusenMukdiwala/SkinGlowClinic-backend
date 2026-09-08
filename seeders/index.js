import { seedAdmin } from './seedAdmin.js';
import { seedSettings } from './seedSettings.js';
import { logger } from '../app/utils/logger.js';

export const runSeeders = async () => {
  logger.info(' Running initial database seeders...');
  await seedAdmin();
  await seedSettings();
  logger.info(' Database seeders completed.');
};
