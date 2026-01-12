import { ProgressBar } from '@/components/wizard/ProgressBar';
import { SelectionButton } from '@/components/wizard/SelectionButton';
import { StepContainer } from '@/components/wizard/StepContainer';
import { VoiceInputButton } from '@/components/wizard/VoiceInputButton';
import { WizardColors } from '@/constants/theme';
import { HEALTH_CONDITIONS, SKIN_CONCERNS } from '@/constants/wizardOptions';
import { useWizard } from '@/contexts/WizardContext';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ConcernsHealthScreen() {
  const router = useRouter();
  const { profile, updateProfile, setCurrentStep, t } = useWizard();
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
        title={t('concerns_health')}
        subtitle={t('concerns_subtitle')}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.headerWithVoice}>
            <Text style={styles.label}>{t('main_concerns')}</Text>
            <VoiceInputButton
              onTranscript={(text) => {
                const lowerText = text.toLowerCase();
                const found = SKIN_CONCERNS.find(opt => {
                  const key = opt.toLowerCase().replace(/\s+/g, '_').replace('dryness', 'dryness_concern').replace('oiliness', 'oiliness_concern');
                  const translated = t(key).toLowerCase();
                  return lowerText.includes(opt.toLowerCase()) || lowerText.includes(translated);
                });
                if (found) toggleConcern(found);
              }}
            />
          </View>
          <View style={styles.options}>
            {SKIN_CONCERNS.map((concern) => {
              const key = concern.toLowerCase().replace(/\s+/g, '_').replace('dryness', 'dryness_concern').replace('oiliness', 'oiliness_concern');
              return (
                <SelectionButton
                  key={concern}
                  label={t(key)}
                  selected={concerns.includes(concern)}
                  onPress={() => toggleConcern(concern)}
                />
              );
            })}
          </View>

          <View style={styles.headerWithVoice}>
            <Text style={styles.label}>{t('lifestyle')}</Text>
            <VoiceInputButton
              onTranscript={(text) => {
                const lowerText = text.toLowerCase();
                const found = HEALTH_CONDITIONS.find(opt => {
                  const key = opt.toLowerCase().replace(/\s+/g, '_');
                  const translated = t(key).toLowerCase();
                  return lowerText.includes(opt.toLowerCase()) || lowerText.includes(translated);
                });
                if (found) toggleHealthCondition(found);
              }}
            />
          </View>
          <View style={styles.options}>
            {HEALTH_CONDITIONS.map((condition) => {
              const key = condition.toLowerCase().replace(/\s+/g, '_');
              return (
                <SelectionButton
                  key={condition}
                  label={t(key)}
                  selected={healthConditions.includes(condition)}
                  onPress={() => toggleHealthCondition(condition)}
                />
              );
            })}
          </View>

          <TouchableOpacity
            style={[styles.button, !isValid && styles.buttonDisabled]}
            onPress={handleNext}
            disabled={!isValid}
          >
            <Text style={styles.buttonText}>{t('next')}</Text>
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
