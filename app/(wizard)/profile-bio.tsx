import { ProgressBar } from '@/components/wizard/ProgressBar';
import { SelectionButton } from '@/components/wizard/SelectionButton';
import { StepContainer } from '@/components/wizard/StepContainer';
import { VoiceInputButton } from '@/components/wizard/VoiceInputButton';
import { WizardColors } from '@/constants/theme';
import { GENDERS } from '@/constants/wizardOptions';
import { useWizard } from '@/contexts/WizardContext';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// Helper to extract numbers or parse English number words
const parseNumericSpeech = (text: string): string => {
  // Try to find raw digits first
  const digits = text.replace(/[^0-9]/g, '');
  if (digits) return digits;

  const numberMap: Record<string, number> = {
    zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
    eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20,
    thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90
  };

  const words = text.toLowerCase().replace(/-/g, ' ').split(/\s+/);
  let total = 0;
  let found = false;
  for (const word of words) {
    if (numberMap[word] !== undefined) {
      total += numberMap[word];
      found = true;
    }
  }
  return found ? total.toString() : '';
};

export default function ProfileBioScreen() {
  const router = useRouter();
  const { profile, updateProfile, setCurrentStep, t } = useWizard();
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
        title={t('personal_details')}
        subtitle={t('bio_subtitle')}
      >
        <View style={styles.content}>
          <Text style={styles.label}>{t('age_q')}</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter your age"
              placeholderTextColor="rgba(61, 107, 122, 0.4)"
              value={age}
              onChangeText={setAge}
              keyboardType="numeric"
              returnKeyType="done"
            />
            <View style={styles.voiceButton}>
              <VoiceInputButton
                onTranscript={(text) => {
                  const result = parseNumericSpeech(text);
                  if (result) {
                    setAge(result);
                  }
                }}
                disabled={false}
              />
            </View>
          </View>

          <View style={styles.headerWithVoice}>
            <Text style={styles.label}>{t('gender_q')}</Text>
            <VoiceInputButton
              onTranscript={(text) => {
                const lowerText = text.toLowerCase();
                const found = GENDERS.find(opt => {
                  const key = opt.toLowerCase().replace(/\s+/g, '_');
                  const translated = t(key).toLowerCase();
                  return lowerText.includes(opt.toLowerCase()) || lowerText.includes(translated);
                });
                if (found) setGender(found);
              }}
            />
          </View>
          <View style={styles.options}>
            {GENDERS.map((option) => (
              <SelectionButton
                key={option}
                label={t(option.toLowerCase().replace(/\s+/g, '_'))}
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
    paddingTop: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3D6B7A',
    marginBottom: 12,
    marginTop: 8,
  },
  inputContainer: {
    position: 'relative',
    marginBottom: 24,
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
  headerWithVoice: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 8,
  },
  voiceButton: {
    position: 'absolute',
    right: 10,
    top: 8,
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
