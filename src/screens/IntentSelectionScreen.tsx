import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { theme } from '../theme/theme';
import { Card } from '../components/Card';
import { Truck, Network, BarChart3, ChevronRight } from 'lucide-react-native';

export const IntentSelectionScreen = ({ navigation }: any) => {
  const options = [
    {
      id: 'drivers',
      title: 'Drivers Hub',
      description: 'Manage routes, deliveries, and vehicle status.',
      icon: <Truck color={theme.colors.primary} size={32} />,
      onPress: () => navigation.navigate('Login'),
    },
    {
      id: 'operators',
      title: 'Operators',
      description: 'Dispatch, tracking, and operational oversight.',
      icon: <Network color={theme.colors.primary} size={32} />,
      onPress: () => {},
    },
    {
      id: 'management',
      title: 'Management',
      description: 'Analytics, reporting, and strategic planning.',
      icon: <BarChart3 color={theme.colors.primary} size={32} />,
      onPress: () => {},
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.brandText}>ASAS</Text>
          <Text style={styles.welcomeText}>Welcome to ASAS.</Text>
          <Text style={styles.subtitle}>Select your portal to continue.</Text>
        </View>

        <View style={styles.optionsContainer}>
          {options.map((option) => (
            <TouchableOpacity 
              key={option.id} 
              onPress={option.onPress}
              activeOpacity={0.7}
            >
              <Card style={styles.optionCard}>
                <View style={styles.iconBackground}>
                  {option.icon}
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.optionTitle}>{option.title}</Text>
                  <Text style={styles.optionDescription}>{option.description}</Text>
                </View>
                <ChevronRight color={theme.colors.border} size={20} />
              </Card>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            This platform was built by <Text style={styles.linkText}>Unifleet Labs</Text>
          </Text>
          <Text style={styles.versionText}>V1.3</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA', // Subtle light background for premium look
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  brandText: {
    fontSize: 48,
    fontWeight: '900',
    color: theme.colors.primary,
    letterSpacing: 2,
    marginBottom: 8,
  },
  welcomeText: {
    ...theme.typography.h1,
    color: theme.colors.text,
    fontSize: 28,
  },
  subtitle: {
    ...theme.typography.bodyMd,
    color: theme.colors.textSecondary,
    marginTop: 8,
  },
  optionsContainer: {
    gap: 16,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 20,
    backgroundColor: theme.colors.white,
    // Slightly more pronounced shadow than default card
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
  },
  iconBackground: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  textContainer: {
    flex: 1,
  },
  optionTitle: {
    ...theme.typography.h2,
    fontSize: 22,
    color: theme.colors.text,
    marginBottom: 4,
  },
  optionDescription: {
    ...theme.typography.bodyMd,
    color: theme.colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    marginTop: 'auto',
    alignItems: 'center',
    paddingBottom: 20,
  },
  footerText: {
    ...theme.typography.labelSm,
    color: theme.colors.textSecondary,
  },
  linkText: {
    color: '#2196F3', // Link blue
    fontWeight: '700',
  },
  versionText: {
    ...theme.typography.labelSm,
    color: theme.colors.border,
    fontSize: 10,
    marginTop: 4,
  },
});
