import { WizardFonts } from '@/constants/theme';
import { ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
    backgroundColor: '#F5F3EF',
  },
  content: {
    padding: 24,
  },
  title: {
    ...WizardFonts.heading,
    color: '#E8B4B8',
    marginBottom: 8,
  },
  subtitle: {
    ...WizardFonts.body,
    color: '#4A7C8C',
    marginBottom: 32,
  },
  children: {
    flex: 1,
  },
});
