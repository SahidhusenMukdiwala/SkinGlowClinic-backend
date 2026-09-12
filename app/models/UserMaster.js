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
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  mobile: {
    type: DataTypes.STRING(15),
    allowNull: false,
  },
  role: {
    type: DataTypes.TINYINT,
    allowNull: true,
    defaultValue: 2, // 0 = Super Admin, 1 = Admin, 2 = Customer / Patient
  },
}, {
  tableName: 'user_master',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
});
