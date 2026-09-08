import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const UserMaster = sequelize.define('user_master', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  full_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  role: {
    type: DataTypes.TINYINT,
    allowNull: true,
    defaultValue: 1, // 0 = Super Admin, 1 = Admin
  },
}, {
  tableName: 'user_master',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
});
