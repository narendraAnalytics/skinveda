import { ProgressBar } from '@/components/wizard/ProgressBar';
import { SelectionButton } from '@/components/wizard/SelectionButton';
import { StepContainer } from '@/components/wizard/StepContainer';
import { WizardColors } from '@/constants/theme';
import { GENDERS, STEP_TEXTS } from '@/constants/wizardOptions';
import { useWizard } from '@/contexts/WizardContext';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function ProfileBioScreen() {
  const router = useRouter();
  const { profile, updateProfile, setCurrentStep } = useWizard();
  const [age, setAge] = useState(profile.age);
  const [gender, setGender] = useState(profile.gender);

  const handleNext = () => {
    if (age.trim() && gender) {
      updateProfile({ age: age.trim(), gender });
      setCurrentStep(3);
      router.push('/(wizard)/skin-details');
    }
  };

  const isValid = age.trim() && gender;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ProgressBar currentStep={3} totalSteps={7} />

      <StepContainer
        title="About You"
        subtitle={STEP_TEXTS.profileBio}
      >
        <View style={styles.content}>
          <Text style={styles.label}>Age</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your age"
            placeholderTextColor="rgba(61, 107, 122, 0.4)"
            value={age}
            onChangeText={setAge}
            keyboardType="numeric"
            returnKeyType="done"
          />

          <Text style={styles.label}>Gender</Text>
          <View style={styles.options}>
            {GENDERS.map((option) => (
              <SelectionButton
                key={option}
                label={option}
                selected={gender === option}
                onPress={() => setGender(option)}
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
        </View>
      </StepContainer>
    </KeyboardAvoidingView>
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
    paddingTop: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3D6B7A',
    marginBottom: 12,
    marginTop: 8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderWidth: 2,
    borderColor: WizardColors.emerald[500],
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 18,
    color: '#3D6B7A',
    marginBottom: 24,
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
