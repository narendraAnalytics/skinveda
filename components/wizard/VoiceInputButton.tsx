import { WizardColors } from '@/constants/theme';
import { useApiClient } from '@/services/apiClient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface VoiceInputButtonProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

export function VoiceInputButton({ onTranscript, disabled = false }: VoiceInputButtonProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const apiClient = useApiClient();

  const startRecording = async () => {
    try {
      // Request permissions
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Required', 'Microphone permission is required for voice input');
        return;
      }

      // Set audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Start recording
      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(newRecording);
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Error', 'Failed to start recording. Please try again.');
    }
  };

  const stopRecording = async () => {
    try {
      if (!recording) return;

      setIsRecording(false);
      setIsProcessing(true);

      // Stop recording
      console.log('[VoiceInput] Stopping recording...');
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      console.log('[VoiceInput] Recording URI:', uri);

      if (!uri) {
        throw new Error('No recording URI');
      }

      // Read file as base64 using expo-file-system
      console.log('[VoiceInput] Reading file as base64...');
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: 'base64',
      });

      // Send to backend for transcription
      console.log('[VoiceInput] Sending to backend for transcription...');
      const text = await apiClient.transcribeAudio(base64, 'audio/m4a');
      console.log('[VoiceInput] Transcription result:', text);

      if (text) {
        onTranscript(text);
      } else {
        Alert.alert('No Speech Detected', 'Please try speaking again.');
      }

      setIsProcessing(false);
      setRecording(null);
    } catch (error: any) {
      console.error('Transcription error:', error);
      console.error('Error details:', error.message, error.stack);
      setIsProcessing(false);
      setRecording(null);
      Alert.alert('Error', `Failed to transcribe audio: ${error.message || 'Please try again.'}`);
    }
  };

  const handlePress = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const isDisabled = disabled || isProcessing;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.button,
          isRecording && styles.buttonRecording,
          isDisabled && styles.buttonDisabled
        ]}
        onPress={handlePress}
        disabled={isDisabled}
      >
        {isProcessing ? (
          <ActivityIndicator size="small" color={WizardColors.emerald[500]} />
        ) : (
          <MaterialCommunityIcons
            name={isRecording ? 'stop' : 'microphone'}
            size={24}
            color={isRecording ? '#FF6B6B' : WizardColors.emerald[500]}
          />
        )}
      </TouchableOpacity>

      {isRecording && (
        <View style={styles.recordingIndicator}>
          <View style={styles.pulse} />
          <Text style={styles.recordingText}>Listening...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  button: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderWidth: 2,
    borderColor: WizardColors.emerald[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonRecording: {
    borderColor: '#FF6B6B',
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  recordingIndicator: {
    position: 'absolute',
    top: -35,
    left: '50%',
    transform: [{ translateX: -50 }],
    backgroundColor: WizardColors.emerald[500],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 100,
  },
  pulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    marginRight: 6,
  },
  recordingText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});
