import { ReactNode } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WizardFonts } from '@/constants/theme';

interface StepContainerProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function StepContainer({
  title,
  subtitle,
  children,
}: StepContainerProps) {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        <View style={styles.children}>{children}</View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  content: {
    padding: 24,
  },
  title: {
    ...WizardFonts.heading,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    ...WizardFonts.body,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 32,
  },
  children: {
    flex: 1,
  },
});
