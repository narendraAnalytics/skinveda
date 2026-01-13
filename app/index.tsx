import { useAuth, useUser } from '@clerk/clerk-expo';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as NavigationBar from 'expo-navigation-bar';
import { useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { VideoView, useVideoPlayer } from 'expo-video';
import { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

const { width, height } = Dimensions.get('screen');

export default function GradientScreen() {
  const [isMuted, setIsMuted] = useState(true);
  const [isUIVisible, setIsUIVisible] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [flowerLoaded, setFlowerLoaded] = useState(false);
  const router = useRouter();
  const { isSignedIn, user, isLoaded } = useUser();
  const { signOut } = useAuth();

  // Create video player with expo-video
  const player = useVideoPlayer(require('../public/video/video.mp4'), player => {
    player.loop = true;
    player.muted = true;
    player.play();
    setVideoLoaded(true);
  });

  // Update muted state when user toggles
  useEffect(() => {
    if (player) {
      player.muted = isMuted;
    }
  }, [isMuted, player]);

  useEffect(() => {
    NavigationBar.setVisibilityAsync('hidden');
  }, []);

  // Hide splash screen when all assets are loaded
  useEffect(() => {
    if (videoLoaded && logoLoaded && flowerLoaded && isLoaded) {
      SplashScreen.hideAsync();
    }
  }, [videoLoaded, logoLoaded, flowerLoaded, isLoaded]);

  const toggleUI = () => {
    setIsUIVisible(!isUIVisible);
    if (isUIVisible) {
      NavigationBar.setVisibilityAsync('hidden');
    } else {
      NavigationBar.setVisibilityAsync('visible');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={toggleUI}>
      <View style={styles.container}>
      <StatusBar style="light" translucent />
      {player && (
        <VideoView
          player={player}
          style={styles.fullScreenVideo}
          nativeControls={false}
          contentFit="cover"
        />
      )}
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
      {isSignedIn && user && (
        <>
          <TouchableOpacity
            style={styles.profileButtonTop}
            onPress={() => router.push('/profile')}
          >
            <MaterialCommunityIcons
              name="account-circle"
              size={24}
              color="#E8B4B8"
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.historyButtonTop}
            onPress={() => router.push('/history')}
          >
            <MaterialCommunityIcons
              name="history"
              size={24}
              color="#E8B4B8"
            />
          </TouchableOpacity>
        </>
      )}
      <Image
        source={require('../public/images/logoskinveda.png')}
        style={styles.logo}
        contentFit="contain"
        onLoad={() => setLogoLoaded(true)}
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
            onLoad={() => setFlowerLoaded(true)}
          />
        </View>
      </View>
      <View style={styles.buttonContainer}>
        {!isLoaded ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        ) : isSignedIn && user ? (
          <>
            <TouchableOpacity
              style={styles.welcomeContainer}
              onPress={() => router.push('/(wizard)/welcome')}
              activeOpacity={0.7}
            >
              <Text style={styles.welcomeText}>
                Welcome, {user.username || user.firstName || 'there'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.signOutButton}
              onPress={handleSignOut}
            >
              <MaterialCommunityIcons
                name="logout"
                size={18}
                color="#FF6B6B"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('/(auth)/sign-up')}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>Glow Guide</Text>
          </TouchableOpacity>
        )}
      </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
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
    bottom: 250,
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
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 35,
    borderWidth: 0,           // ADD THIS
    shadowColor: '#E8B4B8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonText: {
    color: '#E8B4B8',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 1,
    textAlign: 'center',
  },
  welcomeContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 35,
    shadowColor: '#E8B4B8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  welcomeText: {
    color: '#E8B4B8',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 1,
    textAlign: 'center',
  },
  loadingContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 35,
  },
  loadingText: {
    color: 'rgba(232, 180, 184, 0.7)',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 1,
    textAlign: 'center',
  },
  profileButtonTop: {
    position: 'absolute',
    top: 50,
    left: '50%',
    marginLeft: -22,
    zIndex: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    padding: 12,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyButtonTop: {
    position: 'absolute',
    top: 50,
    left: '50%',
    marginLeft: 30,
    zIndex: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    padding: 12,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.25)',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 25,
    marginTop: 15,
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  signOutText: {
    color: '#FF6B6B',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.8,
  },
});
