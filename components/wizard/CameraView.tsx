import { WizardColors } from '@/constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CameraView as ExpoCamera, useCameraPermissions } from 'expo-camera';
import { useRef, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Ellipse } from 'react-native-svg';

interface CameraViewProps {
  onCapture: (imageUri: string) => void;
}

export function CameraView({ onCapture }: CameraViewProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<any>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  if (!permission) {
    return <View style={styles.container}><Text style={styles.loadingText}>Loading...</Text></View>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <MaterialCommunityIcons name="camera-off" size={64} color={WizardColors.emerald[500]} />
        <Text style={styles.permissionText}>
          Camera access is required to analyze your skin
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePicture = async () => {
    if (!cameraRef.current || isCapturing) return;

    setIsCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.8,
        exif: false,
      });

      if (photo && photo.base64) {
        onCapture(`data:image/jpeg;base64,${photo.base64}`);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to capture photo');
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <View style={styles.container}>
      <ExpoCamera
        ref={cameraRef}
        style={styles.camera}
        facing="front"
      />

      {/* Face Guide Overlay */}
      <View style={styles.overlay}>
        <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
          <Ellipse
            cx="50%"
            cy="45%"
            rx="40%"
            ry="30%"
            stroke="#FFFFFF"
            strokeWidth="3"
            strokeDasharray="10, 5"
            fill="transparent"
            opacity={0.6}
          />
        </Svg>

        <Text style={styles.guideText}>
          Position your face within the oval
        </Text>
      </View>

      {/* Capture Button */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.captureButton, isCapturing && styles.captureButtonDisabled]}
          onPress={takePicture}
          disabled={isCapturing}
        >
          <View style={styles.captureButtonInner} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 100,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guideText: {
    position: 'absolute',
    bottom: 120,
    fontSize: 16,
    color: '#FFFFFF',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  controls: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F3EF',
    padding: 24,
  },
  permissionText: {
    fontSize: 18,
    color: '#3D6B7A',
    textAlign: 'center',
    marginVertical: 24,
  },
  permissionButton: {
    backgroundColor: WizardColors.emerald[600],
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 24,
  },
  permissionButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
