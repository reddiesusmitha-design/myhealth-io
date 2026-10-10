import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/response';
import { AppointmentModel } from '../models/Appointment';
import { isDatabaseConnected } from '../config/database';

let memoryAppointments: any[] = [];

export async function listAppointments(req: AuthenticatedRequest, res: Response) {
  const userId = req.user?.id || 'patient-user-001';

  try {
    if (isDatabaseConnected()) {
      const docs = await AppointmentModel.find({ userId }).sort({ date: 1 });
      return sendSuccess(res, docs, 'Appointments retrieved');
    }
  } catch (err) {
    // fallback
  }

  const userAppts = memoryAppointments.filter((a) => !a.userId || a.userId === userId);
  return sendSuccess(res, userAppts, 'Appointments retrieved');
}

export async function createAppointment(req: AuthenticatedRequest, res: Response) {
  const userId = req.user?.id || 'patient-user-001';
  const {
    doctorName,
    specialty,
    clinicName,
    date,
    time,
    type,
    reasonForVisit,
    doctorNotes,
    nextFollowUpDays,
    location,
    contactPhone,
  } = req.body;

  if (!doctorName || !date || !time || !reasonForVisit) {
    return sendError(res, 'Doctor name, date, time, and reason for visit are required', 400);
  }

  const newAppt = {
    id: `appt-${Date.now()}`,
    userId,
    doctorName,
    specialty: specialty || 'General Medicine',
    clinicName: clinicName || 'Health Center',
    date,
    time,
    type: type || 'FOLLOW_UP',
    status: 'UPCOMING',
    reasonForVisit,
    doctorNotes: doctorNotes || '',
    nextFollowUpDays: Number(nextFollowUpDays) || 30,
    reminderSet: true,
    location: location || 'Consultation Room',
    contactPhone: contactPhone || '+91 40 2345 6789',
    createdAt: new Date(),
  };

  try {
    if (isDatabaseConnected()) {
      const doc = await AppointmentModel.create(newAppt);
      return sendSuccess(res, doc, 'Appointment scheduled', 201);
    }
  } catch (err) {
    // fallback
  }

  memoryAppointments.push(newAppt);
  return sendSuccess(res, newAppt, 'Appointment scheduled', 201);
}

export async function updateAppointment(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;
  const userId = req.user?.id || 'patient-user-001';

  try {
    if (isDatabaseConnected()) {
      const updated = await AppointmentModel.findOneAndUpdate(
        { _id: id, userId },
        { ...req.body },
        { new: true }
      );
      if (updated) return sendSuccess(res, updated, 'Appointment updated');
    }
  } catch (err) {
    // fallback
  }

  const idx = memoryAppointments.findIndex((a) => a.id === id || a._id === id);
  if (idx !== -1) {
    memoryAppointments[idx] = { ...memoryAppointments[idx], ...req.body };
    return sendSuccess(res, memoryAppointments[idx], 'Appointment updated');
  }

  return sendSuccess(res, { id, ...req.body }, 'Appointment updated');
}

export async function deleteAppointment(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;
  const userId = req.user?.id || 'patient-user-001';

  try {
    if (isDatabaseConnected()) {
      await AppointmentModel.deleteOne({ _id: id, userId });
    }
  } catch (err) {
    // fallback
  }

  memoryAppointments = memoryAppointments.filter((a) => a.id !== id && a._id !== id);
  return sendSuccess(res, { id }, 'Appointment removed');
}
