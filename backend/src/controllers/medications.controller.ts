import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/response';
import { MedicationAlarmModel } from '../models/MedicationAlarm';
import { isDatabaseConnected } from '../config/database';

let memoryAlarms: any[] = [];

export async function listMedicationAlarms(req: AuthenticatedRequest, res: Response) {
  const userId = req.user?.id || 'patient-user-001';

  try {
    if (isDatabaseConnected()) {
      const docs = await MedicationAlarmModel.find({ userId }).sort({ createdAt: -1 });
      return sendSuccess(res, docs, 'Medication alarms retrieved');
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
    id: `alarm-${Date.now()}`,
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
    createdAt: new Date(),
  };

  try {
    if (isDatabaseConnected()) {
      const doc = await MedicationAlarmModel.create(newAlarm);
      return sendSuccess(res, doc, 'Medication alarm scheduled', 201);
    }
  } catch (err) {
    // fallback
  }

  memoryAlarms.unshift(newAlarm);
  return sendSuccess(res, newAlarm, 'Medication alarm scheduled', 201);
}

export async function logDoseIntake(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;
  const { status, time, date } = req.body; // status: 'TAKEN' | 'SKIPPED' | 'SNOOZED'
  const userId = req.user?.id || 'patient-user-001';

  const logEntry = {
    date: date || new Date().toISOString().split('T')[0],
    time: time || '08:00',
    status: status || 'TAKEN',
    takenAt: new Date(),
  };

  try {
    if (isDatabaseConnected()) {
      const alarm = await MedicationAlarmModel.findOne({ _id: id, userId });
      if (alarm) {
        alarm.intakeLogs.push(logEntry);
        if (status === 'TAKEN' && alarm.pillStock > 0) {
          alarm.pillStock -= 1;
        }
        await alarm.save();
        return sendSuccess(res, alarm, `Dose marked as ${status}`);
      }
    }
  } catch (err) {
    // fallback
  }

  const found = memoryAlarms.find((a) => a.id === id || a._id === id);
  if (found) {
    if (!found.intakeLogs) found.intakeLogs = [];
    found.intakeLogs.push(logEntry);
    if (status === 'TAKEN' && found.pillStock > 0) {
      found.pillStock -= 1;
    }
    return sendSuccess(res, found, `Dose marked as ${status}`);
  }

  return sendSuccess(res, { id, status }, `Dose marked as ${status}`);
}

export async function updateMedicationAlarm(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;
  const userId = req.user?.id || 'patient-user-001';

  try {
    if (isDatabaseConnected()) {
      const updated = await MedicationAlarmModel.findOneAndUpdate(
        { _id: id, userId },
        { ...req.body },
        { new: true }
      );
      if (updated) return sendSuccess(res, updated, 'Medication alarm updated');
    }
  } catch (err) {
    // fallback
  }

  const idx = memoryAlarms.findIndex((a) => a.id === id || a._id === id);
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
    if (isDatabaseConnected()) {
      await MedicationAlarmModel.deleteOne({ _id: id, userId });
    }
  } catch (err) {
    // fallback
  }

  memoryAlarms = memoryAlarms.filter((a) => a.id !== id && a._id !== id);
  return sendSuccess(res, { id }, 'Medication alarm removed');
}
