import { Router } from 'express';
import { getTopic } from '../controllers/topics.controller';
import { analyzeSpeech } from '../controllers/analyze.controller';
import { validateAnalyzeRequest } from '../middleware/validation.middleware';

const router = Router();

// Endpoint to generate a unique interview/public speaking topic
router.post('/topics', getTopic);

// Endpoint to validate and perform deep AI analysis of transcript
router.post('/analyze', validateAnalyzeRequest, analyzeSpeech);

export default router;
