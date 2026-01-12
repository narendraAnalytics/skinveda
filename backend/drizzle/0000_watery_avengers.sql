CREATE TABLE "skin_analyses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"profile_name" text NOT NULL,
	"profile_age" text NOT NULL,
	"profile_gender" text NOT NULL,
	"profile_skin_type" text NOT NULL,
	"profile_sensitivity" text NOT NULL,
	"profile_concerns" text[] NOT NULL,
	"profile_health_conditions" text[] NOT NULL,
	"profile_health_data" jsonb,
	"overall_score" integer NOT NULL,
	"eye_age" integer NOT NULL,
	"skin_age" integer NOT NULL,
	"hydration" integer NOT NULL,
	"redness" integer NOT NULL,
	"pigmentation" integer NOT NULL,
	"lines" integer NOT NULL,
	"acne" integer NOT NULL,
	"translucency" integer NOT NULL,
	"uniformness" integer NOT NULL,
	"pores" integer NOT NULL,
	"summary" text NOT NULL,
	"recommendations" jsonb NOT NULL
);
--> statement-breakpoint
CREATE INDEX "user_id_created_at_idx" ON "skin_analyses" USING btree ("user_id","created_at" DESC NULLS LAST);