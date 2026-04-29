import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Platform, UIManager, LayoutAnimation, Modal } from 'react-native';
import MapView from '../components/MapView';
import { GlobalHeader } from '../components/GlobalHeader';
import { theme } from '../theme/theme';
import { useStore } from '../store/useStore';
import { Button } from '../components/Button';
import { Bell, MapPin, Navigation, Clock, CreditCard, ArrowLeft, Truck, AlertTriangle, Phone, MoonStar } from 'lucide-react-native';
import { useTranslation } from '../hooks/useTranslation';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export const HomeDashboard = ({ navigation }: any) => {
  const { user, toggleOnline, activeTrip, trips, setActiveTrip } = useStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSOSVisible, setIsSOSVisible] = useState(false);
  const [isNightPillExpanded, setIsNightPillExpanded] = useState(false);
  const [isSpeedPillExpanded, setIsSpeedPillExpanded] = useState(false);
  const { t } = useTranslation();

  const handleTripAction = () => {
    if (!activeTrip) {
      setActiveTrip(trips[0]);
    } else {
      navigation.navigate('TripDetails');
    }
  };

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);
  };

  return (
    <View style={styles.container}>
      <View style={{ zIndex: 10, position: 'absolute', top: 0, left: 0, right: 0 }}>
        <GlobalHeader />
      </View>
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

      {/* SOS Button Overlay */}
      <TouchableOpacity 
        style={styles.sosButton} 
        onPress={() => setIsSOSVisible(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.sosButtonText}>SOS</Text>
      </TouchableOpacity>

      {/* Night Hours Pill Overlay */}
      <TouchableOpacity 
        style={styles.nightPill} 
        onPress={() => {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          setIsNightPillExpanded(!isNightPillExpanded);
        }}
        activeOpacity={0.8}
      >
        {isNightPillExpanded && (
          <View style={styles.nightPillTextContainer}>
            <Text style={styles.nightHoursText}>{t('night_hours')} - 2.1 Hrs.</Text>
            <Text style={styles.nightResetText}>{t('reset_next_month')}</Text>
          </View>
        )}
        <View style={styles.nightIconContainer}>
          <MoonStar size={24} color={theme.colors.primary} />
        </View>
      </TouchableOpacity>

      {/* Speed Violation Pill Overlay */}
      <TouchableOpacity 
        style={styles.speedPill} 
        onPress={() => {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          setIsSpeedPillExpanded(!isSpeedPillExpanded);
        }}
        activeOpacity={0.8}
      >
        {isSpeedPillExpanded && (
          <View style={styles.nightPillTextContainer}>
            <Text style={styles.nightHoursText}>{t('over_80_time')}</Text>
            <Text style={styles.nightResetText}>{t('reset_next_month')}</Text>
          </View>
        )}
        <View style={styles.speedIconContainer}>
          <Text style={styles.speedIconText}>80+</Text>
          <Text style={styles.speedIconSubText}>km/h</Text>
        </View>
      </TouchableOpacity>

      {/* Simple Floating Card */}
      <View style={[styles.floatingCard, isExpanded && styles.floatingCardExpanded]}>
        <TouchableOpacity style={styles.handleContainer} onPress={toggleExpand} activeOpacity={0.8}>
          <View style={styles.handle} />
        </TouchableOpacity>
        <View style={styles.cardContent}>
          {!activeTrip ? (
            <View style={styles.noTripContent}>
              <Text style={styles.sheetTitle}>{t('ready_for_trip')}</Text>
              <Text style={styles.sheetSubtitle}>{t('stay_online')}</Text>
              
              {isExpanded && (
                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Clock size={20} color={theme.colors.primary} />
                    <Text style={styles.statValue}>4.2h</Text>
                    <Text style={styles.statLabel}>{t('online')}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Navigation size={20} color={theme.colors.primary} />
                    <Text style={styles.statValue}>12</Text>
                    <Text style={styles.statLabel}>{t('trips')}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <CreditCard size={20} color={theme.colors.primary} />
                    <Text style={styles.statValue}>KSh 3k</Text>
                    <Text style={styles.statLabel}>{t('earned')}</Text>
                  </View>
                </View>
              )}

              <Button
                title={t('active_area')}
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

              {isExpanded && (
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
              )}

              <Button
                title={t('view_trip')}
                onPress={handleTripAction}
                style={styles.actionBtn}
              />
            </View>
          )}
        </View>
      </View>

      {/* SOS Screen Modal */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={isSOSVisible}
        onRequestClose={() => setIsSOSVisible(false)}
      >
        <View style={styles.sosPageContainer}>
          {/* Back Arrow Button */}
          <TouchableOpacity 
            style={styles.sosPageBackBtn} 
            onPress={() => setIsSOSVisible(false)}
            activeOpacity={0.7}
          >
            <ArrowLeft size={28} color={theme.colors.text} />
          </TouchableOpacity>

          <View style={styles.sosPageContent}>
            {/* Title */}
            <Text style={styles.sosPageTitle}>{t('having_trouble')}</Text>

            {/* Options */}
            <View style={styles.sosPageOptions}>
              <TouchableOpacity 
                style={styles.sosPageOptionBtn} 
                onPress={() => {}}
                activeOpacity={0.8}
              >
                <View style={[styles.sosOptionIconContainer, { backgroundColor: '#FFEBEE' }]}>
                  <Truck size={24} color={theme.colors.primary} />
                </View>
                <Text style={styles.sosPageOptionText}>{t('issue_truck')}</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.sosPageOptionBtn} 
                onPress={() => {}}
                activeOpacity={0.8}
              >
                <View style={[styles.sosOptionIconContainer, { backgroundColor: '#FFEBEE' }]}>
                  <AlertTriangle size={24} color={theme.colors.primary} />
                </View>
                <Text style={styles.sosPageOptionText}>{t('report_accident')}</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.sosPageOptionBtn} 
                onPress={() => {}}
                activeOpacity={0.8}
              >
                <View style={[styles.sosOptionIconContainer, { backgroundColor: '#FFEBEE' }]}>
                  <Phone size={24} color={theme.colors.primary} />
                </View>
                <Text style={styles.sosPageOptionText}>{t('call_officer')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  floatingCardExpanded: {
    paddingBottom: 60,
    minHeight: SCREEN_HEIGHT * 0.6,
  },
  handleContainer: {
    paddingVertical: 10,
    alignItems: 'center',
    width: '100%',
  },
  handle: {
    width: 40,
    height: 5,
    backgroundColor: theme.colors.border,
    borderRadius: 3,
    marginBottom: 10,
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
    marginTop: theme.spacing.md,
  },
  sosButton: {
    position: 'absolute',
    top: 140,
    right: 20,
    backgroundColor: theme.colors.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    zIndex: 15,
  },
  sosButtonText: {
    color: theme.colors.white,
    ...theme.typography.labelLg,
    fontWeight: 'bold',
  },
  sosPageContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: theme.spacing.lg,
  },
  sosPageBackBtn: {
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
    marginBottom: theme.spacing.xl,
  },
  sosPageContent: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 80,
  },
  sosPageTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.xxl,
  },
  sosPageOptions: {
    gap: theme.spacing.md,
  },
  sosPageOptionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: theme.spacing.sm,
  },
  sosOptionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  sosPageOptionText: {
    ...theme.typography.bodyLg,
    color: theme.colors.text,
    fontWeight: '600',
  },
  nightPill: {
    position: 'absolute',
    top: 216,
    right: 20,
    backgroundColor: theme.colors.white,
    height: 56,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 8,
    zIndex: 15,
  },
  nightPillTextContainer: {
    marginRight: 12,
    justifyContent: 'center',
  },
  nightHoursText: {
    ...theme.typography.labelLg,
    color: theme.colors.text,
    fontWeight: '700',
  },
  nightResetText: {
    color: theme.colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
    fontWeight: '500',
  },
  nightIconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  speedPill: {
    position: 'absolute',
    top: 292,
    right: 20,
    backgroundColor: theme.colors.white,
    height: 56,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 8,
    zIndex: 15,
  },
  speedIconContainer: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  speedIconText: {
    color: theme.colors.primary,
    fontSize: 13,
    fontWeight: 'bold',
  },
  speedIconSubText: {
    color: theme.colors.primary,
    fontSize: 7,
    fontWeight: '700',
    marginTop: -2,
  },
});
