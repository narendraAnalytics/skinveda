
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

export enum AppStep {
  WELCOME = 'welcome',
  PROFILE_NAME = 'profile_name',
  PROFILE_BIO = 'profile_bio',
  SKIN_DETAILS = 'skin_details',
  CONCERNS_HEALTH = 'concerns_health',
  PHOTO_CAPTURE = 'photo_capture',
  ANALYSIS_LOADING = 'analysis_loading',
  RESULT = 'result'
}
