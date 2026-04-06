import { Router } from 'express';
import { getHistory, getSessionResult, getReportUrl } from '../controllers/results';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.get('/history', authMiddleware, getHistory);
router.get('/report/:sessionId', authMiddleware, getReportUrl);
router.get('/:sessionId', authMiddleware, getSessionResult);

export default router;
