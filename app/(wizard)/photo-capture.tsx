import { CameraView } from '@/components/wizard/CameraView';
import { ProgressBar } from '@/components/wizard/ProgressBar';
import { WizardColors } from '@/constants/theme';
import { useWizard } from '@/contexts/WizardContext';
import { useApiClient } from '@/services/apiClient';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function PhotoCaptureScreen() {
  const router = useRouter();
  const { capturedImage, setCapturedImage, profile, setAnalysis, setCurrentStep } = useWizard();
  const [showCamera, setShowCamera] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const apiClient = useApiClient();

  const handleCapture = (imageUri: string) => {
    setCapturedImage(imageUri);
    setShowCamera(false);
  };

  const handleUpload = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 5],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      setCapturedImage(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  const handleAnalyze = async () => {
    if (!capturedImage) return;

    setIsAnalyzing(true);
    setCurrentStep(7);

    try {
      // Remove data URL prefix for backend
      const base64Image = capturedImage.replace(/^data:image\/[a-z]+;base64,/, '');

      const result = await apiClient.analyzeSkin(profile, base64Image);
      setAnalysis(result);
      router.push('/(wizard)/dashboard');
    } catch (error: any) {
      console.error('Analysis failed:', error);
      const message = error.message === 'Network request failed'
        ? 'Could not connect to analysis server. Please ensure the backend is running and your EXPO_PUBLIC_BACKEND_URL is correct.'
        : `Analysis failed: ${error.message}`;
      alert(message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (showCamera) {
    return <CameraView onCapture={handleCapture} />;
  }

  return (
    <View style={styles.container}>
      <ProgressBar currentStep={6} totalSteps={7} />

      <View style={styles.content}>
        <Text style={styles.title}>Capture Your Face</Text>

        {capturedImage ? (
          <View style={styles.preview}>
            <Image source={{ uri: capturedImage }} style={styles.image} />
            <TouchableOpacity style={styles.retakeButton} onPress={() => setCapturedImage(null)}>
              <Text style={styles.retakeText}>Retake Photo</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.options}>
            <TouchableOpacity style={styles.button} onPress={() => setShowCamera(true)}>
              <Text style={styles.buttonText}>Open Camera</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.buttonSecondary} onPress={handleUpload}>
              <Text style={styles.buttonSecondaryText}>Upload Photo</Text>
            </TouchableOpacity>
          </View>
        )}

        {capturedImage && (
          <TouchableOpacity
            style={[styles.analyzeButton, isAnalyzing && styles.analyzeButtonDisabled]}
            onPress={handleAnalyze}
            disabled={isAnalyzing}
          >
            <Text style={styles.analyzeButtonText}>
              {isAnalyzing ? 'Analyzing...' : 'Analyze My Skin'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
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
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#E8B4B8',
    marginBottom: 32,
  },
  preview: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '80%',
    aspectRatio: 4 / 5,
    borderRadius: 16,
  },
  retakeButton: {
    marginTop: 24,
  },
  retakeText: {
    fontSize: 16,
    color: WizardColors.emerald[500],
  },
  options: {
    flex: 1,
    justifyContent: 'center',
  },
  button: {
    backgroundColor: WizardColors.emerald[600],
    paddingVertical: 18,
    borderRadius: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  buttonSecondary: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    paddingVertical: 18,
    borderRadius: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(61, 107, 122, 0.2)',
  },
  buttonSecondaryText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3D6B7A',
  },
  analyzeButton: {
    backgroundColor: WizardColors.emerald[600],
    paddingVertical: 18,
    borderRadius: 24,
    alignItems: 'center',
    marginTop: 24,
  },
  analyzeButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  analyzeButtonDisabled: {
    opacity: 0.5,
  },
});
