import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const Faq = sequelize.define('faqs', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  question: {
    type: DataTypes.STRING(500),
    allowNull: false,
  },
  answer: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  is_active: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 1, // 1 = Active, 0 = Inactive
  },
  is_delete: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 0, // 0 = Active, 1 = Soft deleted
  },
}, {
  tableName: 'faqs',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'modifiedAt',
  indexes: [
    {
      name: 'idx_faqs_public',
      fields: ['is_delete', 'is_active', 'createdAt', 'id'],
    },
    {
      name: 'idx_faqs_admin_status',
      fields: ['is_delete', 'is_active'],
    },
  ],
});
