import * as appointmentService from '../services/appointmentService.js';
import { successResponse } from '../utils/responseHelper.js';

export const bookAppointment = async (req, res, next) => {
  try {
    const appointment = await appointmentService.createAppointment(req.body);
    return successResponse(
      res,
      appointment,
      'Your appointment request has been submitted successfully! We look forward to seeing you at SkinGlow Clinic.',
      201
    );
  } catch (error) {
    next(error);
  }
};

export const getBookedSlots = async (req, res, next) => {
  try {
    const date = req.query.date;
    const bookedSlots = await appointmentService.getBookedSlots(date);
    return successResponse(
      res,
      bookedSlots,
      'Booked time slots retrieved successfully',
      200
    );
  } catch (error) {
    next(error);
  }
};

export const getAdminAppointments = async (req, res, next) => {
  try {
    const result = await appointmentService.getAdminAppointments(req.query);
    return successResponse(res, result, 'Appointments retrieved successfully', 200);
  } catch (error) {
    next(error);
  }
};

export const getAppointmentById = async (req, res, next) => {
  try {
    const appointment = await appointmentService.getAppointmentById(req.params.id);
    return successResponse(res, appointment, 'Appointment details retrieved successfully', 200);
  } catch (error) {
    next(error);
  }
};

export const updateAppointment = async (req, res, next) => {
  try {
    const appointment = await appointmentService.updateAppointment(req.params.id, req.body);
    return successResponse(res, appointment, 'Appointment updated successfully', 200);
  } catch (error) {
    next(error);
  }
};

export const deleteAppointment = async (req, res, next) => {
  try {
    const result = await appointmentService.deleteAppointment(req.params.id);
    return successResponse(res, result, 'Appointment deleted successfully', 200);
  } catch (error) {
    next(error);
  }
};

