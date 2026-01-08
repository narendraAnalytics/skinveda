import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

interface OAuthButtonProps {
  provider: 'google' | 'github' | 'linkedin';
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export default function OAuthButton({ provider, onPress, disabled, loading }: OAuthButtonProps) {
  const getProviderDetails = () => {
    switch (provider) {
      case 'google':
        return { icon: 'google', label: 'Continue with Google', color: '#E8B4B8' };
      case 'github':
        return { icon: 'github', label: 'Continue with GitHub', color: '#E8B4B8' };
      case 'linkedin':
        return { icon: 'linkedin', label: 'Continue with LinkedIn', color: '#E8B4B8' };
    }
  };

  const { icon, label, color } = getProviderDetails();

  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.buttonDisabled]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator size="small" color={color} />
      ) : (
        <>
          <FontAwesome5 name={icon} size={18} color={color} style={styles.icon} />
          <Text style={styles.buttonText}>{label}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 12,
    minHeight: 50,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  icon: {
    marginRight: 12,
  },
  buttonText: {
    color: '#E8B4B8',
    fontSize: 16,
    fontWeight: '600',
  },
});
