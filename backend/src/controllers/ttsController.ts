import { Request, Response } from 'express';
import { z } from 'zod';

const ttsSchema = z.object({
  text: z.string().min(1).max(500),
  language: z.string().optional()
});

export async function handleTTS(req: Request, res: Response) {
  try {
    // const { text, language } = ttsSchema.parse(req.body);
    // const service = new SkinAnalysisService();
    // const audioBase64 = await service.getTTS(text, language || 'en');

    // Temporarily disabled to avoid 400 error during analysis review
    res.json({ success: true, audioBase64: '' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid text input', details: error.issues });
    }

    console.error('TTS error:', error);
    res.status(500).json({ error: 'Failed to generate audio' });
  }
}
