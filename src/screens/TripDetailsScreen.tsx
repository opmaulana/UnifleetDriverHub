import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { theme } from '../theme/theme';
import { useStore } from '../store/useStore';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { ChevronLeft, MapPin, Phone, Info, Navigation as NavIcon } from 'lucide-react-native';

export const TripDetailsScreen = ({ navigation }: any) => {
  const { activeTrip, updateTripStatus } = useStore();

  if (!activeTrip) return null;

  const handleStartTrip = () => {
    updateTripStatus('active');
    navigation.navigate('ProofOfDelivery');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color={theme.colors.text} size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Trip Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.mainCard}>
          <View style={styles.tripType}>
            <Text style={styles.typeText}>Express Delivery</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{activeTrip.status.toUpperCase()}</Text>
            </View>
          </View>

          <Text style={styles.earnings}>{activeTrip.estimatedEarnings}</Text>
          <Text style={styles.earningsLabel}>Estimated Earnings</Text>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoValue}>{activeTrip.distance}</Text>
              <Text style={styles.infoLabel}>Distance</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoValue}>{activeTrip.time}</Text>
              <Text style={styles.infoLabel}>Est. Time</Text>
            </View>
          </View>
        </Card>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Route</Text>
          <View style={styles.routeBox}>
            <View style={styles.routeItem}>
              <View style={[styles.dot, { backgroundColor: theme.colors.primary }]} />
              <View style={styles.routeInfo}>
                <Text style={styles.routeLabel}>Pickup</Text>
                <Text style={styles.address}>{activeTrip.pickup}</Text>
              </View>
            </View>
            <View style={styles.line} />
            <View style={styles.routeItem}>
              <MapPin size={20} color={theme.colors.textSecondary} />
              <View style={styles.routeInfo}>
                <Text style={styles.routeLabel}>Dropoff</Text>
                <Text style={styles.address}>{activeTrip.dropoff}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer</Text>
          <Card style={styles.customerCard}>
            <View style={styles.customerInfo}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>JD</Text>
              </View>
              <View>
                <Text style={styles.customerName}>Jane Doe</Text>
                <Text style={styles.customerSub}>Regular Customer</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.callBtn}>
              <Phone color={theme.colors.primary} size={20} />
            </TouchableOpacity>
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Instructions</Text>
          <Card style={styles.instructionCard}>
            <Info size={20} color={theme.colors.primary} />
            <Text style={styles.instructionText}>
              Please call customer before arriving. Gate code is 1234.
            </Text>
          </Card>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Navigate"
          variant="outline"
          onPress={() => {}}
          style={styles.navBtn}
          icon={<NavIcon color={theme.colors.text} size={20} style={{ marginRight: 8 }} />}
        />
        <Button
          title={activeTrip.status === 'pending' ? 'Start Trip' : 'Continue'}
          onPress={handleStartTrip}
          style={styles.startBtn}
        />
      </View>
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
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.white,
  },
  backBtn: {
    padding: 8,
  },
  headerTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
  },
  content: {
    padding: theme.spacing.lg,
  },
  mainCard: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  tripType: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  typeText: {
    ...theme.typography.labelSm,
    color: theme.colors.textSecondary,
    marginRight: 8,
  },
  statusBadge: {
    backgroundColor: theme.colors.primary + '10',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  earnings: {
    ...theme.typography.h1,
    fontSize: 40,
    color: theme.colors.text,
  },
  earningsLabel: {
    ...theme.typography.labelSm,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  infoItem: {
    alignItems: 'center',
  },
  infoValue: {
    ...theme.typography.h3,
    color: theme.colors.text,
  },
  infoLabel: {
    ...theme.typography.labelSm,
    color: theme.colors.textSecondary,
  },
  section: {
    marginTop: theme.spacing.xl,
  },
  sectionTitle: {
    ...theme.typography.labelLg,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    fontWeight: '700',
  },
  routeBox: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
  },
  routeInfo: {
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  routeLabel: {
    ...theme.typography.labelSm,
    color: theme.colors.textSecondary,
  },
  address: {
    ...theme.typography.bodyMd,
    color: theme.colors.text,
    fontWeight: '600',
    marginTop: 2,
  },
  line: {
    width: 2,
    height: 30,
    backgroundColor: theme.colors.border,
    marginLeft: 5,
    marginVertical: 4,
  },
  customerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  avatarText: {
    ...theme.typography.labelLg,
    color: theme.colors.primary,
  },
  customerName: {
    ...theme.typography.bodyMd,
    fontWeight: '600',
  },
  customerSub: {
    ...theme.typography.labelSm,
    color: theme.colors.textSecondary,
  },
  callBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  instructionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.primary + '05',
    borderWidth: 1,
    borderColor: theme.colors.primary + '20',
  },
  instructionText: {
    ...theme.typography.bodyMd,
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.white,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  navBtn: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  startBtn: {
    flex: 2,
  },
});
