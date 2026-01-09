import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { WizardColors } from '@/constants/theme';

interface SelectionButtonProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

export function SelectionButton({ label, selected, onPress }: SelectionButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.button, selected && styles.buttonSelected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.text, selected && styles.textSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: 12,
  },
  buttonSelected: {
    borderColor: WizardColors.emerald[500],
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  textSelected: {
    color: WizardColors.emerald[500],
  },
});
