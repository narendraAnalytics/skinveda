import { WizardColors } from '@/constants/theme';
import { useWizard } from '@/contexts/WizardContext';
import { useApiClient } from '@/services/apiClient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AudioModule, RecordingPresets, setAudioModeAsync, useAudioRecorder } from 'expo-audio';
import * as FileSystem from 'expo-file-system/legacy';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface VoiceInputButtonProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

export function VoiceInputButton({ onTranscript, disabled }: VoiceInputButtonProps) {
  const { profile } = useWizard();
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY, (status) => {
    console.log('[VoiceInput] Hook Status Sync:', JSON.stringify(status));
  });
  const apiClient = useApiClient();

  const startRecording = async () => {
    try {
      console.log('[VoiceInput] Requesting permissions...');
      const permission = await AudioModule.requestRecordingPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Required', 'Microphone permission is required for voice input');
        return;
      }

      console.log('[VoiceInput] Configuring audio mode...');
      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: true,
      });

      console.log('[VoiceInput] Preparing recording...');
      await audioRecorder.prepareToRecordAsync();

      console.log('[VoiceInput] Starting record command...');
      audioRecorder.record();
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setIsRecording(true);
      console.log('[VoiceInput] Local state set to RECORDING');
    } catch (error: any) {
      console.error('[VoiceInput] Failed to start recording:', error);
      Alert.alert('Error', `Failed to start recording: ${error.message}`);
    }
  };

  const stopRecording = async () => {
    console.log('[VoiceInput] stopRecording called. Current isRecording:', isRecording);
    setIsRecording(false);
    setIsProcessing(true);

    try {
      console.log('[VoiceInput] Stopping recorder...');
      await audioRecorder.stop();
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      console.log('[VoiceInput] Recorder stopped successfully.');

      const uri = audioRecorder.uri;
      console.log('[VoiceInput] Final URI:', uri);

      if (!uri) {
        throw new Error('Recording resulted in no file (URI is empty)');
      }

      // Read file as base64 using expo-file-system
      console.log('[VoiceInput] Reading file as base64...');
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: 'base64',
      });
      console.log('[VoiceInput] Base64 length:', base64.length);

      // Send to backend for transcription
      console.log('[VoiceInput] Sending to backend. Lang:', profile.language);
      const text = await apiClient.transcribeAudio(base64, 'audio/m4a', profile.language);
      console.log('[VoiceInput] Transcription result received');

      if (text) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onTranscript(text);
      } else {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        Alert.alert('No Speech Detected', 'Please try speaking again.');
      }
    } catch (error: any) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      console.error('[VoiceInput] Stop/Transcription error:', error);
      Alert.alert('Error', `Failed to process voice: ${error.message || 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePress = async () => {
    console.log('[VoiceInput] handlePress - start. isRecording:', isRecording, 'isProcessing:', isProcessing);
    if (isProcessing) return;

    try {
      if (isRecording) {
        console.log('[VoiceInput] Transitioning to STOP');
        await stopRecording();
      } else {
        console.log('[VoiceInput] Transitioning to START');
        await startRecording();
      }
    } catch (err) {
      console.error('[VoiceInput] Error in handlePress:', err);
      setIsProcessing(false);
      setIsRecording(false);
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
