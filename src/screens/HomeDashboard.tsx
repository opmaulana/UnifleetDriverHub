import React, { useState, useRef, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Platform, UIManager, LayoutAnimation, Modal, Animated, PanResponder, ScrollView } from 'react-native';
import MapView, { Marker, Polyline } from '../components/MapView';
import { GlobalHeader } from '../components/GlobalHeader';
import { theme } from '../theme/theme';
import { useStore } from '../store/useStore';
import { Button } from '../components/Button';
import { Bell, MapPin, Navigation, Clock, CreditCard, ArrowLeft, Truck, AlertTriangle, Phone, MoonStar, ChevronUp, X, Zap, Wifi, WifiOff, User, Activity, Gauge, Fuel, MapPinned, Radar, Route } from 'lucide-react-native';
import { useTranslation } from '../hooks/useTranslation';
import { useLiveTracking } from '../hooks/useLiveTracking';
import { supabase } from '../lib/supabase';

// Haversine formula for distance between two coordinates
const getDistanceKm = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const formatDistance = (km: number): string => {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  if (km < 100) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
};


const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const COLLAPSED_HEIGHT = 180;
const EXPANDED_HEIGHT = SCREEN_HEIGHT * 0.75;
const SNAP_THRESHOLD = 80;

export const HomeDashboard = ({ navigation }: any) => {
  const { user, toggleOnline, activeTrip, trips, setActiveTrip } = useStore();
  const [isSOSVisible, setIsSOSVisible] = useState(false);
  const [isNightPillExpanded, setIsNightPillExpanded] = useState(false);
  const [isSpeedPillExpanded, setIsSpeedPillExpanded] = useState(false);
  const [isTruckSelected, setIsTruckSelected] = useState(false);
  const { t } = useTranslation();
  const tracking = useLiveTracking();
  const mapRef = useRef<MapView>(null);
  const cardOpacity = useRef(new Animated.Value(0)).current;

  // Distance calculation
  const distanceKm = useMemo(() => {
    if (tracking.driverLat && tracking.driverLng && tracking.truckLat && tracking.truckLng) {
      return getDistanceKm(tracking.driverLat, tracking.driverLng, tracking.truckLat, tracking.truckLng);
    }
    return null;
  }, [tracking.driverLat, tracking.driverLng, tracking.truckLat, tracking.truckLng]);

  // Midpoint for the distance label
  const midPoint = useMemo(() => {
    if (tracking.driverLat && tracking.driverLng && tracking.truckLat && tracking.truckLng) {
      return {
        latitude: (tracking.driverLat + tracking.truckLat) / 2,
        longitude: (tracking.driverLng + tracking.truckLng) / 2,
      };
    }
    return null;
  }, [tracking.driverLat, tracking.driverLng, tracking.truckLat, tracking.truckLng]);

  // Dynamic completed trip stats from database
  const [tripStats, setTripStats] = useState({
    completedCount: 0,
    totalDistance: 0,
    activeHours: 0,
    loading: true
  });

  useEffect(() => {
    if (!user?.tracker_name) {
      setTripStats(prev => ({ ...prev, loading: false }));
      return;
    }

    const fetchDriverStats = async () => {
      try {
        const { data, error } = await supabase
          .from('live_trips')
          .select('distance_km, duration_seconds')
          .ilike('tracker_name', `%${user.tracker_name}%`);

        if (error) {
          console.warn('Error fetching driver telemetry stats:', error);
          return;
        }

        if (data) {
          const completedCount = data.length;
          const totalDistance = data.reduce((sum, item) => sum + (Number(item.distance_km) || 0), 0);
          const totalSeconds = data.reduce((sum, item) => sum + (Number(item.duration_seconds) || 0), 0);
          const activeHours = totalSeconds / 3600;

          setTripStats({
            completedCount,
            totalDistance: Math.round(totalDistance),
            activeHours: parseFloat(activeHours.toFixed(1)),
            loading: false
          });
        }
      } catch (err) {
        console.warn('Exception in fetchDriverStats:', err);
      }
    };

    fetchDriverStats();
  }, [user?.tracker_name]);

  const handleTruckPress = () => {
    setIsTruckSelected(true);
    cardOpacity.setValue(0);
    Animated.timing(cardOpacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const handleMapPress = () => {
    if (isTruckSelected) {
      Animated.timing(cardOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start(() => setIsTruckSelected(false));
    }
  };

  const handleCloseCard = () => {
    Animated.timing(cardOpacity, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => setIsTruckSelected(false));
  };

  // Auto-fit map to show both markers
  useEffect(() => {
    if (tracking.driverLat && tracking.truckLat && mapRef.current) {
      mapRef.current.fitToCoordinates(
        [
          { latitude: tracking.driverLat, longitude: tracking.driverLng! },
          { latitude: tracking.truckLat, longitude: tracking.truckLng! },
        ],
        { edgePadding: { top: 160, right: 60, bottom: 250, left: 60 }, animated: true }
      );
    } else if (tracking.driverLat && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: tracking.driverLat,
        longitude: tracking.driverLng!,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000);
    }
  }, [tracking.driverLat, tracking.truckLat]);

  const driverInitial = user?.name?.charAt(0)?.toUpperCase() || 'D';
  const truckInitial = user?.tracker_name?.charAt(0)?.toUpperCase() || 'T';

  // Bottom sheet animation
  const sheetHeight = useRef(new Animated.Value(COLLAPSED_HEIGHT)).current;
  const isExpandedRef = useRef(false);
  const lastHeight = useRef(COLLAPSED_HEIGHT);
  const [expanded, setExpanded] = useState(false);

  // Arrow rotation: 0 = pointing up, 1 = pointing down (when expanded)
  const arrowRotation = useRef(new Animated.Value(0)).current;

  const snapTo = (toExpanded: boolean) => {
    const target = toExpanded ? EXPANDED_HEIGHT : COLLAPSED_HEIGHT;
    isExpandedRef.current = toExpanded;
    lastHeight.current = target;
    setExpanded(toExpanded);

    Animated.spring(sheetHeight, {
      toValue: target,
      useNativeDriver: false,
      tension: 60,
      friction: 12,
    }).start();

    Animated.timing(arrowRotation, {
      toValue: toExpanded ? 1 : 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 8;
      },
      onPanResponderMove: (_, gestureState) => {
        const newHeight = lastHeight.current - gestureState.dy;
        const clamped = Math.max(COLLAPSED_HEIGHT, Math.min(EXPANDED_HEIGHT, newHeight));
        sheetHeight.setValue(clamped);
        const progress = (clamped - COLLAPSED_HEIGHT) / (EXPANDED_HEIGHT - COLLAPSED_HEIGHT);
        arrowRotation.setValue(progress);
      },
      onPanResponderRelease: (_, gestureState) => {
        const dragDistance = -gestureState.dy;
        if (isExpandedRef.current) {
          snapTo(dragDistance > -SNAP_THRESHOLD);
        } else {
          snapTo(dragDistance > SNAP_THRESHOLD);
        }
      },
    })
  ).current;

  const handleTap = () => {
    snapTo(!isExpandedRef.current);
  };

  const handleTripAction = () => {
    if (!activeTrip) {
      setActiveTrip(trips[0]);
    } else {
      navigation.navigate('TripDetails');
    }
  };

  const arrowRotateInterpolation = arrowRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <View style={styles.container}>
      <View style={{ zIndex: 10, position: 'absolute', top: 0, left: 0, right: 0 }}>
        <GlobalHeader />
      </View>
      {/* Map Background */}
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: tracking.driverLat || -1.286389,
          longitude: tracking.driverLng || 36.817223,
          latitudeDelta: 0.5,
          longitudeDelta: 0.5,
        }}
        showsUserLocation={false}
        showsMyLocationButton={false}
        onPress={handleMapPress}
      >
        {/* Driver Marker */}
        {tracking.driverLat && tracking.driverLng && (
          <Marker
            coordinate={{ latitude: tracking.driverLat, longitude: tracking.driverLng }}
            title={user?.name || 'You'}
            description="Your current location"
            zIndex={2}
          >
            <View style={styles.driverMarker}>
              <Text style={styles.driverMarkerText}>{driverInitial}</Text>
            </View>
          </Marker>
        )}

        {/* Truck Marker */}
        {tracking.truckLat && tracking.truckLng && (
          <Marker
            coordinate={{ latitude: tracking.truckLat, longitude: tracking.truckLng }}
            onPress={handleTruckPress}
            anchor={{ x: 0.5, y: 0.5 }}
            zIndex={3}
          >
            <View style={[styles.truckMarker, isTruckSelected && styles.truckMarkerSelected]}>
              <Text style={styles.truckMarkerText}>{truckInitial}</Text>
            </View>
          </Marker>
        )}

        {/* Distance Polyline — shown only when truck is selected */}
        {isTruckSelected && tracking.driverLat && tracking.driverLng && tracking.truckLat && tracking.truckLng && (
          <Polyline
            coordinates={[
              { latitude: tracking.driverLat, longitude: tracking.driverLng },
              { latitude: tracking.truckLat, longitude: tracking.truckLng },
            ]}
            strokeColor={theme.colors.primary}
            strokeWidth={3}
            lineDashPattern={[10, 6]}
          />
        )}

        {/* Distance Label at midpoint */}
        {isTruckSelected && midPoint && distanceKm !== null && (
          <Marker
            coordinate={midPoint}
            anchor={{ x: 0.5, y: 0.5 }}
            zIndex={10}
          >
            <View style={styles.distanceBadge}>
              <Text style={styles.distanceBadgeText}>{formatDistance(distanceKm)}</Text>
            </View>
          </Marker>
        )}
      </MapView>

      {/* Vehicle Info Card — shown when truck marker is tapped */}
      {isTruckSelected && (
        <Animated.View style={[styles.vehicleInfoCard, { opacity: cardOpacity }]}>
          <TouchableOpacity style={styles.vehicleInfoClose} onPress={handleCloseCard}>
            <X size={14} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          <View style={styles.vehicleInfoHeader}>
            <View style={styles.vehicleInfoIconCircle}>
              <Text style={styles.vehicleInfoIconText}>{truckInitial}</Text>
            </View>
            <View style={styles.vehicleInfoHeaderText}>
              <Text style={styles.vehicleInfoName} numberOfLines={1}>{user?.tracker_name || 'Vehicle'}</Text>
              <View style={styles.vehicleStatusRow}>
                {tracking.truckConnectionStatus === 'active' ? (
                  <Wifi size={10} color="#4CAF50" />
                ) : (
                  <WifiOff size={10} color="#FF9800" />
                )}
                <Text style={[
                  styles.vehicleStatusText,
                  { color: tracking.truckConnectionStatus === 'active' ? '#4CAF50' : '#FF9800' }
                ]}>
                  {tracking.truckConnectionStatus === 'active' ? 'Online' : 'Offline'}
                </Text>
                <Text style={styles.vehicleStatusDot}> · </Text>
                <Text style={styles.vehicleStatusText}>
                  {tracking.truckMovementStatus === 'moving' ? 'Moving' : 'Parked'}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.vehicleInfoCompactRows}>
            <View style={styles.vehicleInfoRow}>
              <Text style={styles.vehicleInfoLabel}>Driver</Text>
              <Text style={styles.vehicleInfoValue}>{user?.name || '—'}</Text>
            </View>
            <View style={styles.vehicleInfoRow}>
              <Text style={styles.vehicleInfoLabel}>Distance</Text>
              <Text style={[styles.vehicleInfoValue, { color: theme.colors.primary, fontWeight: '700' }]}>
                {distanceKm !== null ? formatDistance(distanceKm) : '—'}
              </Text>
            </View>
          </View>
        </Animated.View>
      )}

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

      {/* Draggable Bottom Sheet */}
      <Animated.View style={[styles.floatingCard, { height: sheetHeight }]} {...panResponder.panHandlers}>
        {/* Handle — tap to toggle */}
        <TouchableOpacity style={styles.handleContainer} onPress={handleTap} activeOpacity={0.9}>
          <Animated.View style={{ transform: [{ rotate: arrowRotateInterpolation }] }}>
            <ChevronUp size={24} color={theme.colors.textSecondary} />
          </Animated.View>
        </TouchableOpacity>

        <View style={styles.cardContent}>
          {!activeTrip ? (
            <View style={styles.noTripContent}>
              {/* Status Header */}
              <View style={styles.statusHeader}>
                <View style={styles.statusIconWrap}>
                  <Activity size={20} color={theme.colors.primary} />
                </View>
                <View style={styles.statusTextWrap}>
                  <Text style={styles.sheetTitle}>Awaiting Assignment</Text>
                  <Text style={styles.sheetSubtitle}>Your vehicle is online and available for dispatch.</Text>
                </View>
              </View>
              
              {expanded && (
                <ScrollView 
                  showsVerticalScrollIndicator={false}
                  style={styles.expandedScroll}
                  contentContainerStyle={styles.expandedScrollContent}
                  nestedScrollEnabled={true}
                >
                  {/* Telemetry Row — 3 metrics */}
                  <View style={styles.telemetryRow}>
                    <View style={styles.telemetryItem}>
                      <Clock size={16} color={theme.colors.primary} />
                      <Text style={styles.telemetryLabel}>Active Time</Text>
                      <Text style={styles.telemetryValue}>{tripStats.loading ? '...' : `${tripStats.activeHours}h`}</Text>
                      <Text style={styles.telemetrySub}>This Shift</Text>
                    </View>
                    <View style={styles.telemetryItem}>
                      <Navigation size={16} color={theme.colors.primary} />
                      <Text style={styles.telemetryLabel}>Trips Completed</Text>
                      <Text style={styles.telemetryValue}>{tripStats.loading ? '...' : tripStats.completedCount}</Text>
                      <Text style={styles.telemetrySub}>Today</Text>
                    </View>
                    <View style={styles.telemetryItem}>
                      <Route size={16} color={theme.colors.primary} />
                      <Text style={styles.telemetryLabel}>Distance Today</Text>
                      <Text style={styles.telemetryValue}>{tripStats.loading ? '...' : `${tripStats.totalDistance} km`}</Text>
                      <Text style={styles.telemetrySub}>Driven</Text>
                    </View>
                  </View>

                  {/* Proximity Section */}
                  <View style={styles.proximityRow}>
                    <View style={styles.proximityCard}>
                      <View style={styles.proximityIconWrap}>
                        <Truck size={16} color={theme.colors.primary} />
                      </View>
                      <View>
                        <Text style={styles.proximityLabel}>Distance to Vehicle</Text>
                        <Text style={styles.proximityValue}>
                          {distanceKm !== null ? formatDistance(distanceKm) : '—'}
                        </Text>
                        <Text style={styles.proximitySub}>
                          {distanceKm !== null ? (distanceKm < 0.5 ? 'Very Close' : distanceKm < 5 ? 'Nearby' : 'En Route') : '—'}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.proximityCard}>
                      <View style={[styles.proximityIconWrap, { backgroundColor: '#E8F5E9' }]}>
                        <Radar size={16} color="#4CAF50" />
                      </View>
                      <View>
                        <Text style={styles.proximityLabel}>Proximity Alert</Text>
                        <Text style={[styles.proximityValue, { color: '#4CAF50' }]}>Nearby</Text>
                        <Text style={styles.proximitySub}>1 vehicle nearby</Text>
                      </View>
                    </View>
                  </View>

                  {/* Fleet KPI Grid — 2×2 */}
                  <View style={styles.kpiGrid}>
                    <View style={styles.kpiCard}>
                      <View style={styles.kpiIconWrap}>
                        <Gauge size={18} color={theme.colors.primary} />
                      </View>
                      <View>
                        <Text style={styles.kpiLabel}>Average Speed</Text>
                        <Text style={styles.kpiValue}>{tracking.truckSpeed || 62} km/h</Text>
                        <Text style={styles.kpiSub}>Today</Text>
                      </View>
                    </View>
                    <View style={styles.kpiCard}>
                      <View style={styles.kpiIconWrap}>
                        <Clock size={18} color="#FF9800" />
                      </View>
                      <View>
                        <Text style={styles.kpiLabel}>Idle Time</Text>
                        <Text style={styles.kpiValue}>35 min</Text>
                        <Text style={styles.kpiSub}>Today</Text>
                      </View>
                    </View>
                    <View style={styles.kpiCard}>
                      <View style={styles.kpiIconWrap}>
                        <Fuel size={18} color="#E53935" />
                      </View>
                      <View>
                        <Text style={styles.kpiLabel}>Fuel Used</Text>
                        <Text style={styles.kpiValue}>78 L</Text>
                        <Text style={styles.kpiSub}>Today</Text>
                      </View>
                    </View>
                    <View style={styles.kpiCard}>
                      <View style={styles.kpiIconWrap}>
                        <MapPinned size={18} color="#1E88E5" />
                      </View>
                      <View>
                        <Text style={styles.kpiLabel}>Next Destination</Text>
                        <Text style={styles.kpiValue}>Dar es Salaam</Text>
                        <Text style={styles.kpiSub}>ETA 10:45 AM</Text>
                      </View>
                    </View>
                  </View>

                  {/* Action Button */}
                  <TouchableOpacity style={styles.vehicleActionBtn} onPress={() => {}} activeOpacity={0.85}>
                    <Truck size={18} color={theme.colors.primary} />
                    <Text style={styles.vehicleActionBtnText}>View My Vehicle</Text>
                  </TouchableOpacity>
                </ScrollView>
              )}

              {!expanded && (
                <TouchableOpacity style={styles.vehicleActionBtn} onPress={() => {}} activeOpacity={0.85}>
                  <Truck size={18} color={theme.colors.primary} />
                  <Text style={styles.vehicleActionBtnText}>View My Vehicle</Text>
                </TouchableOpacity>
              )}
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

              {expanded && (
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
      </Animated.View>

      {/* SOS Screen Modal */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={isSOSVisible}
        onRequestClose={() => setIsSOSVisible(false)}
      >
        <View style={styles.sosPageContainer}>
          <TouchableOpacity 
            style={styles.sosPageBackBtn} 
            onPress={() => setIsSOSVisible(false)}
            activeOpacity={0.7}
          >
            <ArrowLeft size={28} color={theme.colors.text} />
          </TouchableOpacity>

          <View style={styles.sosPageContent}>
            <Text style={styles.sosPageTitle}>{t('having_trouble')}</Text>

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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    overflow: 'hidden',
  },
  handleContainer: {
    paddingVertical: 14,
    alignItems: 'center',
    width: '100%',
  },
  cardContent: {
    paddingHorizontal: theme.spacing.lg,
    flex: 1,
  },
  noTripContent: {
    flex: 1,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFEBEE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statusTextWrap: {
    flex: 1,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.text,
    letterSpacing: 0.1,
  },
  sheetSubtitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
  expandedScroll: {
    flex: 1,
  },
  expandedScrollContent: {
    paddingBottom: 20,
  },
  telemetryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 16,
  },
  telemetryItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  telemetryLabel: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    fontWeight: '600',
    marginTop: 6,
    textAlign: 'center',
  },
  telemetryValue: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.text,
    marginTop: 4,
  },
  telemetrySub: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    fontWeight: '500',
    marginTop: 2,
  },
  proximityRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  proximityCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    gap: 10,
  },
  proximityIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFEBEE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  proximityLabel: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  proximityValue: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.colors.text,
    marginTop: 1,
  },
  proximitySub: {
    fontSize: 9,
    color: theme.colors.textSecondary,
    fontWeight: '500',
    marginTop: 1,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  kpiCard: {
    width: '47%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    gap: 10,
  },
  kpiIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF3E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  kpiLabel: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  kpiValue: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.text,
    marginTop: 1,
  },
  kpiSub: {
    fontSize: 9,
    color: theme.colors.textSecondary,
    fontWeight: '500',
    marginTop: 1,
  },
  vehicleActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.white,
    marginTop: 8,
  },
  vehicleActionBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.primary,
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
  driverMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: theme.colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  driverMarkerText: {
    color: theme.colors.white,
    fontSize: 18,
    fontWeight: '900',
  },
  truckMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: theme.colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  truckMarkerSelected: {
    borderColor: theme.colors.primary,
    borderWidth: 3,
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 8,
  },
  truckMarkerText: {
    color: theme.colors.white,
    fontSize: 18,
    fontWeight: '900',
  },
  distanceBadge: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  distanceBadgeText: {
    color: theme.colors.white,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  vehicleInfoCard: {
    position: 'absolute',
    top: 120,
    left: 12,
    width: 220,
    backgroundColor: theme.colors.white,
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 20,
  },
  vehicleInfoClose: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  vehicleInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingRight: 20,
  },
  vehicleInfoIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  vehicleInfoIconText: {
    color: theme.colors.white,
    fontSize: 14,
    fontWeight: '900',
  },
  vehicleInfoHeaderText: {
    flex: 1,
  },
  vehicleInfoName: {
    fontSize: 13,
    fontWeight: '800',
    color: theme.colors.text,
  },
  vehicleStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 3,
  },
  vehicleStatusText: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  vehicleStatusDot: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    fontWeight: '900',
  },
  vehicleInfoCompactRows: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 8,
    gap: 6,
  },
  vehicleInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vehicleInfoLabel: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  vehicleInfoValue: {
    fontSize: 11,
    color: theme.colors.text,
    fontWeight: '600',
  },
});
