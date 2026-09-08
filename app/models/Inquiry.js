import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const Inquiry = sequelize.define('inquiries', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      isEmail: true,
    },
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  subject: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  is_read: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 0, // 0 = Unread, 1 = Read
  },
}, {
  tableName: 'inquiries',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
});
