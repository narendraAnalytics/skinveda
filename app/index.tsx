import { Image } from 'expo-image';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function GradientScreen() {
  return (
    <View style={styles.container}>
      <Image
        source={require('../public/images/bannerimage.png')}
        style={styles.fullScreenImage}
        contentFit="cover"
      />
      <View style={styles.overlay} />
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  fullScreenImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width,
    height: height,
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
