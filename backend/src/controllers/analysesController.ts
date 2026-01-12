import { Request, Response } from 'express';
import { DatabaseService } from '../services/dbService';

const dbService = new DatabaseService();

/**
 * GET /api/analyses
 * Returns list of all analyses for authenticated user
 */
export async function handleGetAnalyses(req: Request, res: Response) {
  try {
    const userId = (req as any).user.sub;
    const analyses = await dbService.getUserAnalyses(userId);

    res.json({ success: true, data: analyses });
  } catch (error) {
    console.error('Get analyses error:', error);
    res.status(500).json({ error: 'Failed to fetch analyses' });
  }
}

/**
 * GET /api/analyses/:id
 * Returns full details of single analysis
 */
export async function handleGetAnalysisById(req: Request, res: Response) {
  try {
    const userId = (req as any).user.sub;
    const { id } = req.params;

    const analysis = await dbService.getAnalysisById(id, userId);

    if (!analysis) {
      return res.status(404).json({ error: 'Analysis not found' });
    }

    res.json({ success: true, data: analysis });
  } catch (error) {
    console.error('Get analysis error:', error);
    res.status(500).json({ error: 'Failed to fetch analysis' });
  }
}

/**
 * DELETE /api/analyses/:id
 * Deletes specific analysis
 */
export async function handleDeleteAnalysis(req: Request, res: Response) {
  try {
    const userId = (req as any).user.sub;
    const { id } = req.params;

    const deleted = await dbService.deleteAnalysis(id, userId);

    if (!deleted) {
      return res.status(404).json({ error: 'Analysis not found or unauthorized' });
    }

    res.json({ success: true, message: 'Analysis deleted' });
  } catch (error) {
    console.error('Delete analysis error:', error);
    res.status(500).json({ error: 'Failed to delete analysis' });
  }
}
