import { WizardColors } from '@/constants/theme';
import { StyleSheet, Text, View } from 'react-native';

interface RecommendationCardProps {
  title: string;
  items: string[];
  icon?: string;
}

export function RecommendationCard({ title, items }: RecommendationCardProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.itemsContainer}>
        {items.map((item, index) => (
          <View key={index} style={styles.item}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.itemText}>{item}</Text>
          </View>
        ))}
      </View>
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
    fontSize: 18,
    fontWeight: '700',
    color: '#E8B4B8',
    marginBottom: 16,
  },
  itemsContainer: {
    gap: 12,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bullet: {
    fontSize: 16,
    color: WizardColors.emerald[500],
    marginRight: 8,
    marginTop: 2,
  },
  itemText: {
    flex: 1,
    fontSize: 14,
    color: '#3D6B7A',
    lineHeight: 20,
  },
});
