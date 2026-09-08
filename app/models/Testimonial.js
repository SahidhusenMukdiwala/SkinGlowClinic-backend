import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const Testimonial = sequelize.define('testimonials', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  patient_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  patient_image: {
    type: DataTypes.STRING(500),
    allowNull: false,
  },
  review_text: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  rating: {
    type: DataTypes.TINYINT,
    allowNull: false,
    validate: {
      min: 1,
      max: 5,
    },
  },
  is_active: {
    type: DataTypes.TINYINT,
    allowNull: true,
    defaultValue: 1, // 0 = Inactive, 1 = Active
  },
}, {
  tableName: 'testimonials',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
});
