import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getTimeline } from '../controllers/timeline.controller';

const router = Router();

router.use(authenticate);
router.get('/', getTimeline);

export default router;
