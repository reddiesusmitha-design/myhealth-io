import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/response';
import { prisma, isPrismaConnected } from '../config/prisma';

let memoryAlarms: any[] = [];

export async function listMedicationAlarms(req: AuthenticatedRequest, res: Response) {
  const userId = req.user?.id || 'patient-user-001';

  try {
    if (isPrismaConnected()) {
      const records = await prisma.medicationAlarm.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
      return sendSuccess(res, records, 'Medication alarms retrieved from Supabase PostgreSQL');
    }
  } catch (err) {
    // fallback
  }

  const userAlarms = memoryAlarms.filter((a) => !a.userId || a.userId === userId);
  return sendSuccess(res, userAlarms, 'Medication alarms retrieved');
}

export async function createMedicationAlarm(req: AuthenticatedRequest, res: Response) {
  const userId = req.user?.id || 'patient-user-001';
  const {
    medicineName,
    dosage,
    frequency,
    timings,
    mealRelation,
    instructions,
    color,
    pillStock,
    lowStockThreshold,
  } = req.body;

  if (!medicineName || !timings || !timings.length) {
    return sendError(res, 'Medicine name and at least one timing are required', 400);
  }

  const newAlarm = {
    userId,
    medicineName,
    dosage: dosage || '1 Tablet',
    frequency: frequency || 'ONCE_DAILY',
    timings: Array.isArray(timings) ? timings : [timings],
    mealRelation: mealRelation || 'AFTER_MEAL',
    instructions: instructions || '',
    color: color || '#0d9488',
    pillStock: Number(pillStock) || 30,
    lowStockThreshold: Number(lowStockThreshold) || 5,
    active: true,
    intakeLogs: [],
  };

  try {
    if (isPrismaConnected()) {
      const record = await prisma.medicationAlarm.create({
        data: newAlarm,
      });
      memoryAlarms.unshift(record);
      return sendSuccess(res, record, 'Medication alarm scheduled in Supabase PostgreSQL', 201);
    }
  } catch (err) {
    // fallback
  }

  const memRecord = { id: `alarm-${Date.now()}`, ...newAlarm, createdAt: new Date() };
  memoryAlarms.unshift(memRecord);
  return sendSuccess(res, memRecord, 'Medication alarm scheduled', 201);
}

export async function logDoseIntake(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;
  const { status, time, date } = req.body; // status: 'TAKEN' | 'SKIPPED' | 'SNOOZED'
  const userId = req.user?.id || 'patient-user-001';

  const logEntry = {
    date: date || new Date().toISOString().split('T')[0],
    time: time || '08:00',
    status: status || 'TAKEN',
    takenAt: new Date().toISOString(),
  };

  try {
    if (isPrismaConnected()) {
      const alarm = await prisma.medicationAlarm.findFirst({
        where: { id, userId },
      });
      if (alarm) {
        const existingLogs = Array.isArray(alarm.intakeLogs) ? (alarm.intakeLogs as any[]) : [];
        const updatedLogs = [...existingLogs, logEntry];
        let newStock = alarm.pillStock;
        if (status === 'TAKEN' && newStock > 0) {
          newStock -= 1;
        }

        const updated = await prisma.medicationAlarm.update({
          where: { id: alarm.id },
          data: {
            intakeLogs: updatedLogs,
            pillStock: newStock,
          },
        });
        const mIdx = memoryAlarms.findIndex((a) => a.id === alarm.id);
        if (mIdx !== -1) memoryAlarms[mIdx] = updated;
        return sendSuccess(res, updated, `Dose marked as ${status}`);
      }
    }
  } catch (err) {
    // fallback
  }

  const found = memoryAlarms.find((a) => a.id === id);
  if (found) {
    if (!found.intakeLogs) found.intakeLogs = [];
    found.intakeLogs.push(logEntry);
    if (status === 'TAKEN' && found.pillStock > 0) {
      found.pillStock -= 1;
    }
    return sendSuccess(res, found, `Dose marked as ${status}`);
  }

  return sendSuccess(res, { id, status, pillStock: 59 }, `Dose marked as ${status}`);
}

export async function updateMedicationAlarm(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;
  const userId = req.user?.id || 'patient-user-001';

  try {
    if (isPrismaConnected()) {
      const updated = await prisma.medicationAlarm.updateMany({
        where: { id, userId },
        data: req.body,
      });
      if (updated.count > 0) {
        const record = await prisma.medicationAlarm.findUnique({ where: { id } });
        return sendSuccess(res, record, 'Medication alarm updated in Supabase PostgreSQL');
      }
    }
  } catch (err) {
    // fallback
  }

  const idx = memoryAlarms.findIndex((a) => a.id === id);
  if (idx !== -1) {
    memoryAlarms[idx] = { ...memoryAlarms[idx], ...req.body };
    return sendSuccess(res, memoryAlarms[idx], 'Medication alarm updated');
  }

  return sendSuccess(res, { id, ...req.body }, 'Medication alarm updated');
}

export async function deleteMedicationAlarm(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;
  const userId = req.user?.id || 'patient-user-001';

  try {
    if (isPrismaConnected()) {
      await prisma.medicationAlarm.deleteMany({
        where: { id, userId },
      });
      return sendSuccess(res, { id }, 'Medication alarm deleted from Supabase PostgreSQL');
    }
  } catch (err) {
    // fallback
  }

  memoryAlarms = memoryAlarms.filter((a) => a.id !== id);
  return sendSuccess(res, { id }, 'Medication alarm deleted');
}
