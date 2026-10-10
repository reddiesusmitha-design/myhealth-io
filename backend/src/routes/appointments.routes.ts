import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  listAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment,
} from '../controllers/appointments.controller';

const router = Router();

router.use(authenticate);

router.get('/', listAppointments);
router.post('/', createAppointment);
router.put('/:id', updateAppointment);
router.delete('/:id', deleteAppointment);

export default router;
