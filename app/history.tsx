import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, Redirect } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useApiClient } from '@/services/apiClient';
import { AnalysisListItem } from '@/types/wizard';

export default function HistoryScreen() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();
  const apiClient = useApiClient();

  const [analyses, setAnalyses] = useState<AnalysisListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      loadAnalyses();
    }
  }, [isLoaded, isSignedIn]);

  const loadAnalyses = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getAnalyses();
      setAnalyses(data);
    } catch (error) {
      console.error('Failed to load analyses:', error);
      Alert.alert('Error', 'Failed to load analysis history');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAnalyses();
    setRefreshing(false);
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Delete Analysis',
      'Are you sure you want to delete this analysis? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiClient.deleteAnalysis(id);
              setAnalyses((prev) => prev.filter((a) => a.id !== id));
            } catch (error) {
              console.error('Failed to delete analysis:', error);
              Alert.alert('Error', 'Failed to delete analysis');
            }
          },
        },
      ]
    );
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (!isLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style="light" />
        <ActivityIndicator size="large" color="#E8B4B8" />
      </View>
    );
  }

  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#E8B4B8" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Analysis History</Text>
        <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
          <MaterialCommunityIcons name="refresh" size={24} color="#E8B4B8" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E8B4B8" />
          <Text style={styles.loadingText}>Loading history...</Text>
        </View>
      ) : analyses.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="history" size={80} color="rgba(232, 180, 184, 0.3)" />
          <Text style={styles.emptyText}>No analyses yet</Text>
          <Text style={styles.emptySubtext}>
            Complete a skin analysis to see your history here
          </Text>
          <TouchableOpacity
            style={styles.startButton}
            onPress={() => router.push('/(wizard)/welcome')}
          >
            <Text style={styles.startButtonText}>Start Analysis</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {analyses.map((analysis) => (
            <TouchableOpacity
              key={analysis.id}
              style={styles.analysisCard}
              onPress={() => router.push(`/analysis/${analysis.id}`)}
            >
              <View style={styles.cardHeader}>
                <View style={styles.scoreCircle}>
                  <Text style={styles.scoreText}>{analysis.overallScore}</Text>
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardDate}>{formatDate(analysis.createdAt)}</Text>
                  <View style={styles.cardMetrics}>
                    <View style={styles.metricItem}>
                      <MaterialCommunityIcons name="eye" size={16} color="#E8B4B8" />
                      <Text style={styles.metricText}>{analysis.eyeAge} yrs</Text>
                    </View>
                    <View style={styles.metricItem}>
                      <MaterialCommunityIcons name="account" size={16} color="#E8B4B8" />
                      <Text style={styles.metricText}>{analysis.skinAge} yrs</Text>
                    </View>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDelete(analysis.id)}
                >
                  <MaterialCommunityIcons name="delete" size={24} color="#FF6B6B" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#E8B4B8',
  },
  refreshButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'rgba(232, 180, 184, 0.7)',
    fontSize: 16,
    marginTop: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#E8B4B8',
    marginTop: 20,
  },
  emptySubtext: {
    fontSize: 16,
    color: 'rgba(232, 180, 184, 0.6)',
    textAlign: 'center',
    marginTop: 12,
  },
  startButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 35,
    marginTop: 30,
    shadowColor: '#E8B4B8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  startButtonText: {
    color: '#E8B4B8',
    fontSize: 18,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  analysisCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#E8B4B8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderWidth: 2,
    borderColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#10B981',
  },
  cardInfo: {
    flex: 1,
    marginLeft: 16,
  },
  cardDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E8B4B8',
    marginBottom: 8,
  },
  cardMetrics: {
    flexDirection: 'row',
    gap: 16,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricText: {
    fontSize: 14,
    color: 'rgba(232, 180, 184, 0.8)',
  },
  deleteButton: {
    padding: 8,
  },
});
