import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  triggerEmergencySos,
  getActiveEmergency,
  updateEmergencyStatus,
  getEmergencyDirectory,
} from '../controllers/emergency.controller';

const router = Router();

router.use(authenticate);

router.post('/sos', triggerEmergencySos);
router.get('/latest', getActiveEmergency);
router.get('/directory', getEmergencyDirectory);
router.patch('/:id/status', updateEmergencyStatus);

export default router;
