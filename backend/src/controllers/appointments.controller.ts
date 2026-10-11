import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/response';
import { prisma, isPrismaConnected } from '../config/prisma';

let memoryAppointments: any[] = [];

export async function listAppointments(req: AuthenticatedRequest, res: Response) {
  const userId = req.user?.id || 'patient-user-001';

  try {
    if (isPrismaConnected()) {
      const records = await prisma.appointment.findMany({
        where: { userId },
        orderBy: { date: 'asc' },
      });
      return sendSuccess(res, records, 'Appointments retrieved from Supabase PostgreSQL');
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
  };

  try {
    if (isPrismaConnected()) {
      const doc = await prisma.appointment.create({
        data: newAppt,
      });
      return sendSuccess(res, doc, 'Appointment scheduled in Supabase PostgreSQL', 201);
    }
  } catch (err) {
    // fallback
  }

  const memDoc = { id: `appt-${Date.now()}`, ...newAppt, createdAt: new Date() };
  memoryAppointments.push(memDoc);
  return sendSuccess(res, memDoc, 'Appointment scheduled', 201);
}

export async function updateAppointment(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;
  const userId = req.user?.id || 'patient-user-001';

  try {
    if (isPrismaConnected()) {
      const updated = await prisma.appointment.updateMany({
        where: { id, userId },
        data: req.body,
      });
      if (updated.count > 0) {
        const record = await prisma.appointment.findUnique({ where: { id } });
        return sendSuccess(res, record, 'Appointment updated in Supabase PostgreSQL');
      }
    }
  } catch (err) {
    // fallback
  }

  const idx = memoryAppointments.findIndex((a) => a.id === id);
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
    if (isPrismaConnected()) {
      await prisma.appointment.deleteMany({
        where: { id, userId },
      });
      return sendSuccess(res, { id }, 'Appointment deleted from Supabase PostgreSQL');
    }
  } catch (err) {
    // fallback
  }

  memoryAppointments = memoryAppointments.filter((a) => a.id !== id);
  return sendSuccess(res, { id }, 'Appointment deleted');
}
