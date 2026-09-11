import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const Category = sequelize.define('categories', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(45),
    allowNull: false,
  },
  status: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 1, // 1 = Active, 0 = Inactive
  },
  is_delete: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 0, // 0 = Not deleted, 1 = Soft deleted
  },
}, {
  tableName: 'categories',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'modifiedAt', // Explicitly maps to modifiedAt in DB schema
});
