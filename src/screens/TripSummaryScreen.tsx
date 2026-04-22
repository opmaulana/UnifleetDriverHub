import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Animated } from 'react-native';
import { theme } from '../theme/theme';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { CheckCircle2, TrendingUp, Star, Clock } from 'lucide-react-native';
import { useStore } from '../store/useStore';

export const TripSummaryScreen = ({ navigation }: any) => {
  const { setActiveTrip } = useStore();

  const handleBackHome = () => {
    setActiveTrip(null);
    navigation.navigate('Main');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.successIcon}>
          <CheckCircle2 size={80} color={theme.colors.success} />
        </View>
        <Text style={styles.title}>Delivery Completed!</Text>
        <Text style={styles.subtitle}>You've successfully delivered the package.</Text>

        <Card style={styles.summaryCard}>
          <View style={styles.earningBox}>
            <Text style={styles.earningValue}>KES 2,400</Text>
            <Text style={styles.earningLabel}>Total Earned</Text>
          </View>
          
          <View style={styles.divider} />

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <TrendingUp size={20} color={theme.colors.primary} />
              <Text style={styles.statValue}>18.5 km</Text>
              <Text style={styles.statLabel}>Distance</Text>
            </View>
            <View style={styles.statItem}>
              <Clock size={20} color={theme.colors.primary} />
              <Text style={styles.statValue}>42 min</Text>
              <Text style={styles.statLabel}>Duration</Text>
            </View>
            <View style={styles.statItem}>
              <Star size={20} color={theme.colors.primary} />
              <Text style={styles.statValue}>4.9</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
          </View>
        </Card>

        <View style={styles.feedbackContainer}>
          <Text style={styles.feedbackTitle}>Great Job, John!</Text>
          <Text style={styles.feedbackText}>
            You completed this delivery 5 minutes faster than estimated.
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          title="Back to Dashboard"
          onPress={handleBackHome}
          style={styles.button}
        />
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
    alignItems: 'center',
    padding: theme.spacing.xl,
    paddingTop: theme.spacing.xxl,
  },
  successIcon: {
    marginBottom: theme.spacing.lg,
  },
  title: {
    ...theme.typography.h2,
    color: theme.colors.text,
  },
  subtitle: {
    ...theme.typography.bodyMd,
    color: theme.colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  summaryCard: {
    width: '100%',
    marginTop: theme.spacing.xxl,
    padding: theme.spacing.xl,
  },
  earningBox: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  earningValue: {
    ...theme.typography.h1,
    fontSize: 48,
    color: theme.colors.text,
  },
  earningLabel: {
    ...theme.typography.labelSm,
    color: theme.colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    ...theme.typography.labelLg,
    color: theme.colors.text,
    marginTop: 8,
  },
  statLabel: {
    ...theme.typography.labelSm,
    color: theme.colors.textSecondary,
  },
  feedbackContainer: {
    marginTop: theme.spacing.xxl,
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  feedbackTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
  },
  feedbackText: {
    ...theme.typography.bodyMd,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  footer: {
    padding: theme.spacing.lg,
  },
  button: {
    width: '100%',
  },
});
