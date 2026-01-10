import { WizardColors, WizardFonts } from '@/constants/theme';
import { STEP_TEXTS } from '@/constants/wizardOptions';
import { useWizard } from '@/contexts/WizardContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ProgressBar } from '@/components/wizard/ProgressBar';

export default function WelcomeScreen() {
  const router = useRouter();
  const { setCurrentStep } = useWizard();

  const handleNext = () => {
    setCurrentStep(1);
    router.push('/(wizard)/profile-name');
  };

  const handleHome = () => {
    router.push('/');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Home Icon at Top Center */}
      <TouchableOpacity style={styles.homeButton} onPress={handleHome}>
        <MaterialCommunityIcons
          name="home"
          size={28}
          color={WizardColors.emerald[500]}
        />
      </TouchableOpacity>

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <ProgressBar currentStep={1} totalSteps={7} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentWrapper}>
          <Text style={styles.title}>Welcome to SkinVeda</Text>
          <Text style={styles.subtitle}>{STEP_TEXTS.welcome}</Text>

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
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F3EF',
  },
  homeButton: {
    position: 'absolute',
    top: 50,
    alignSelf: 'center',
    zIndex: 10,
    padding: 10,
  },
  progressBarContainer: {
    position: 'absolute',
    top: 90,
    left: 0,
    right: 0,
    zIndex: 5,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 140,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  contentWrapper: {
    flex: 1,
    justifyContent: 'space-between',
  },
  title: {
    ...WizardFonts.heading,
    color: '#E8B4B8',
    marginBottom: 15,
  },
  subtitle: {
    ...WizardFonts.body,
    color: '#4A7C8C',
    marginBottom: 16,
    lineHeight: 25,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: 20,
  },
  description: {
    fontSize: 16,
    color: '#3D6B7A',
    lineHeight: 24,
    marginBottom: 20,
  },
  bulletPoints: {
    marginBottom: 70,
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
