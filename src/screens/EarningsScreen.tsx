import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { theme } from '../theme/theme';
import { Card } from '../components/Card';
import { TrendingUp, Calendar, ChevronRight, Wallet } from 'lucide-react-native';

export const EarningsScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Earnings</Text>
        <TouchableOpacity style={styles.walletBtn}>
          <Wallet color={theme.colors.primary} size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.mainCard}>
          <Text style={styles.cardLabel}>Weekly Balance</Text>
          <Text style={styles.balance}>KES 24,500</Text>
          <View style={styles.trendRow}>
            <TrendingUp size={16} color={theme.colors.success} />
            <Text style={styles.trendText}>+12% from last week</Text>
          </View>
        </Card>

        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <Text style={styles.statVal}>42</Text>
            <Text style={styles.statLab}>Trips</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statVal}>156h</Text>
            <Text style={styles.statLab}>Online</Text>
          </Card>
        </View>

        <Text style={styles.sectionTitle}>Recent Activity</Text>
        {[1, 2, 3, 4, 5].map((i) => (
          <TouchableOpacity key={i} style={styles.activityItem}>
            <View style={styles.activityIcon}>
              <Calendar size={20} color={theme.colors.textSecondary} />
            </View>
            <View style={styles.activityInfo}>
              <Text style={styles.activityDate}>22 April, 2024</Text>
              <Text style={styles.activityCount}>8 Trips completed</Text>
            </View>
            <View style={styles.activityAmount}>
              <Text style={styles.amountText}>KES 3,200</Text>
              <ChevronRight size={20} color={theme.colors.border} />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.white,
  },
  headerTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
  },
  walletBtn: {
    padding: 8,
  },
  content: {
    padding: theme.spacing.lg,
  },
  mainCard: {
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
  },
  cardLabel: {
    ...theme.typography.labelSm,
    color: theme.colors.white,
    opacity: 0.8,
  },
  balance: {
    ...theme.typography.h1,
    fontSize: 48,
    color: theme.colors.white,
    marginVertical: 8,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  trendText: {
    ...theme.typography.labelSm,
    color: theme.colors.white,
    marginLeft: 6,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.md,
  },
  statCard: {
    flex: 0.48,
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  statVal: {
    ...theme.typography.h3,
    color: theme.colors.text,
  },
  statLab: {
    ...theme.typography.labelSm,
    color: theme.colors.textSecondary,
  },
  sectionTitle: {
    ...theme.typography.labelLg,
    fontWeight: '700',
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.md,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  activityInfo: {
    flex: 1,
  },
  activityDate: {
    ...theme.typography.bodyMd,
    fontWeight: '600',
  },
  activityCount: {
    ...theme.typography.labelSm,
    color: theme.colors.textSecondary,
  },
  activityAmount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amountText: {
    ...theme.typography.bodyMd,
    fontWeight: '700',
    color: theme.colors.text,
    marginRight: 8,
  },
});
