import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { StepContainer } from '@/components/wizard/StepContainer';
import { ProgressBar } from '@/components/wizard/ProgressBar';
import { SelectionButton } from '@/components/wizard/SelectionButton';
import { WizardColors } from '@/constants/theme';
import { STEP_TEXTS, SKIN_TYPES, SENSITIVITY_LEVELS } from '@/constants/wizardOptions';
import { useWizard } from '@/contexts/WizardContext';

export default function SkinDetailsScreen() {
  const router = useRouter();
  const { profile, updateProfile, setCurrentStep } = useWizard();
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
        title="Skin Profile"
        subtitle={STEP_TEXTS.skinDetails}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.label}>Skin Type</Text>
          <View style={styles.options}>
            {SKIN_TYPES.map((option) => (
              <SelectionButton
                key={option}
                label={option}
                selected={skinType === option}
                onPress={() => setSkinType(option)}
              />
            ))}
          </View>

          <Text style={styles.label}>Sensitivity Level</Text>
          <View style={styles.options}>
            {SENSITIVITY_LEVELS.map((option) => (
              <SelectionButton
                key={option}
                label={option}
                selected={sensitivity === option}
                onPress={() => setSensitivity(option)}
              />
            ))}
          </View>

          <TouchableOpacity
            style={[styles.button, !isValid && styles.buttonDisabled]}
            onPress={handleNext}
            disabled={!isValid}
          >
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
        </ScrollView>
      </StepContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  content: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
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
