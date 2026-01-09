import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { StepContainer } from '@/components/wizard/StepContainer';
import { ProgressBar } from '@/components/wizard/ProgressBar';
import { SelectionButton } from '@/components/wizard/SelectionButton';
import { WizardColors } from '@/constants/theme';
import { STEP_TEXTS, SKIN_CONCERNS, HEALTH_CONDITIONS } from '@/constants/wizardOptions';
import { useWizard } from '@/contexts/WizardContext';

export default function ConcernsHealthScreen() {
  const router = useRouter();
  const { profile, updateProfile, setCurrentStep } = useWizard();
  const [concerns, setConcerns] = useState<string[]>(profile.concerns);
  const [healthConditions, setHealthConditions] = useState<string[]>(profile.healthConditions);

  const toggleConcern = (concern: string) => {
    if (concerns.includes(concern)) {
      setConcerns(concerns.filter(c => c !== concern));
    } else {
      setConcerns([...concerns, concern]);
    }
  };

  const toggleHealthCondition = (condition: string) => {
    if (healthConditions.includes(condition)) {
      setHealthConditions(healthConditions.filter(c => c !== condition));
    } else {
      setHealthConditions([...healthConditions, condition]);
    }
  };

  const handleNext = () => {
    if (concerns.length > 0 && healthConditions.length > 0) {
      updateProfile({ concerns, healthConditions });
      setCurrentStep(5);
      router.push('/(wizard)/photo-capture');
    }
  };

  const isValid = concerns.length > 0 && healthConditions.length > 0;

  return (
    <View style={styles.container}>
      <ProgressBar currentStep={5} totalSteps={7} />

      <StepContainer
        title="Concerns & Health"
        subtitle={STEP_TEXTS.concernsHealth}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.label}>Skin Concerns (Select all that apply)</Text>
          <View style={styles.options}>
            {SKIN_CONCERNS.map((concern) => (
              <SelectionButton
                key={concern}
                label={concern}
                selected={concerns.includes(concern)}
                onPress={() => toggleConcern(concern)}
              />
            ))}
          </View>

          <Text style={styles.label}>Health Conditions (Select all that apply)</Text>
          <View style={styles.options}>
            {HEALTH_CONDITIONS.map((condition) => (
              <SelectionButton
                key={condition}
                label={condition}
                selected={healthConditions.includes(condition)}
                onPress={() => toggleHealthCondition(condition)}
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
