import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const SessionMaster = sequelize.define('session_master', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  access_token: {
    type: DataTypes.STRING(450),
    allowNull: false,
  },
  refresh_token: {
    type: DataTypes.STRING(450),
    allowNull: false,
  },
  ip: {
    type: DataTypes.STRING(45),
    allowNull: false,
  },
}, {
  tableName: 'session_master',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'modifiedAt', // Explicitly maps to modifiedAt in DB schema
});
