import { ProgressBar } from '@/components/wizard/ProgressBar';
import { StepContainer } from '@/components/wizard/StepContainer';
import { VoiceInputButton } from '@/components/wizard/VoiceInputButton';
import { WizardColors } from '@/constants/theme';
import { useWizard } from '@/contexts/WizardContext';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function ProfileNameScreen() {
  const router = useRouter();
  const { profile, updateProfile, setCurrentStep, t } = useWizard();
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
        title={t('name_q')}
        subtitle={t('name_q_subtitle')}
      >
        <View style={styles.content}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder={t('name_placeholder')}
              placeholderTextColor="rgba(61, 107, 122, 0.4)"
              value={name}
              onChangeText={setName}
              autoFocus
              returnKeyType="next"
              onSubmitEditing={handleNext}
            />
            <View style={styles.voiceButton}>
              <VoiceInputButton
                onTranscript={(text) => setName(text)}
                disabled={false}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.button, !name.trim() && styles.buttonDisabled]}
            onPress={handleNext}
            disabled={!name.trim()}
          >
            <Text style={styles.buttonText}>{t('continue')}</Text>
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
    justifyContent: 'center',
    paddingBottom: 40,
  },
  inputContainer: {
    position: 'relative',
    marginBottom: 32,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderWidth: 2,
    borderColor: WizardColors.emerald[500],
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingRight: 70,
    fontSize: 18,
    color: '#3D6B7A',
  },
  voiceButton: {
    position: 'absolute',
    right: 10,
    top: 8,
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
