import { MetricBar } from '@/components/wizard/MetricBar';
import { MetricCard } from '@/components/wizard/MetricCard';
import { RecommendationCard } from '@/components/wizard/RecommendationCard';
import { WizardColors, WizardFonts } from '@/constants/theme';
import { useWizard } from '@/contexts/WizardContext';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DashboardScreen() {
  const router = useRouter();
  const { analysis, resetWizard, capturedImage } = useWizard();

  if (!analysis) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No analysis data available</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('/(wizard)/welcome')}
          >
            <Text style={styles.buttonText}>Start Over</Text>
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
          <Text style={styles.title}>Your Skin Analysis</Text>
          <Text style={styles.subtitle}>AI-Powered Holistic Assessment</Text>
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
          <Text style={styles.scoreLabel}>OVERALL VITALITY SCORE</Text>
          <Text style={styles.scoreValue}>{analysis.overallScore}</Text>
        </View>

        {/* Age Cards */}
        <View style={styles.cardsRow}>
          <View style={styles.cardHalf}>
            <MetricCard
              title="Eye Age"
              value={`${analysis.eyeAge} yrs`}
            />
          </View>
          <View style={styles.cardHalf}>
            <MetricCard
              title="Skin Age"
              value={`${analysis.skinAge} yrs`}
            />
          </View>
        </View>

        {/* Metrics Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skin Metrics</Text>
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
          <Text style={styles.sectionTitle}>Summary</Text>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryText}>{analysis.summary}</Text>
          </View>
        </View>

        {/* Diet Recommendations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Diet Recommendations</Text>
          <RecommendationCard
            title="Rejuvenating Juices"
            items={analysis.recommendations.diet.juices}
          />
          <RecommendationCard
            title="Foods to Eat"
            items={analysis.recommendations.diet.eat}
          />
          <RecommendationCard
            title="Foods to Avoid"
            items={analysis.recommendations.diet.avoid}
          />
        </View>

        {/* Exercise Recommendations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Exercise Recommendations</Text>
          <RecommendationCard
            title="Face Exercises"
            items={analysis.recommendations.exercises.face}
          />
          <RecommendationCard
            title="Body Exercises"
            items={analysis.recommendations.exercises.body}
          />
        </View>

        {/* Mindfulness & Vedic Practices */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mindfulness & Vedic Practices</Text>
          <RecommendationCard
            title="Yoga Poses"
            items={analysis.recommendations.yoga}
          />
          <RecommendationCard
            title="Meditation Practices"
            items={analysis.recommendations.meditation}
          />
          <RecommendationCard
            title="Stress Management"
            items={analysis.recommendations.stressManagement}
          />
        </View>

        {/* Natural Remedies */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Natural Remedies</Text>
          <RecommendationCard
            title="Ayurvedic Solutions"
            items={analysis.recommendations.naturalRemedies}
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.button} onPress={handleReset}>
            <Text style={styles.buttonText}>Return Home</Text>
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
