import { Category } from '../app/models/index.js';
import { logger } from '../app/utils/logger.js';

const initialCategories = [
  { id: 1, name: 'Skin Care', status: 1, is_delete: 0 },
  { id: 2, name: 'Hair Restoration', status: 1, is_delete: 0 },
  { id: 3, name: 'Laser Treatments', status: 1, is_delete: 0 },
  { id: 4, name: 'Anti-Aging & Injectables', status: 1, is_delete: 0 },
  { id: 5, name: 'Body Contouring', status: 1, is_delete: 0 },
];

export const seedCategories = async () => {
  try {
    for (const cat of initialCategories) {
      const existing = await Category.findOne({ where: { id: cat.id } });
      if (!existing) {
        await Category.create(cat);
        logger.info(`Seeded category: ${cat.name} (ID: ${cat.id})`);
      } else {
        await existing.update({ name: cat.name, status: cat.status, is_delete: cat.is_delete });
      }
    }
    logger.info('Categories seeding completed successfully.');
  } catch (error) {
    logger.error('Error seeding categories:', error);
    throw error;
  }
};

// If run directly
if (process.argv[1]?.endsWith('seedCategories.js')) {
  import('../app/config/database.js').then(async () => {
    await seedCategories();
    process.exit(0);
  });
}
