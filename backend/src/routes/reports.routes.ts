import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  listReports,
  uploadReport,
  getReportById,
  analyzeReport,
  reviewReportField,
  deleteReport,
} from '../controllers/reports.controller';

import { upload } from '../middleware/upload';

const router = Router();

router.use(authenticate);

router.get('/', listReports);
router.post('/upload', upload.single('reportFile'), uploadReport);
router.get('/:id', getReportById);
router.post('/:id/analyze', analyzeReport);
router.patch('/:id/review', reviewReportField);
router.delete('/:id', deleteReport);

export default router;
