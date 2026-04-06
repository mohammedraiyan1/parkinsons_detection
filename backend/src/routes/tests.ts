import { Router } from 'express';
import { submitTest } from '../controllers/tests';
import { authMiddleware } from '../middlewares/authMiddleware';
import multer from 'multer';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() }); 

router.post('/submit', authMiddleware, upload.any(), submitTest);

export default router;
