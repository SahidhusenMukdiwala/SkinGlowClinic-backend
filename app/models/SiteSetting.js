import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const SiteSetting = sequelize.define('site_settings', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  setting_key: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
  setting_value: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  setting_type: {
    type: DataTypes.TINYINT,
    allowNull: false, // 1=Text, 2=Textarea, 3=URL, 4=Email, 5=Phone
  },
  display_label: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
}, {
  tableName: 'site_settings',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
});
