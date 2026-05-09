import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { theme } from '../../theme/theme';
import { ArrowLeft, Truck, Activity, Navigation } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';

export const VehicleDetail = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ArrowLeft color={theme.colors.white} size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Vehicle Details</Text>
          <View style={{ width: 40 }} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.truckProfile}>
          <View style={styles.truckIconLarge}>
            <Truck color={theme.colors.primary} size={48} />
          </View>
          <Text style={styles.plateText}>KDJ 432L</Text>
          <Text style={styles.modelText}>Volvo FH16 - Heavy Duty</Text>
        </View>

        <Text style={styles.sectionTitle}>Current Status</Text>
        <Card style={styles.statusCard}>
          <View style={styles.statusRow}>
            <Activity color={theme.colors.success} size={20} />
            <Text style={styles.statusLabel}>Engine Running</Text>
          </View>
          <View style={styles.statusRow}>
            <Navigation color={theme.colors.info} size={20} />
            <Text style={styles.statusLabel}>En route to Mombasa</Text>
          </View>
        </Card>

        <Button 
          title="Confirm Unloading" 
          onPress={() => navigation.navigate('UnloadingConfirmation')} 
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
  truckProfile: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  truckIconLarge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#FFEBEE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  plateText: {
    ...theme.typography.h1,
    color: theme.colors.text,
  },
  modelText: {
    ...theme.typography.bodyMd,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  sectionTitle: { ...theme.typography.labelLg, color: theme.colors.text, marginBottom: theme.spacing.md },
  statusCard: { padding: theme.spacing.lg },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  statusLabel: {
    ...theme.typography.bodyLg,
    color: theme.colors.text,
    marginLeft: 12,
  },
  actionBtn: { marginTop: theme.spacing.xxl },
});
