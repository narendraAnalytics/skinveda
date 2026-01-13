import { MetricBar } from '@/components/wizard/MetricBar';
import { MetricCard } from '@/components/wizard/MetricCard';
import { RecommendationCard } from '@/components/wizard/RecommendationCard';
import { WizardColors, WizardFonts } from '@/constants/theme';
import { useWizard } from '@/contexts/WizardContext';
import { useApiClient } from '@/services/apiClient';
import { createAudioPlayer, type AudioPlayer } from 'expo-audio';
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DashboardScreen() {
  const router = useRouter();
  const { analysis, resetWizard, capturedImage, profile, t } = useWizard();
  const apiClient = useApiClient();
  const audioPlayerRef = useRef<AudioPlayer | null>(null);

  useEffect(() => {
    if (analysis?.summary) {
      speakSummary(analysis.summary);
    }

    // Cleanup audio player on unmount
    return () => {
      if (audioPlayerRef.current) {
        try {
          audioPlayerRef.current.remove();
        } catch (error) {
          console.error('Error removing audio player:', error);
        }
      }
    };
  }, [analysis]);

  const speakSummary = async (text: string) => {
    try {
      const audioData = await apiClient.getTTS(text, profile.language);
      if (audioData) {
        const audioSource = `data:audio/wav;base64,${audioData}`;
        const player = createAudioPlayer(audioSource);
        audioPlayerRef.current = player;
        player.play();
      }
    } catch (error) {
      console.error('TTS Playback failed:', error);
    }
  };

  if (!analysis) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No analysis data available</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('/(wizard)/welcome')}
          >
            <Text style={styles.buttonText}>{t('restart')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleReset = async () => {
    await resetWizard();
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{t('findings')}</Text>
          <Text style={styles.subtitle}>{profile.name}'s Report</Text>
        </View>

        {/* Overall Score with Image */}
        <View style={styles.scoreContainer}>
          {capturedImage && (
            <View style={styles.imageWrapper}>
              <Image
                source={{ uri: capturedImage }}
                style={styles.capturedImage}
              />
            </View>
          )}
          <Text style={styles.scoreLabel}>{t('vitality')}</Text>
          <Text style={styles.scoreValue}>{analysis.overallScore}</Text>
        </View>

        {/* Age Cards */}
        <View style={styles.cardsRow}>
          <View style={styles.cardHalf}>
            <MetricCard
              title={t('eye_age')}
              value={`${analysis.eyeAge} ${t('age_q')}`}
            />
          </View>
          <View style={styles.cardHalf}>
            <MetricCard
              title={t('skin_age')}
              value={`${analysis.skinAge} ${t('age_q')}`}
            />
          </View>
        </View>

        {/* Metrics Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('clinical')}</Text>
          <MetricBar label="Hydration" value={analysis.hydration} />
          <MetricBar label="Redness" value={analysis.redness} />
          <MetricBar label="Pigmentation" value={analysis.pigmentation} />
          <MetricBar label="Lines & Wrinkles" value={analysis.lines} />
          <MetricBar label="Acne" value={analysis.acne} />
          <MetricBar label="Translucency" value={analysis.translucency} />
          <MetricBar label="Uniformness" value={analysis.uniformness} />
          <MetricBar label="Pores" value={analysis.pores} />
        </View>

        {/* Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('reading_skin')}</Text>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryText}>{analysis.summary}</Text>
          </View>
        </View>

        {/* Diet Recommendations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('diet_guide')}</Text>
          <RecommendationCard
            title={t('juices')}
            items={analysis.recommendations.diet.juices}
          />
          <RecommendationCard
            title={t('eat')}
            items={analysis.recommendations.diet.eat}
          />
          <RecommendationCard
            title={t('avoid')}
            items={analysis.recommendations.diet.avoid}
          />
        </View>

        {/* Exercise Recommendations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('exercise_protocol')}</Text>
          <RecommendationCard
            title={t('face_exercises')}
            items={analysis.recommendations.exercises.face}
          />
          <RecommendationCard
            title={t('lifestyle')}
            items={analysis.recommendations.exercises.body}
          />
        </View>

        {/* Mindfulness & Vedic Practices */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('stress_mindset')}</Text>
          <RecommendationCard
            title={t('yoga')}
            items={analysis.recommendations.yoga}
          />
          <RecommendationCard
            title={t('meditation')}
            items={analysis.recommendations.meditation}
          />
          <RecommendationCard
            title={t('stress_mindset')}
            items={analysis.recommendations.stressManagement}
          />
        </View>

        {/* Natural Remedies */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('remedies')}</Text>
          <RecommendationCard
            title={t('remedies')}
            items={analysis.recommendations.naturalRemedies}
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.button} onPress={handleReset}>
            <Text style={styles.buttonText}>{t('restart')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F3EF',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 24,
    alignItems: 'center',
  },
  title: {
    ...WizardFonts.heading,
    color: '#E8B4B8',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#4A7C8C',
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 32,
    paddingVertical: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    marginHorizontal: 24,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: WizardColors.emerald[500],
  },
  imageWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: WizardColors.emerald[500],
    overflow: 'hidden',
    marginBottom: 16,
  },
  capturedImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  scoreLabel: {
    fontSize: 16,
    color: '#3D6B7A',
    marginBottom: 8,
    fontWeight: '600',
  },
  scoreValue: {
    fontSize: 64,
    fontWeight: '700',
    color: WizardColors.emerald[500],
  },
  cardsRow: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 16,
    marginBottom: 24,
  },
  cardHalf: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#E8B4B8',
    marginBottom: 16,
  },
  summaryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(61, 107, 122, 0.2)',
  },
  summaryText: {
    fontSize: 16,
    color: '#3D6B7A',
    lineHeight: 24,
  },
  actions: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  button: {
    backgroundColor: WizardColors.emerald[600],
    paddingVertical: 18,
    borderRadius: 24,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 18,
    color: '#3D6B7A',
    marginBottom: 24,
  },
});
