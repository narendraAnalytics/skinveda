import { Request, Response } from 'express';
import { z } from 'zod';
import { SkinAnalysisService } from '../services/geminiService';

const transcribeSchema = z.object({
  audioBase64: z.string(),
  mimeType: z.string().optional().default('audio/wav'),
  language: z.string().optional()
});

export async function handleTranscribe(req: Request, res: Response) {
  try {
    const { audioBase64, mimeType, language } = transcribeSchema.parse(req.body);

    const service = new SkinAnalysisService();
    const text = await service.transcribeAudio(audioBase64, mimeType, language || 'en');

    res.json({
      success: true,
      text
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.issues });
    }

    console.error('Transcription error:', error);
    res.status(500).json({ error: 'Failed to transcribe audio' });
  }
}
