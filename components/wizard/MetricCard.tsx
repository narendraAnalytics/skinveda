import { WizardColors } from '@/constants/theme';
import { StyleSheet, Text, View } from 'react-native';

interface MetricCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
}

export function MetricCard({ title, value, subtitle }: MetricCardProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.value}>{value}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(61, 107, 122, 0.2)',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A7C8C',
    marginBottom: 8,
  },
  value: {
    fontSize: 32,
    fontWeight: '700',
    color: WizardColors.emerald[500],
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#3D6B7A',
  },
});
