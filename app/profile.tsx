import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useUser } from '@clerk/clerk-expo';
import { useRouter, Redirect } from 'expo-router';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import ProfileInfoRow from '@/components/ProfileInfoRow';

export default function ProfileScreen() {
  const { user, isSignedIn, isLoaded } = useUser();
  const router = useRouter();

  // Helper function to format dates
  const formatDate = (date: Date | null | undefined) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Helper function to get connected accounts
  const getConnectedAccounts = () => {
    const providers = [
      { key: 'google', label: 'Google', icon: 'google' },
      { key: 'github', label: 'GitHub', icon: 'github' },
      { key: 'linkedin', label: 'LinkedIn', icon: 'linkedin' },
    ];

    return providers.map((provider) => {
      const isConnected = user?.externalAccounts?.some(
        (account) =>
          account.verification?.strategy === `oauth_${provider.key}` ||
          account.verification?.strategy === `oauth_${provider.key}_oidc`
      );
      return { ...provider, isConnected };
    });
  };

  // Loading state
  if (!isLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style="light" />
        <ActivityIndicator size="large" color="#E8B4B8" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  // Not signed in - redirect to sign-in
  if (!isSignedIn) {
    return <Redirect href="/sign-in" />;
  }

  // Prepare user data with fallbacks
  const fullName =
    [user?.firstName, user?.lastName].filter(Boolean).join(' ') ||
    'Not provided';
  const email = user?.emailAddresses?.[0]?.emailAddress || 'No email';
  const username = user?.username || user?.firstName || 'User';
  const connectedAccounts = getConnectedAccounts();

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header Section */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color="#E8B4B8"
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Profile Photo Section */}
        <View style={styles.profilePhotoSection}>
          {user?.imageUrl ? (
            <Image
              source={{ uri: user.imageUrl }}
              style={styles.profilePhoto}
              contentFit="cover"
            />
          ) : (
            <View style={styles.profilePhotoPlaceholder}>
              <MaterialCommunityIcons
                name="account-circle"
                size={80}
                color="#E8B4B8"
              />
            </View>
          )}
          <Text style={styles.usernameDisplay}>{username}</Text>
        </View>

        {/* Personal Information Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Personal Information</Text>
          <ProfileInfoRow icon="account" label="Full Name" value={fullName} />
          <ProfileInfoRow icon="email" label="Email" value={email} />
          {user?.username && (
            <ProfileInfoRow
              icon="at"
              label="Username"
              value={user.username}
            />
          )}
        </View>

        {/* Connected Accounts Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Connected Accounts</Text>
          <View style={styles.connectedAccountsContainer}>
            {connectedAccounts.map((provider) => (
              <View key={provider.key} style={styles.providerBadge}>
                <FontAwesome5
                  name={provider.icon}
                  size={16}
                  color={provider.isConnected ? '#E8B4B8' : 'rgba(232, 180, 184, 0.3)'}
                  style={styles.providerIcon}
                />
                <Text
                  style={[
                    styles.providerLabel,
                    !provider.isConnected && styles.providerLabelDisconnected,
                  ]}
                >
                  {provider.label}
                </Text>
                {provider.isConnected && (
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={14}
                    color="#E8B4B8"
                    style={styles.checkIcon}
                  />
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Account Details Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Account Details</Text>
          <ProfileInfoRow
            icon="calendar-plus"
            label="Member Since"
            value={formatDate(user?.createdAt)}
          />
          <ProfileInfoRow
            icon="login"
            label="Last Sign In"
            value={formatDate(user?.lastSignInAt)}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'rgba(232, 180, 184, 0.7)',
    fontSize: 16,
    marginTop: 12,
  },
  scrollContainer: {
    padding: 20,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '600',
    color: '#E8B4B8',
  },
  headerSpacer: {
    width: 40,
  },
  profilePhotoSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  profilePhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#E8B4B8',
    shadowColor: '#E8B4B8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  profilePhotoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#E8B4B8',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#E8B4B8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  usernameDisplay: {
    fontSize: 20,
    fontWeight: '600',
    color: '#E8B4B8',
    marginTop: 12,
  },
  card: {
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
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#E8B4B8',
    marginBottom: 16,
  },
  connectedAccountsContainer: {
    gap: 12,
  },
  providerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  providerIcon: {
    marginRight: 12,
  },
  providerLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#E8B4B8',
  },
  providerLabelDisconnected: {
    color: 'rgba(232, 180, 184, 0.3)',
  },
  checkIcon: {
    marginLeft: 8,
  },
});
