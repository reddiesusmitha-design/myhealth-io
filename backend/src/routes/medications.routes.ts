import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  listMedicationAlarms,
  createMedicationAlarm,
  logDoseIntake,
  updateMedicationAlarm,
  deleteMedicationAlarm,
} from '../controllers/medications.controller';

const router = Router();

router.use(authenticate);

router.get('/alarms', listMedicationAlarms);
router.post('/alarms', createMedicationAlarm);
router.patch('/alarms/:id/take', logDoseIntake);
router.put('/alarms/:id', updateMedicationAlarm);
router.delete('/alarms/:id', deleteMedicationAlarm);

export default router;
