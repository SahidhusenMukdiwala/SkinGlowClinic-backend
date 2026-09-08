import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const Appointment = sequelize.define('appointments', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  treatment_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  patient_name: {
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
    allowNull: false,
  },
  preferred_date_time: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  status: {
    type: DataTypes.TINYINT,
    allowNull: true,
    defaultValue: 0, // 0 = Pending, 1 = Confirmed, 2 = Completed, 3 = Cancelled
  },
  admin_notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'appointments',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'modifiedAt', // Explicitly maps to modifiedAt in DB schema
});
