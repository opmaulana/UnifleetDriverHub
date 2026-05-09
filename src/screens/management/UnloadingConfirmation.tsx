import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { theme } from '../../theme/theme';
import { ArrowLeft, CheckCircle2 } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';

export const UnloadingConfirmation = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ArrowLeft color={theme.colors.white} size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Confirm Unloading</Text>
          <View style={{ width: 40 }} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.successIconContainer}>
          <CheckCircle2 color={theme.colors.success} size={64} />
        </View>
        <Text style={styles.titleText}>Ready to Unload</Text>
        <Text style={styles.subtitleText}>Vehicle KDJ 432L has arrived at the destination.</Text>

        <Card style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Cargo Type</Text>
            <Text style={styles.summaryValue}>Electronics</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Weight</Text>
            <Text style={styles.summaryValue}>4.5 Tons</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Destination</Text>
            <Text style={styles.summaryValue}>Nairobi Warehouse</Text>
          </View>
        </Card>

        <Button 
          title="Confirm & Complete Trip" 
          onPress={() => navigation.navigate('ManagementDashboard')} 
          style={styles.actionBtn} 
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { backgroundColor: theme.colors.primary },
  headerContent: {
    height: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  backBtn: { padding: 8, marginLeft: -8 },
  headerTitle: { ...theme.typography.h3, color: theme.colors.white },
  content: { padding: theme.spacing.lg },
  successIconContainer: {
    alignItems: 'center',
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.md,
  },
  titleText: {
    ...theme.typography.h2,
    color: theme.colors.text,
    textAlign: 'center',
  },
  subtitleText: {
    ...theme.typography.bodyMd,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: theme.spacing.xxl,
  },
  summaryCard: {
    padding: theme.spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  summaryLabel: {
    ...theme.typography.bodyMd,
    color: theme.colors.textSecondary,
  },
  summaryValue: {
    ...theme.typography.bodyMd,
    color: theme.colors.text,
    fontWeight: '600',
  },
  actionBtn: { marginTop: theme.spacing.xxl },
});
