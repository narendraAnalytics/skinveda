import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { StepContainer } from '@/components/wizard/StepContainer';
import { ProgressBar } from '@/components/wizard/ProgressBar';
import { WizardColors } from '@/constants/theme';
import { STEP_TEXTS } from '@/constants/wizardOptions';
import { useWizard } from '@/contexts/WizardContext';

export default function ProfileNameScreen() {
  const router = useRouter();
  const { profile, updateProfile, setCurrentStep } = useWizard();
  const [name, setName] = useState(profile.name);

  const handleNext = () => {
    if (name.trim()) {
      updateProfile({ name: name.trim() });
      setCurrentStep(2);
      router.push('/(wizard)/profile-bio');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ProgressBar currentStep={2} totalSteps={7} />

      <StepContainer
        title="What's your name?"
        subtitle={STEP_TEXTS.profileName}
      >
        <View style={styles.content}>
          <TextInput
            style={styles.input}
            placeholder="Enter your name"
            placeholderTextColor="rgba(255, 255, 255, 0.4)"
            value={name}
            onChangeText={setName}
            autoFocus
            returnKeyType="next"
            onSubmitEditing={handleNext}
          />

          <TouchableOpacity
            style={[styles.button, !name.trim() && styles.buttonDisabled]}
            onPress={handleNext}
            disabled={!name.trim()}
          >
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </StepContainer>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 40,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 2,
    borderColor: WizardColors.emerald[500],
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 32,
  },
  button: {
    backgroundColor: WizardColors.emerald[600],
    paddingVertical: 18,
    borderRadius: 24,
    alignItems: 'center',
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
