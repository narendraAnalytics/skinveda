import { TRANSLATIONS } from '@/constants/translations';
import { AnalysisResult, UserProfile } from '@/types/wizard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface WizardContextType {
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;
  capturedImage: string | null;
  setCapturedImage: (image: string | null) => void;
  analysis: AnalysisResult | null;
  setAnalysis: (result: AnalysisResult | null) => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  resetWizard: () => void;
  t: (key: string) => string;
}

const WizardContext = createContext<WizardContextType | undefined>(undefined);

const INITIAL_PROFILE: UserProfile = {
  name: '',
  age: '',
  gender: '',
  skinType: '',
  sensitivity: '',
  concerns: [],
  healthConditions: [],
  language: 'en',
};

export function WizardProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(INITIAL_PROFILE);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  // Load saved state on mount
  useEffect(() => {
    loadState();
  }, []);

  // Save state on changes
  useEffect(() => {
    saveState();
  }, [profile, capturedImage, analysis, currentStep]);

  const loadState = async () => {
    try {
      const saved = await AsyncStorage.getItem('wizardState');
      if (saved) {
        const state = JSON.parse(saved);
        setProfile(state.profile || INITIAL_PROFILE);
        setCapturedImage(state.capturedImage || null);
        setAnalysis(state.analysis || null);
        setCurrentStep(state.currentStep || 0);
      }
    } catch (error) {
      console.error('Failed to load wizard state:', error);
    }
  };

  const saveState = async () => {
    try {
      await AsyncStorage.setItem('wizardState', JSON.stringify({
        profile,
        capturedImage,
        analysis,
        currentStep,
      }));
    } catch (error) {
      console.error('Failed to save wizard state:', error);
    }
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile(prev => ({ ...prev, ...updates }));
  };

  const resetWizard = async () => {
    setProfile(INITIAL_PROFILE);
    setCapturedImage(null);
    setAnalysis(null);
    setCurrentStep(0);
    await AsyncStorage.removeItem('wizardState');
  };

  return (
    <WizardContext.Provider value={{
      profile,
      updateProfile,
      capturedImage,
      setCapturedImage,
      analysis,
      setAnalysis,
      currentStep,
      setCurrentStep,
      resetWizard,
      t: (key: string) => TRANSLATIONS[profile.language]?.[key] || TRANSLATIONS.en[key] || key,
    }}>
      {children}
    </WizardContext.Provider>
  );
}

export function useWizard() {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error('useWizard must be used within WizardProvider');
  }
  return context;
}
