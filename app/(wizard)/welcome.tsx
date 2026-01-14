import { ProgressBar } from '@/components/wizard/ProgressBar';
import { WizardColors, WizardFonts } from '@/constants/theme';
import { LANGUAGES } from '@/constants/translations';
import { useWizard } from '@/contexts/WizardContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function WelcomeScreen() {
  const router = useRouter();
  const { setCurrentStep, profile, updateProfile, resetWizard, t } = useWizard();

  const handleNext = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    resetWizard(true);
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
          <Text style={styles.title}>{t('welcome')}</Text>
          <Text style={styles.subtitle}>{t('welcome_subtitle')}</Text>

          <View style={styles.content}>
            <View style={styles.languageSelection}>
              <Text style={styles.languageLabel}>{t('select_lang')}</Text>
              <View style={styles.languageGrid}>
                {LANGUAGES.map((lang) => (
                  <TouchableOpacity
                    key={lang.id}
                    style={[
                      styles.languageButton,
                      profile.language === lang.id && styles.languageButtonActive
                    ]}
                    onPress={async () => {
                      await Haptics.selectionAsync();
                      updateProfile({ language: lang.id });
                    }}
                  >
                    <Text style={[
                      styles.languageText,
                      profile.language === lang.id && styles.languageTextActive
                    ]}>
                      {lang.native}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity style={styles.button} onPress={handleNext}>
              <Text style={styles.buttonText}>{t('get_started')}</Text>
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
  languageSelection: {
    marginBottom: 30,
    marginTop: 10,
  },
  languageLabel: {
    fontSize: 12,
    fontWeight: '900',
    color: '#3D6B7A',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 12,
  },
  languageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  languageButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E8E8E8',
    backgroundColor: '#FFFFFF',
    minWidth: '48%',
  },
  languageButtonActive: {
    borderColor: WizardColors.emerald[500],
    backgroundColor: WizardColors.emerald[50],
  },
  languageText: {
    fontSize: 14,
    color: '#3D6B7A',
    textAlign: 'center',
  },
  languageTextActive: {
    color: WizardColors.emerald[600],
    fontWeight: '700',
  },
});
