import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { theme } from '../../theme/theme';
import { ArrowLeft, Truck, Navigation } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card } from '../../components/Card';

export const ActiveNominations = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ArrowLeft color={theme.colors.white} size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Active Nominations</Text>
          <View style={{ width: 40 }} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {[1, 2, 3, 4, 5].map((item) => (
          <TouchableOpacity 
            key={item} 
            activeOpacity={0.7}
            onPress={() => navigation.navigate('VehicleDetail')}
          >
            <Card style={styles.nominationCard}>
              <View style={styles.nominationHeader}>
                <View style={styles.truckBadge}>
                  <Truck color={theme.colors.primary} size={16} />
                  <Text style={styles.truckPlate}>KDJ 4{item}2L</Text>
                </View>
                <Text style={styles.statusText}>In Transit</Text>
              </View>
              <View style={styles.nominationBody}>
                <Text style={styles.locationText}>Mombasa Port</Text>
                <Navigation color={theme.colors.border} size={16} style={{ marginHorizontal: 8 }} />
                <Text style={styles.locationText}>Nairobi HQ</Text>
              </View>
            </Card>
          </TouchableOpacity>
        ))}
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
  nominationCard: {
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  nominationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  truckBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  truckPlate: {
    ...theme.typography.labelSm,
    color: theme.colors.primary,
    marginLeft: 6,
    fontWeight: '700',
  },
  statusText: {
    ...theme.typography.labelSm,
    color: theme.colors.info,
    fontWeight: '600',
  },
  nominationBody: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    ...theme.typography.bodyMd,
    color: theme.colors.text,
    flex: 1,
  },
});
