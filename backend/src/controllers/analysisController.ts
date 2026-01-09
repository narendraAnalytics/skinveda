import { Request, Response } from 'express';
import { z } from 'zod';
import { SkinAnalysisService } from '../services/geminiService';

const profileSchema = z.object({
  name: z.string(),
  age: z.string(),
  gender: z.string(),
  skinType: z.string(),
  sensitivity: z.string(),
  concerns: z.array(z.string()),
  healthConditions: z.array(z.string()),
  healthData: z.object({
    steps: z.number(),
    sleepHours: z.number(),
    heartRate: z.number(),
    lastSync: z.string()
  }).optional()
});

const analyzeSchema = z.object({
  profile: profileSchema,
  imageBase64: z.string()
});

export async function handleAnalyze(req: Request, res: Response) {
  try {
    const { profile, imageBase64 } = analyzeSchema.parse(req.body);

    const service = new SkinAnalysisService();
    const result = await service.analyzeSkin(profile, imageBase64);

    res.json({ success: true, data: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.issues });
    }

    console.error('Analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze skin' });
  }
}
