import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const Treatment = sequelize.define('treatments', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  slug: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
  },
  category_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'categories',
      key: 'id',
    },
  },
  short_description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  full_description: {
    type: DataTypes.TEXT('long'),
    allowNull: true,
  },
  image_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  duration: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  is_delete: {
    type: DataTypes.TINYINT,
    allowNull: true,
    defaultValue: 0, // 0 = Active/Not deleted, 1 = Soft deleted
  },
  is_active: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 1, // 0 = Inactive, 1 = Active
  },
  display_order: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
}, {
  tableName: 'treatments',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updateAt', // Explicitly maps to updateAt in DB schema
});
