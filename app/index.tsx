import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ResizeMode, Video } from 'expo-av';
import { Image } from 'expo-image';
import * as NavigationBar from 'expo-navigation-bar';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

const { width, height } = Dimensions.get('screen');

export default function GradientScreen() {
  const [isMuted, setIsMuted] = useState(true);
  const [isUIVisible, setIsUIVisible] = useState(false);
  const videoRef = useRef<Video>(null);

  useEffect(() => {
    NavigationBar.setVisibilityAsync('hidden');
    NavigationBar.setBehaviorAsync('overlay-swipe');
    NavigationBar.setBackgroundColorAsync('#000000');
  }, []);

  const toggleUI = () => {
    setIsUIVisible(!isUIVisible);
    if (isUIVisible) {
      NavigationBar.setVisibilityAsync('hidden');
    } else {
      NavigationBar.setVisibilityAsync('visible');
    }
  };

  return (
    <TouchableWithoutFeedback onPress={toggleUI}>
      <View style={styles.container}>
      <StatusBar style="light" translucent />
      <Video
        ref={videoRef}
        source={require('../public/video/video.mp4')}
        style={styles.fullScreenVideo}
        resizeMode={ResizeMode.COVER}
        shouldPlay={true}
        isLooping={true}
        isMuted={isMuted}
        useNativeControls={false}
      />
      <View style={styles.overlay} />
      <TouchableOpacity
        style={styles.muteButton}
        onPress={() => setIsMuted(!isMuted)}
      >
        <MaterialCommunityIcons
          name={isMuted ? 'volume-mute' : 'volume-high'}
          size={24}
          color="#E8B4B8"
        />
      </TouchableOpacity>
      <Image
        source={require('../public/images/logoskinveda.png')}
        style={styles.logo}
        contentFit="contain"
      />
      <Text style={styles.tagline}>From face scan to skin wisdom</Text>
      <View style={styles.textOverlay}>
        <Text style={styles.text}>Your Personal skincare</Text>
        <View style={styles.companionRow}>
          <Text style={styles.text}>companion</Text>
          <Image
            source={require('../public/images/flowerimage.png')}
            style={styles.flowerIcon}
            contentFit="contain"
          />
        </View>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Glow Guide</Text>
        </TouchableOpacity>
      </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  fullScreenVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width,
    height: height,
  },
  muteButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    padding: 12,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    position: 'absolute',
    top: 60,
    left: 20,
    width: 80,
    height: 80,
    zIndex: 10,
  },
  tagline: {
    position: 'absolute',
    top: 150,
    left: 20,
    fontSize: 12,
    color: '#E8B4B8',
    fontWeight: '400',
    letterSpacing: 0.5,
    opacity: 0.9,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    zIndex: 10,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width,
    height: height,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  textOverlay: {
    position: 'absolute',
    bottom: 185,
    left: 30,
    right: 0,
    alignItems: 'flex-start',
  },
  text: {
    color: '#E8B4B8',
    fontSize: 27,
    fontFamily: 'serif',
    fontWeight: '300',
    fontStyle: 'italic',
    letterSpacing: 1.2,
    textAlign: 'left',
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 8,
  },
  companionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flowerIcon: {
    width: 30,
    height: 30,
    marginLeft: 8,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 100,
    width: width,
    alignItems: 'center',
  },
  button: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderWidth: 2,
    borderColor: '#E8B4B8',
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 35,
    shadowColor: '#E8B4B8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: '#E8B4B8',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 1,
    textAlign: 'center',
  },
});
