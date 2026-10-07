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

// Appointment ↔ UserMaster
UserMaster.hasMany(Appointment, { foreignKey: 'user_id', as: 'appointments' });
Appointment.belongsTo(UserMaster, { foreignKey: 'user_id', as: 'user' });

// Testimonial ↔ UserMaster
UserMaster.hasMany(Testimonial, { foreignKey: 'user_id', as: 'testimonials' });
Testimonial.belongsTo(UserMaster, { foreignKey: 'user_id', as: 'user' });

// Testimonial ↔ Appointment
Appointment.hasOne(Testimonial, { foreignKey: 'appointment_id', as: 'review' });
Testimonial.belongsTo(Appointment, { foreignKey: 'appointment_id', as: 'appointment' });

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
