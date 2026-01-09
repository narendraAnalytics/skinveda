import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { StepContainer } from '@/components/wizard/StepContainer';
import { ProgressBar } from '@/components/wizard/ProgressBar';
import { WizardColors } from '@/constants/theme';
import { STEP_TEXTS } from '@/constants/wizardOptions';
import { useWizard } from '@/contexts/WizardContext';

export default function WelcomeScreen() {
  const router = useRouter();
  const { setCurrentStep } = useWizard();

  const handleNext = () => {
    setCurrentStep(1);
    router.push('/(wizard)/profile-name');
  };

  return (
    <View style={styles.container}>
      <ProgressBar currentStep={1} totalSteps={7} />

      <StepContainer
        title="Welcome to SkinVeda"
        subtitle={STEP_TEXTS.welcome}
      >
        <View style={styles.content}>
          <Text style={styles.description}>
            We'll analyze your skin using AI and provide personalized recommendations based on:
          </Text>

          <View style={styles.bulletPoints}>
            <Text style={styles.bullet}>• Your skin profile and concerns</Text>
            <Text style={styles.bullet}>• Health and lifestyle data</Text>
            <Text style={styles.bullet}>• Facial analysis with our camera</Text>
            <Text style={styles.bullet}>• Ancient Vedic wisdom combined with modern science</Text>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleNext}>
            <Text style={styles.buttonText}>Begin Your Journey</Text>
          </TouchableOpacity>
        </View>
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
    justifyContent: 'center',
  },
  description: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 24,
    marginBottom: 24,
  },
  bulletPoints: {
    marginBottom: 48,
  },
  bullet: {
    fontSize: 16,
    color: WizardColors.emerald[500],
    lineHeight: 28,
  },
  button: {
    backgroundColor: WizardColors.emerald[600],
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 24,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
