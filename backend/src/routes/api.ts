import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { handleAnalyze } from '../controllers/analysisController';
import { handleTTS } from '../controllers/ttsController';
import {
  handleGetAnalyses,
  handleGetAnalysisById,
  handleDeleteAnalysis,
} from '../controllers/analysesController';
import { handleTranscribe } from '../controllers/transcriptionController';

const router = Router();

router.use(requireAuth);

router.post('/analyze', handleAnalyze);
router.post('/tts', handleTTS);
router.post('/transcribe', handleTranscribe);

// Analysis history routes
router.get('/analyses', handleGetAnalyses);
router.get('/analyses/:id', handleGetAnalysisById);
router.delete('/analyses/:id', handleDeleteAnalysis);

export default router;
