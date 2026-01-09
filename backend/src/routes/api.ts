import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { handleAnalyze } from '../controllers/analysisController';
import { handleTTS } from '../controllers/ttsController';

const router = Router();

router.use(requireAuth);

router.post('/analyze', handleAnalyze);
router.post('/tts', handleTTS);

export default router;
