export interface HealthData {
  steps: number;
  sleepHours: number;
  heartRate: number;
  lastSync: string;
}

export interface UserProfile {
  name: string;
  age: string;
  gender: string;
  skinType: string;
  sensitivity: string;
  concerns: string[];
  healthConditions: string[];
  healthData?: HealthData;
}

export interface AnalysisResult {
  overallScore: number;
  eyeAge: number;
  skinAge: number;
  hydration: number;
  redness: number;
  pigmentation: number;
  lines: number;
  acne: number;
  translucency: number;
  uniformness: number;
  pores: number;
  summary: string;
  recommendations: {
    yoga: string[];
    meditation: string[];
    naturalRemedies: string[];
    diet: {
      juices: string[];
      eat: string[];
      avoid: string[];
    };
    exercises: {
      face: string[];
      body: string[];
    };
    stressManagement: string[];
  };
}

export interface AnalysisListItem {
  id: string;
  createdAt: string;
  overallScore: number;
  skinAge: number;
  eyeAge: number;
}

export interface StoredAnalysis {
  id: string;
  userId: string;
  createdAt: string;
  profile: UserProfile;
  analysis: AnalysisResult;
}
