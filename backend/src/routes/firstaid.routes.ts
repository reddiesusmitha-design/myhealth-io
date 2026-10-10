import { Router } from 'express';
import {
  listFirstAidGuides,
  getFirstAidGuideBySlug,
} from '../controllers/firstaid.controller';

const router = Router();

router.get('/', listFirstAidGuides);
router.get('/:slug', getFirstAidGuideBySlug);

export default router;
