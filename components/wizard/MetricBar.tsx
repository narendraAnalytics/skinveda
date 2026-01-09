import { View, Text, StyleSheet } from 'react-native';
import { WizardColors } from '@/constants/theme';

interface MetricBarProps {
  label: string;
  value: number;
  maxValue?: number;
}

export function MetricBar({ label, value, maxValue = 100 }: MetricBarProps) {
  const percentage = (value / maxValue) * 100;
  const color = percentage >= 70 ? WizardColors.success : percentage >= 40 ? WizardColors.warning : '#FF6B6B';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}%</Text>
      </View>
      <View style={styles.barBackground}>
        <View style={[styles.barFill, { width: `${percentage}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  value: {
    fontSize: 14,
    fontWeight: '700',
    color: WizardColors.emerald[500],
  },
  barBackground: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
});
