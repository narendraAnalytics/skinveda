import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams, Redirect } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApiClient } from '@/services/apiClient';
import { StoredAnalysis } from '@/types/wizard';
import { MetricBar } from '@/components/wizard/MetricBar';
import { MetricCard } from '@/components/wizard/MetricCard';
import { RecommendationCard } from '@/components/wizard/RecommendationCard';
import { WizardFonts, WizardColors } from '@/constants/theme';

export default function AnalysisDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { isSignedIn, isLoaded } = useUser();
  const apiClient = useApiClient();

  const [analysis, setAnalysis] = useState<StoredAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && isSignedIn && id) {
      loadAnalysis();
    }
  }, [isLoaded, isSignedIn, id]);

  const loadAnalysis = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getAnalysisById(id as string);
      setAnalysis(data);
    } catch (error) {
      console.error('Failed to load analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded || loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#E8B4B8" />
      </SafeAreaView>
    );
  }

  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  if (!analysis) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Analysis not found</Text>
          <TouchableOpacity style={styles.button} onPress={() => router.back()}>
            <Text style={styles.buttonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#E8B4B8" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.title}>Analysis Details</Text>
            <Text style={styles.subtitle}>{formatDate(analysis.createdAt)}</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>

        {/* Overall Score */}
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreValue}>{analysis.analysis.overallScore}</Text>
          <Text style={styles.scoreLabel}>Overall Score</Text>
        </View>

        {/* Age Cards */}
        <View style={styles.cardsRow}>
          <View style={styles.cardHalf}>
            <MetricCard title="Eye Age" value={`${analysis.analysis.eyeAge} yrs`} />
          </View>
          <View style={styles.cardHalf}>
            <MetricCard title="Skin Age" value={`${analysis.analysis.skinAge} yrs`} />
          </View>
        </View>

        {/* Metrics Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skin Metrics</Text>
          <MetricBar label="Hydration" value={analysis.analysis.hydration} />
          <MetricBar label="Redness" value={analysis.analysis.redness} />
          <MetricBar label="Pigmentation" value={analysis.analysis.pigmentation} />
          <MetricBar label="Lines & Wrinkles" value={analysis.analysis.lines} />
          <MetricBar label="Acne" value={analysis.analysis.acne} />
          <MetricBar label="Translucency" value={analysis.analysis.translucency} />
          <MetricBar label="Uniformness" value={analysis.analysis.uniformness} />
          <MetricBar label="Pores" value={analysis.analysis.pores} />
        </View>

        {/* Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryText}>{analysis.analysis.summary}</Text>
          </View>
        </View>

        {/* Diet Recommendations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Diet Recommendations</Text>
          <RecommendationCard
            title="Rejuvenating Juices"
            items={analysis.analysis.recommendations.diet.juices}
          />
          <RecommendationCard
            title="Foods to Eat"
            items={analysis.analysis.recommendations.diet.eat}
          />
          <RecommendationCard
            title="Foods to Avoid"
            items={analysis.analysis.recommendations.diet.avoid}
          />
        </View>

        {/* Exercise Recommendations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Exercise Recommendations</Text>
          <RecommendationCard
            title="Face Exercises"
            items={analysis.analysis.recommendations.exercises.face}
          />
          <RecommendationCard
            title="Body Exercises"
            items={analysis.analysis.recommendations.exercises.body}
          />
        </View>

        {/* Mindfulness & Vedic Practices */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mindfulness & Vedic Practices</Text>
          <RecommendationCard
            title="Yoga Poses"
            items={analysis.analysis.recommendations.yoga}
          />
          <RecommendationCard
            title="Meditation Practices"
            items={analysis.analysis.recommendations.meditation}
          />
          <RecommendationCard
            title="Stress Management"
            items={analysis.analysis.recommendations.stressManagement}
          />
        </View>

        {/* Natural Remedies */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Natural Remedies</Text>
          <RecommendationCard
            title="Ayurvedic Solutions"
            items={analysis.analysis.recommendations.naturalRemedies}
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.button} onPress={() => router.push('/')}>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  backButton: {
    padding: 8,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  title: {
    ...WizardFonts.heading,
    color: '#E8B4B8',
    fontSize: 22,
  },
  subtitle: {
    fontSize: 12,
    color: '#4A7C8C',
    marginTop: 4,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 16,
    paddingVertical: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    marginHorizontal: 24,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: WizardColors.emerald[500],
  },
  scoreValue: {
    fontSize: 64,
    fontWeight: '700',
    color: WizardColors.emerald[500],
  },
  scoreLabel: {
    fontSize: 16,
    color: '#3D6B7A',
    marginTop: 8,
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
