import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import MapView from '../components/MapView';
import { theme } from '../theme/theme';
import { useStore } from '../store/useStore';
import { Button } from '../components/Button';
import { Bell, MapPin, Navigation, Clock, CreditCard } from 'lucide-react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export const HomeDashboard = ({ navigation }: any) => {
  const { user, toggleOnline, activeTrip, trips, setActiveTrip } = useStore();

  const handleTripAction = () => {
    if (!activeTrip) {
      setActiveTrip(trips[0]);
    } else {
      navigation.navigate('TripDetails');
    }
  };

  return (
    <View style={styles.container}>
      {/* Map Background */}
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: -1.286389,
          longitude: 36.817223,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      />

      {/* Top Bar */}
      <SafeAreaView style={styles.topBarContainer}>
        <View style={styles.topBar}>
          <View style={styles.brandBadge}>
            <Text style={styles.brandText}>ASAS</Text>
          </View>

          <TouchableOpacity style={styles.notificationBtn} onPress={() => navigation.navigate('Notifications')}>
            <Bell color={theme.colors.text} size={24} />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Simple Floating Card (Replacing Bottom Sheet to bypass crashes) */}
      <View style={styles.floatingCard}>
        <View style={styles.handle} />
        <View style={styles.cardContent}>
          {!activeTrip ? (
            <View style={styles.noTripContent}>
              <Text style={styles.sheetTitle}>Ready for a trip?</Text>
              <Text style={styles.sheetSubtitle}>Stay online to receive requests</Text>
              
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Clock size={20} color={theme.colors.primary} />
                  <Text style={styles.statValue}>4.2h</Text>
                  <Text style={styles.statLabel}>Online</Text>
                </View>
                <View style={styles.statItem}>
                  <Navigation size={20} color={theme.colors.primary} />
                  <Text style={styles.statValue}>12</Text>
                  <Text style={styles.statLabel}>Trips</Text>
                </View>
                <View style={styles.statItem}>
                  <CreditCard size={20} color={theme.colors.primary} />
                  <Text style={styles.statValue}>KSh 3k</Text>
                  <Text style={styles.statLabel}>Earned</Text>
                </View>
              </View>

              <Button
                title="Go to Active Area"
                variant="outline"
                onPress={() => {}}
                style={styles.actionBtn}
              />
            </View>
          ) : (
            <View style={styles.activeTripContent}>
              <View style={styles.tripHeader}>
                <View>
                  <Text style={styles.tripStatus}>NEW REQUEST</Text>
                  <Text style={styles.tripEarnings}>{activeTrip.estimatedEarnings}</Text>
                </View>
                <View style={styles.timeTag}>
                  <Text style={styles.timeText}>{activeTrip.time}</Text>
                </View>
              </View>

              <View style={styles.routeContainer}>
                <View style={styles.routePoint}>
                  <View style={[styles.pointDot, { backgroundColor: theme.colors.primary }]} />
                  <Text style={styles.routeText} numberOfLines={1}>{activeTrip.pickup}</Text>
                </View>
                <View style={styles.routeLine} />
                <View style={styles.routePoint}>
                  <MapPin size={16} color={theme.colors.textSecondary} />
                  <Text style={styles.routeText} numberOfLines={1}>{activeTrip.dropoff}</Text>
                </View>
              </View>

              <Button
                title="View Trip Details"
                onPress={handleTripAction}
                style={styles.actionBtn}
              />
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  topBarContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  brandBadge: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  brandText: {
    ...theme.typography.labelSm,
    color: theme.colors.white,
    fontWeight: '900',
    letterSpacing: 1,
  },
  notificationBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  notificationDot: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.primary,
    borderWidth: 2,
    borderColor: theme.colors.white,
  },
  floatingCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  handle: {
    width: 40,
    height: 5,
    backgroundColor: theme.colors.border,
    borderRadius: 3,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  cardContent: {
    paddingHorizontal: theme.spacing.lg,
  },
  noTripContent: {
    alignItems: 'center',
  },
  sheetTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
  },
  sheetSubtitle: {
    ...theme.typography.bodyMd,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: theme.spacing.xl,
    paddingHorizontal: theme.spacing.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginTop: 8,
  },
  statLabel: {
    ...theme.typography.labelSm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  activeTripContent: {
    paddingTop: 0,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.lg,
  },
  tripStatus: {
    ...theme.typography.labelSm,
    color: theme.colors.primary,
    fontWeight: '700',
    letterSpacing: 1,
  },
  tripEarnings: {
    ...theme.typography.h1,
    color: theme.colors.text,
    marginTop: 2,
  },
  timeTag: {
    backgroundColor: theme.colors.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  timeText: {
    ...theme.typography.labelLg,
    color: theme.colors.text,
    fontWeight: '700',
  },
  routeContainer: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pointDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  routeLine: {
    width: 2,
    height: 20,
    backgroundColor: theme.colors.border,
    marginLeft: 5,
    marginVertical: 4,
  },
  routeText: {
    ...theme.typography.bodyMd,
    color: theme.colors.text,
    flex: 1,
  },
  actionBtn: {
    width: '100%',
  },
});
