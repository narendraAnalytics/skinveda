import { pgTable, uuid, text, timestamp, integer, jsonb, index } from 'drizzle-orm/pg-core';

export const skinAnalyses = pgTable('skin_analyses', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),

  // Profile data at time of analysis
  profileName: text('profile_name').notNull(),
  profileAge: text('profile_age').notNull(),
  profileGender: text('profile_gender').notNull(),
  profileSkinType: text('profile_skin_type').notNull(),
  profileSensitivity: text('profile_sensitivity').notNull(),
  profileConcerns: text('profile_concerns').array().notNull(),
  profileHealthConditions: text('profile_health_conditions').array().notNull(),
  profileHealthData: jsonb('profile_health_data'),

  // Analysis metrics (0-100)
  overallScore: integer('overall_score').notNull(),
  eyeAge: integer('eye_age').notNull(),
  skinAge: integer('skin_age').notNull(),
  hydration: integer('hydration').notNull(),
  redness: integer('redness').notNull(),
  pigmentation: integer('pigmentation').notNull(),
  lines: integer('lines').notNull(),
  acne: integer('acne').notNull(),
  translucency: integer('translucency').notNull(),
  uniformness: integer('uniformness').notNull(),
  pores: integer('pores').notNull(),

  // Analysis results
  summary: text('summary').notNull(),
  recommendations: jsonb('recommendations').notNull(),
}, (table) => ({
  userIdCreatedAtIdx: index('user_id_created_at_idx').on(table.userId, table.createdAt.desc()),
}));
