import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface ProfileInfoRowProps {
  icon: string;
  label: string;
  value: string;
}

export default function ProfileInfoRow({ icon, label, value }: ProfileInfoRowProps) {
  return (
    <View style={styles.infoRow}>
      <MaterialCommunityIcons
        name={icon as any}
        size={20}
        color="#E8B4B8"
        style={styles.icon}
      />
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(232, 180, 184, 0.1)',
  },
  icon: {
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '400',
    color: 'rgba(232, 180, 184, 0.7)',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#E8B4B8',
  },
});
