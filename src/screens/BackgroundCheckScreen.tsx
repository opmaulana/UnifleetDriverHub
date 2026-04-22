import React, { useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import { theme } from '../theme/theme';
import { CheckCircle2 } from 'lucide-react-native';

export const BackgroundCheckScreen = ({ navigation }: any) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.navigate('ProfileSetup');
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
        <Text style={styles.title}>Verification in Progress</Text>
        <Text style={styles.subtitle}>
          We are currently verifying your background and documents. This usually takes a few minutes.
        </Text>

        <View style={styles.list}>
          <View style={styles.listItem}>
            <CheckCircle2 color={theme.colors.success} size={20} />
            <Text style={styles.listText}>Phone Verification</Text>
          </View>
          <View style={styles.listItem}>
            <ActivityIndicator size="small" color={theme.colors.primary} style={{ marginRight: 4 }} />
            <Text style={styles.listText}>Document Authenticity</Text>
          </View>
          <View style={styles.listItem}>
            <View style={styles.dot} />
            <Text style={[styles.listText, { color: theme.colors.textSecondary }]}>Police Clearance</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  content: {
    flex: 1,
    padding: theme.spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: theme.spacing.xl,
  },
  title: {
    ...theme.typography.h2,
    color: theme.colors.text,
    textAlign: 'center',
  },
  subtitle: {
    ...theme.typography.bodyMd,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.md,
    lineHeight: 24,
  },
  list: {
    marginTop: theme.spacing.xxl,
    width: '100%',
    paddingHorizontal: theme.spacing.lg,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.background,
  },
  listText: {
    ...theme.typography.bodyMd,
    marginLeft: theme.spacing.md,
    fontWeight: '500',
  },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: theme.colors.background,
    marginRight: 4,
  }
});
