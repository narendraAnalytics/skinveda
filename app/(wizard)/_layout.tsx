import { WizardProvider } from '@/contexts/WizardContext';
import { useAuth } from '@clerk/clerk-expo';
import { Redirect, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

export default function WizardLayout() {
  const { isSignedIn, isLoaded } = useAuth();

  // Show loading while authentication status loads
  if (!isLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Redirect to sign-in if not authenticated
  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  // Render wizard for authenticated users
  return (
    <WizardProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: '#F5F3EF' }
      }}>
        <Stack.Screen name="welcome" />
        <Stack.Screen name="profile-name" />
        <Stack.Screen name="profile-bio" />
        <Stack.Screen name="skin-details" />
        <Stack.Screen name="concerns-health" />
        <Stack.Screen name="photo-capture" />
        <Stack.Screen name="dashboard" />
      </Stack>
    </WizardProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F5F3EF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#FFFFFF',
  },
});
