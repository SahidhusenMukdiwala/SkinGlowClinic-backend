import { sequelize } from '../config/database.js';
import { UserMaster } from './UserMaster.js';
import { SessionMaster } from './SessionMaster.js';
import { SiteSetting } from './SiteSetting.js';
import { Blog } from './Blog.js';
import { Testimonial } from './Testimonial.js';
import { Inquiry } from './Inquiry.js';
import { Treatment } from './Treatment.js';
import { Appointment } from './Appointment.js';
import { Category } from './Category.js';

// Associations
UserMaster.hasMany(SessionMaster, { foreignKey: 'user_id', as: 'sessions', onDelete: 'CASCADE' });
SessionMaster.belongsTo(UserMaster, { foreignKey: 'user_id', as: 'user' });

Category.hasMany(Treatment, { foreignKey: 'category_id', as: 'treatments' });
Treatment.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

Treatment.hasMany(Appointment, { foreignKey: 'treatment_id', as: 'appointments' });
Appointment.belongsTo(Treatment, { foreignKey: 'treatment_id', as: 'treatment' });

export {
  sequelize,
  UserMaster,
  SessionMaster,
  SiteSetting,
  Blog,
  Testimonial,
  Inquiry,
  Category,
  Treatment,
  Appointment,
};
