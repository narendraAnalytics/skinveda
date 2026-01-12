import { ProgressBar } from '@/components/wizard/ProgressBar';
import { SelectionButton } from '@/components/wizard/SelectionButton';
import { StepContainer } from '@/components/wizard/StepContainer';
import { VoiceInputButton } from '@/components/wizard/VoiceInputButton';
import { WizardColors } from '@/constants/theme';
import { SENSITIVITY_LEVELS, SKIN_TYPES } from '@/constants/wizardOptions';
import { useWizard } from '@/contexts/WizardContext';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function SkinDetailsScreen() {
  const router = useRouter();
  const { profile, updateProfile, setCurrentStep, t } = useWizard();
  const [skinType, setSkinType] = useState(profile.skinType);
  const [sensitivity, setSensitivity] = useState(profile.sensitivity);

  const handleNext = () => {
    if (skinType && sensitivity) {
      updateProfile({ skinType, sensitivity });
      setCurrentStep(4);
      router.push('/(wizard)/concerns-health');
    }
  };

  const isValid = skinType && sensitivity;

  return (
    <View style={styles.container}>
      <ProgressBar currentStep={4} totalSteps={7} />

      <StepContainer
        title={t('skin_profile')}
        subtitle={t('skin_details_subtitle')}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.headerWithVoice}>
            <Text style={styles.label}>{t('skin_type')}</Text>
            <VoiceInputButton
              onTranscript={(text) => {
                const lowerText = text.toLowerCase();
                const found = SKIN_TYPES.find(opt => {
                  const key = opt.toLowerCase().includes('sensitive') ? 'sensitive_type' : opt.toLowerCase();
                  const translated = t(key).toLowerCase();
                  return lowerText.includes(opt.toLowerCase()) || lowerText.includes(translated);
                });
                if (found) setSkinType(found);
              }}
            />
          </View>
          <View style={styles.options}>
            {SKIN_TYPES.map((option) => {
              const key = option.toLowerCase().includes('sensitive') ? 'sensitive_type' : option.toLowerCase();
              return (
                <SelectionButton
                  key={option}
                  label={t(key)}
                  selected={skinType === option}
                  onPress={() => setSkinType(option)}
                />
              );
            })}
          </View>

          <View style={styles.headerWithVoice}>
            <Text style={styles.label}>{t('sensitivity')}</Text>
            <VoiceInputButton
              onTranscript={(text) => {
                const lowerText = text.toLowerCase();
                const found = SENSITIVITY_LEVELS.find(opt => {
                  const key = opt.toLowerCase().replace(/\s+/g, '_');
                  const translated = t(key).toLowerCase();
                  return lowerText.includes(opt.toLowerCase()) || lowerText.includes(translated);
                });
                if (found) setSensitivity(found);
              }}
            />
          </View>
          <View style={styles.options}>
            {SENSITIVITY_LEVELS.map((option) => {
              const key = option.toLowerCase().replace(/\s+/g, '_');
              return (
                <SelectionButton
                  key={option}
                  label={t(key)}
                  selected={sensitivity === option}
                  onPress={() => setSensitivity(option)}
                />
              );
            })}
          </View>

          <TouchableOpacity
            style={[styles.button, !isValid && styles.buttonDisabled]}
            onPress={handleNext}
            disabled={!isValid}
          >
            <Text style={styles.buttonText}>{t('continue')}</Text>
          </TouchableOpacity>
        </ScrollView>
      </StepContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F3EF',
    paddingTop: 80,
  },
  content: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3D6B7A',
  },
  headerWithVoice: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 8,
  },
  options: {
    marginBottom: 24,
  },
  button: {
    backgroundColor: WizardColors.emerald[600],
    paddingVertical: 18,
    borderRadius: 24,
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 24,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
