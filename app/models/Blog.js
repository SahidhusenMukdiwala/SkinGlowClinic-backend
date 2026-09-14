import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const Blog = sequelize.define('blogs', {
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
  content: {
    type: DataTypes.TEXT('long'),
    allowNull: false,
  },
  cover_image: {
    type: DataTypes.STRING(500),
    allowNull: false,
  },
  is_published: {
    type: DataTypes.TINYINT,
    allowNull: true,
    defaultValue: 1, // 0 = Draft, 1 = Published
  },
  is_delete: {
    type: DataTypes.TINYINT,
    allowNull: true,
    defaultValue: 0, // 0 = Active/Not deleted, 1 = Soft deleted
  },
}, {
  tableName: 'blogs',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
});
