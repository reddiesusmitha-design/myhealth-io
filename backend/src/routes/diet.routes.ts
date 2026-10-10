import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getDietMenu,
  logWaterIntake,
  updateDietPlan,
} from '../controllers/diet.controller';

const router = Router();

router.use(authenticate);

router.get('/', getDietMenu);
router.post('/water', logWaterIntake);
router.put('/plan', updateDietPlan);

export default router;
