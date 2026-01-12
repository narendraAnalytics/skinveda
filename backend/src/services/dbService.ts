import { db } from '../db';
import { skinAnalyses } from '../db/schema';
import { eq, desc, sql, inArray } from 'drizzle-orm';
import { UserProfile, AnalysisResult, StoredAnalysis, AnalysisListItem } from '../types';

const MAX_ANALYSES_PER_USER = 20;

export class DatabaseService {
  /**
   * Save analysis to database
   * Automatically enforces 20-analysis limit by deleting oldest
   */
  async saveAnalysis(
    userId: string,
    profile: UserProfile,
    analysis: AnalysisResult
  ): Promise<string> {
    // Insert new analysis
    const [inserted] = await db.insert(skinAnalyses).values({
      userId,
      profileName: profile.name,
      profileAge: profile.age,
      profileGender: profile.gender,
      profileSkinType: profile.skinType,
      profileSensitivity: profile.sensitivity,
      profileConcerns: profile.concerns,
      profileHealthConditions: profile.healthConditions,
      profileHealthData: profile.healthData || null,
      overallScore: analysis.overallScore,
      eyeAge: analysis.eyeAge,
      skinAge: analysis.skinAge,
      hydration: analysis.hydration,
      redness: analysis.redness,
      pigmentation: analysis.pigmentation,
      lines: analysis.lines,
      acne: analysis.acne,
      translucency: analysis.translucency,
      uniformness: analysis.uniformness,
      pores: analysis.pores,
      summary: analysis.summary,
      recommendations: analysis.recommendations,
    }).returning({ id: skinAnalyses.id });

    // Enforce limit: delete oldest if count exceeds MAX
    await this.enforceUserLimit(userId);

    return inserted.id;
  }

  /**
   * Get all analyses for a user (chronological order, newest first)
   */
  async getUserAnalyses(userId: string): Promise<AnalysisListItem[]> {
    const results = await db
      .select({
        id: skinAnalyses.id,
        createdAt: skinAnalyses.createdAt,
        overallScore: skinAnalyses.overallScore,
        skinAge: skinAnalyses.skinAge,
        eyeAge: skinAnalyses.eyeAge,
      })
      .from(skinAnalyses)
      .where(eq(skinAnalyses.userId, userId))
      .orderBy(desc(skinAnalyses.createdAt));

    return results.map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
    }));
  }

  /**
   * Get single analysis by ID (with full details)
   */
  async getAnalysisById(id: string, userId: string): Promise<StoredAnalysis | null> {
    const [result] = await db
      .select()
      .from(skinAnalyses)
      .where(eq(skinAnalyses.id, id))
      .limit(1);

    if (!result || result.userId !== userId) {
      return null;
    }

    return {
      id: result.id,
      userId: result.userId,
      createdAt: result.createdAt,
      profile: {
        name: result.profileName,
        age: result.profileAge,
        gender: result.profileGender,
        skinType: result.profileSkinType,
        sensitivity: result.profileSensitivity,
        concerns: result.profileConcerns,
        healthConditions: result.profileHealthConditions,
        healthData: result.profileHealthData as any,
      },
      analysis: {
        overallScore: result.overallScore,
        eyeAge: result.eyeAge,
        skinAge: result.skinAge,
        hydration: result.hydration,
        redness: result.redness,
        pigmentation: result.pigmentation,
        lines: result.lines,
        acne: result.acne,
        translucency: result.translucency,
        uniformness: result.uniformness,
        pores: result.pores,
        summary: result.summary,
        recommendations: result.recommendations as any,
      },
    };
  }

  /**
   * Delete analysis by ID
   */
  async deleteAnalysis(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(skinAnalyses)
      .where(eq(skinAnalyses.id, id))
      .returning({ id: skinAnalyses.id, userId: skinAnalyses.userId });

    // Verify ownership
    return result.length > 0 && result[0].userId === userId;
  }

  /**
   * Enforce MAX_ANALYSES_PER_USER limit
   */
  private async enforceUserLimit(userId: string): Promise<void> {
    const allAnalyses = await db
      .select({ id: skinAnalyses.id, createdAt: skinAnalyses.createdAt })
      .from(skinAnalyses)
      .where(eq(skinAnalyses.userId, userId))
      .orderBy(desc(skinAnalyses.createdAt));

    if (allAnalyses.length > MAX_ANALYSES_PER_USER) {
      const toDelete = allAnalyses.slice(MAX_ANALYSES_PER_USER);
      const deleteIds = toDelete.map((a) => a.id);

      await db
        .delete(skinAnalyses)
        .where(inArray(skinAnalyses.id, deleteIds));
    }
  }
}
