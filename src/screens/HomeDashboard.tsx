import React, { useState, useRef, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Platform, UIManager, LayoutAnimation, Modal, Animated, PanResponder, ScrollView } from 'react-native';
import MapView, { Marker, Polyline } from '../components/MapView';
import { GlobalHeader } from '../components/GlobalHeader';
import { theme } from '../theme/theme';
import { useStore } from '../store/useStore';
import { Button } from '../components/Button';
import { Bell, MapPin, Navigation, Clock, CreditCard, ArrowLeft, ArrowRight, Lock, Truck, AlertTriangle, Phone, MoonStar, ChevronUp, X, Zap, Wifi, WifiOff, User, Activity, Gauge, Fuel, MapPinned, Radar, Route, Package, CheckCircle, Info, Pause, Square } from 'lucide-react-native';
import { useTranslation } from '../hooks/useTranslation';
import { useLiveTracking } from '../hooks/useLiveTracking';
import { supabase } from '../lib/supabase';
import { logDriverTripEvent } from '../services/driverTripEvents';

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
const PROXIMITY_START_KM = 0.5;
const ENGINE_IDLE_WARNING_SECONDS = 120;

const formatTimer = (seconds: number): string => {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const days = Math.floor(safeSeconds / 86400);
  const hours = Math.floor((safeSeconds % 86400) / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const secs = safeSeconds % 60;
  const clock = [hours, minutes, secs].map(value => String(value).padStart(2, '0')).join(':');
  return days > 0 ? `${days}d ${clock}` : clock;
};

export const HomeDashboard = ({ navigation }: any) => {
  const {
    user,
    toggleOnline,
    activeTrip,
    trips,
    setActiveTrip,
    driverTripSession,
    startDriverTrip,
    stopDriverTrip,
    resumeDriverTrip,
    markDriverDelivered,
    setDriverTripNearby,
  } = useStore();
  const [isSOSVisible, setIsSOSVisible] = useState(false);
  const [simulationStage, setSimulationStage] = useState<'awaiting' | 'assigned' | 'convoy_ready' | 'trip_active'>('awaiting');
  const isDevBypass = user?.driver_id === 'dev-bypass-driver';

  const { width: SCREEN_WIDTH } = Dimensions.get('window');
  const SLIDER_CONTAINER_WIDTH = SCREEN_WIDTH - 40;
  const HANDLE_SIZE = 54;
  const MAX_SLIDE_DIST = SLIDER_CONTAINER_WIDTH - HANDLE_SIZE - 8; // 4px padding on each side
  const slideX = useRef(new Animated.Value(0)).current;

  const sliderPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {},
      onPanResponderMove: (_, gestureState) => {
        let nextX = gestureState.dx;
        if (nextX < 0) nextX = 0;
        if (nextX > MAX_SLIDE_DIST) nextX = MAX_SLIDE_DIST;
        slideX.setValue(nextX);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx >= MAX_SLIDE_DIST * 0.85) {
          // Success! Slide to end and trigger active trip state
          Animated.timing(slideX, {
            toValue: MAX_SLIDE_DIST,
            duration: 100,
            useNativeDriver: false,
          }).start(() => {
            console.log("Trip Started");
            setSimulationStage('trip_active');
          });
        } else {
          // Reset slider back
          Animated.spring(slideX, {
            toValue: 0,
            useNativeDriver: false,
            tension: 50,
            friction: 7,
          }).start();
        }
      },
    })
  ).current;
  const [isNightPillExpanded, setIsNightPillExpanded] = useState(false);
  const [isSpeedPillExpanded, setIsSpeedPillExpanded] = useState(false);
  const [isTruckSelected, setIsTruckSelected] = useState(false);
  const [clockNow, setClockNow] = useState(Date.now());
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

  // Auto-fit map to show both markers or simulated route
  useEffect(() => {
    if (simulationStage === 'assigned' || simulationStage === 'convoy_ready' || simulationStage === 'trip_active') {
      if (mapRef.current) {
        mapRef.current.fitToCoordinates(
          [
            { latitude: -6.7924, longitude: 39.2083 }, // Dar es Salaam
            { latitude: -12.9774, longitude: 28.6500 }, // Ndola
          ],
          { edgePadding: { top: 180, right: 60, bottom: 380, left: 60 }, animated: true }
        );
      }
      return;
    }

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
  }, [tracking.driverLat, tracking.truckLat, simulationStage]);

  const driverInitial = user?.name?.charAt(0)?.toUpperCase() || 'D';
  const truckInitial = user?.tracker_name?.charAt(0)?.toUpperCase() || 'T';
  const isWithinStartRange = distanceKm !== null && distanceKm <= PROXIMITY_START_KM;
  const hasLivePair = Boolean(tracking.driverLat && tracking.driverLng && tracking.truckLat && tracking.truckLng);

  useEffect(() => {
    if (isWithinStartRange && !driverTripSession) {
      setDriverTripNearby();
    }
  }, [isWithinStartRange, driverTripSession, setDriverTripNearby]);

  useEffect(() => {
    if (!driverTripSession || !['active', 'stopped', 'delivered_pending_approval'].includes(driverTripSession.status)) return;
    const timer = setInterval(() => setClockNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [driverTripSession?.status]);

  const activeSeconds = useMemo(() => {
    if (!driverTripSession) return 0;
    const liveSeconds = driverTripSession.status === 'active' && driverTripSession.lastResumedAt
      ? Math.max(0, Math.floor((clockNow - new Date(driverTripSession.lastResumedAt).getTime()) / 1000))
      : 0;
    return driverTripSession.totalActiveSeconds + liveSeconds;
  }, [driverTripSession, clockNow]);

  const stoppedSeconds = useMemo(() => {
    if (!driverTripSession) return 0;
    const liveSeconds = driverTripSession.status === 'stopped' && driverTripSession.currentStopStartedAt
      ? Math.max(0, Math.floor((clockNow - new Date(driverTripSession.currentStopStartedAt).getTime()) / 1000))
      : 0;
    return driverTripSession.totalStoppedSeconds + liveSeconds;
  }, [driverTripSession, clockNow]);

  const driverTripTitle = useMemo(() => {
    if (driverTripSession?.status === 'active') return 'Trip In Progress';
    if (driverTripSession?.status === 'stopped') return 'Stop Timer Running';
    if (driverTripSession?.status === 'delivered_pending_approval') return 'Delivery Submitted';
    if (isWithinStartRange) return 'Vehicle Matched';
    return 'Awaiting Assignment';
  }, [driverTripSession?.status, isWithinStartRange]);

  const driverTripSubtitle = useMemo(() => {
    if (driverTripSession?.status === 'active') return 'Drive timer is active. Stop only when parked safely.';
    if (driverTripSession?.status === 'stopped') return 'If stopping for more than 2 minutes, shut off the engine.';
    if (driverTripSession?.status === 'delivered_pending_approval') return 'Management must approve this delivery before it is closed.';
    if (isWithinStartRange) return 'You are close enough to your assigned truck. Start when ready.';
    if (!hasLivePair) return 'Waiting for phone GPS and Navixy tracker location.';
    return 'Move closer to your assigned truck to start the trip.';
  }, [driverTripSession?.status, hasLivePair, isWithinStartRange]);

  const logTripEvent = (eventType: 'start' | 'stop' | 'resume' | 'delivered_pending_approval', session: any) => {
    if (!session) return;
    void logDriverTripEvent({
      eventType,
      sessionId: session.id,
      driverId: session.driver_id,
      driverName: session.driver_name,
      trackerName: session.tracker_name,
      driverLat: tracking.driverLat,
      driverLng: tracking.driverLng,
      truckLat: tracking.truckLat,
      truckLng: tracking.truckLng,
      truckSpeed: tracking.truckSpeed,
      totalActiveSeconds: session.totalActiveSeconds,
      totalStoppedSeconds: session.totalStoppedSeconds,
    });
  };

  const handleStartDriverTrip = () => {
    if (!isWithinStartRange) {
      handleTruckPress();
      return;
    }
    const session = startDriverTrip();
    logTripEvent('start', session);
  };

  const handleStopDriverTrip = () => {
    const session = stopDriverTrip();
    logTripEvent('stop', session);
  };

  const handleResumeDriverTrip = () => {
    const session = resumeDriverTrip();
    logTripEvent('resume', session);
  };

  const handleDeliveredRequest = () => {
    const session = markDriverDelivered();
    logTripEvent('delivered_pending_approval', session);
  };

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

  const renderDriverTripActions = () => {
    if (driverTripSession?.status === 'delivered_pending_approval') {
      return (
        <View style={styles.approvalBanner}>
          <View style={styles.checkStatusDot} />
          <View style={{ flex: 1 }}>
            <Text style={styles.approvalTitle}>Waiting for management approval</Text>
            <Text style={styles.approvalText}>Delivery timestamp has been captured locally.</Text>
          </View>
        </View>
      );
    }

    if (driverTripSession?.status === 'active') {
      return (
        <View style={styles.tripActionStack}>
          <TouchableOpacity style={[styles.tripActionBtn, styles.tripStopBtn]} onPress={handleStopDriverTrip} activeOpacity={0.85}>
            <Text style={styles.tripStopBtnText}>Stop Trip</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tripActionBtn, styles.tripSecondaryBtn]} onPress={handleDeliveredRequest} activeOpacity={0.85}>
            <Text style={styles.tripSecondaryBtnText}>Mark Delivered</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (driverTripSession?.status === 'stopped') {
      return (
        <View style={styles.tripActionStack}>
          <TouchableOpacity style={[styles.tripActionBtn, styles.tripStartBtn]} onPress={handleResumeDriverTrip} activeOpacity={0.85}>
            <Text style={styles.tripStartBtnText}>Resume Trip</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tripActionBtn, styles.tripSecondaryBtn]} onPress={handleDeliveredRequest} activeOpacity={0.85}>
            <Text style={styles.tripSecondaryBtnText}>Mark Delivered</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (isWithinStartRange) {
      return (
        <TouchableOpacity style={[styles.tripActionBtn, styles.tripStartBtn]} onPress={handleStartDriverTrip} activeOpacity={0.85}>
          <Text style={styles.tripStartBtnText}>Start Trip</Text>
        </TouchableOpacity>
      );
    }

    return (
      <View style={{ width: '100%' }}>
        <TouchableOpacity style={styles.vehicleActionBtn} onPress={handleTruckPress} activeOpacity={0.85}>
          <Truck size={18} color={theme.colors.primary} />
          <Text style={styles.vehicleActionBtnText}>View My Vehicle</Text>
        </TouchableOpacity>
        {isDevBypass && simulationStage === 'awaiting' && (
          <TouchableOpacity
            style={[styles.tripActionBtn, styles.tripStartBtn, { marginTop: 8 }]}
            onPress={() => setSimulationStage('assigned')}
            activeOpacity={0.85}
          >
            <Text style={styles.tripStartBtnText}>Next →</Text>
          </TouchableOpacity>
        )}
      </View>
    );
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

      {/* Consignment Card Overlay (Simulation Mode Only) */}
      {isDevBypass && (simulationStage === 'assigned' || simulationStage === 'convoy_ready' || simulationStage === 'trip_active') && (
        <View style={styles.simConsignmentCard}>
          <View style={styles.simCardHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.simCardTitle}>Consignment #123</Text>
              <Text style={styles.simCardRoute}>
                Dar es Salaam <Text style={{ color: theme.colors.primary }}>→</Text> Ndola
              </Text>
            </View>
            <TouchableOpacity 
              style={[styles.simStatusBadge, simulationStage === 'trip_active' && { borderColor: '#E53935', backgroundColor: '#FFEEEF', flexDirection: 'row', alignItems: 'center' }]}
              onPress={() => {
                if (simulationStage === 'trip_active') {
                  slideX.setValue(0);
                  setSimulationStage('awaiting');
                }
              }}
              disabled={simulationStage !== 'trip_active'}
              activeOpacity={0.7}
            >
              {simulationStage === 'trip_active' ? (
                <>
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#E53935', marginRight: 5 }} />
                  <Text style={[styles.simStatusText, { color: '#E53935', fontWeight: '800' }]}>ACTIVE</Text>
                </>
              ) : simulationStage === 'convoy_ready' ? (
                <Text style={styles.simStatusText}>✓ READY</Text>
              ) : (
                <>
                  <Package size={14} color={theme.colors.primary} style={{ marginRight: 4 }} />
                  <Text style={styles.simStatusText}>ASSIGNED</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
          <View style={styles.simDivider} />
          <View style={styles.simStatsRow}>
            <View style={styles.simStatCol}>
              <Text style={styles.simStatLabel}>Vehicles in Convoy</Text>
              <View style={styles.simStatValRow}>
                <Truck size={18} color={theme.colors.primary} style={{ marginRight: 6 }} />
                <Text style={styles.simStatValue}>4</Text>
              </View>
            </View>
            <View style={styles.simStatsDivider} />
            <View style={styles.simStatCol}>
              <Text style={styles.simStatLabel}>
                {simulationStage === 'trip_active' ? 'Vehicles Online' : 'Ready Vehicles'}
              </Text>
              <View style={styles.simStatValRow}>
                {simulationStage === 'trip_active' ? (
                  <Wifi size={18} color={theme.colors.primary} style={{ marginRight: 6 }} />
                ) : (
                  <CheckCircle size={18} color={theme.colors.primary} style={{ marginRight: 6 }} />
                )}
                <Text style={styles.simStatValue}>
                  {simulationStage === 'trip_active' || simulationStage === 'convoy_ready' ? '4/4' : '0/4'}
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}
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
        {(simulationStage === 'assigned' || simulationStage === 'convoy_ready') ? (
          <>
            {/* Origin Marker: Dar es Salaam */}
            <Marker
              coordinate={{ latitude: -6.7924, longitude: 39.2083 }}
              anchor={{ x: 0.15, y: 0.85 }}
            >
              <View style={styles.simMarkerWrapper}>
                <MapPin size={24} color="#E53935" fill="#E53935" />
                <View style={styles.simMarkerBubble}>
                  <Text style={styles.simMarkerBubbleText}>Dar es Salaam</Text>
                </View>
              </View>
            </Marker>

            {/* Destination Marker: Ndola */}
            <Marker
              coordinate={{ latitude: -12.9774, longitude: 28.6500 }}
              anchor={{ x: 0.15, y: 0.85 }}
            >
              <View style={styles.simMarkerWrapper}>
                <MapPin size={24} color="#1D1D1F" fill="#1D1D1F" />
                <View style={styles.simMarkerBubble}>
                  <Text style={styles.simMarkerBubbleText}>Ndola</Text>
                </View>
              </View>
            </Marker>

            {/* Driver Location Marker */}
            <Marker
              coordinate={{ latitude: -8.7832, longitude: 34.5085 }}
              anchor={{ x: 0.5, y: 0.5 }}
            >
              <View style={styles.simDriverMarkerCircleOuter}>
                <View style={styles.simDriverMarkerCircleInner} />
              </View>
            </Marker>

            {/* Simulated Route Polyline */}
            <Polyline
              coordinates={[
                { latitude: -6.7924, longitude: 39.2083 }, // Dar es Salaam
                { latitude: -6.8278, longitude: 37.6591 }, // Morogoro
                { latitude: -7.7854, longitude: 35.6861 }, // Iringa
                { latitude: -8.9000, longitude: 33.4500 }, // Mbeya
                { latitude: -9.3000, longitude: 32.7700 }, // Tunduma
                { latitude: -11.8300, longitude: 31.4500 }, // Mpika
                { latitude: -13.2300, longitude: 30.2300 }, // Serenje
                { latitude: -12.9774, longitude: 28.6500 }, // Ndola
              ]}
              strokeColor="#E53935"
              strokeWidth={3}
              lineDashPattern={[6, 6]}
            />
          </>
        ) : (
          <>
            {/* Driver Marker */}
            {tracking.driverLat && tracking.driverLng && (
              <Marker
                identifier="driver-location"
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
                identifier="assigned-truck"
                coordinate={{ latitude: tracking.truckLat, longitude: tracking.truckLng }}
                title={user?.tracker_name || 'Assigned Truck'}
                description="Your assigned vehicle"
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
                identifier="driver-truck-distance"
                coordinate={midPoint}
                anchor={{ x: 0.5, y: 0.5 }}
                zIndex={10}
              >
                <View style={styles.distanceBadge}>
                  <Text style={styles.distanceBadgeText}>{formatDistance(distanceKm)}</Text>
                </View>
              </Marker>
            )}
          </>
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

      {/* Zoom Button Overlay (Simulation Mode Only) */}
      {isDevBypass && (simulationStage === 'assigned' || simulationStage === 'convoy_ready' || simulationStage === 'trip_active') && (
        <TouchableOpacity
          style={styles.zoomButton}
          onPress={() => {
            // Animate map view to zoom out slightly to show Tanzania & Zambia route
            mapRef.current?.animateToRegion({
              latitude: -9.88,
              longitude: 33.93,
              latitudeDelta: 8.5,
              longitudeDelta: 8.5,
            }, 1000);
          }}
          activeOpacity={0.8}
        >
          <Text style={styles.zoomButtonText}>−</Text>
        </TouchableOpacity>
      )}

      {/* SOS Button Overlay */}
      <TouchableOpacity 
        style={[
          styles.sosButton,
          (simulationStage === 'assigned' || simulationStage === 'convoy_ready' || simulationStage === 'trip_active') && { top: 240 }
        ]} 
        onPress={() => setIsSOSVisible(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.sosButtonText}>SOS</Text>
      </TouchableOpacity>

      {/* Night Hours Pill Overlay */}
      <TouchableOpacity 
        style={[
          styles.nightPill,
          (simulationStage === 'assigned' || simulationStage === 'convoy_ready' || simulationStage === 'trip_active') && { top: 310, width: 56, height: 56, borderRadius: 28, justifyContent: 'center', paddingHorizontal: 0 }
        ]} 
        onPress={() => {
          if (simulationStage === 'assigned' || simulationStage === 'convoy_ready' || simulationStage === 'trip_active') return;
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          setIsNightPillExpanded(!isNightPillExpanded);
        }}
        activeOpacity={0.8}
      >
        {isNightPillExpanded && simulationStage !== 'assigned' && simulationStage !== 'convoy_ready' && simulationStage !== 'trip_active' && (
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
        style={[
          styles.speedPill,
          (simulationStage === 'assigned' || simulationStage === 'convoy_ready' || simulationStage === 'trip_active') && { top: 380, width: 56, height: 56, borderRadius: 28, justifyContent: 'center', paddingHorizontal: 0 }
        ]} 
        onPress={() => {
          if (simulationStage === 'assigned' || simulationStage === 'convoy_ready' || simulationStage === 'trip_active') return;
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          setIsSpeedPillExpanded(!isSpeedPillExpanded);
        }}
        activeOpacity={0.8}
      >
        {isSpeedPillExpanded && simulationStage !== 'assigned' && simulationStage !== 'convoy_ready' && simulationStage !== 'trip_active' && (
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
      <Animated.View 
        style={[
          styles.floatingCard, 
          { 
            height: simulationStage === 'assigned' 
              ? 400 
              : simulationStage === 'convoy_ready' 
                ? 480 
                : simulationStage === 'trip_active' 
                  ? 520 
                  : sheetHeight 
          }
        ]} 
        {...((simulationStage === 'assigned' || simulationStage === 'convoy_ready' || simulationStage === 'trip_active') ? {} : panResponder.panHandlers)}
      >
        {simulationStage === 'assigned' ? (
          <View style={styles.simSheetContent}>
            {/* Handle */}
            <View style={styles.handleContainer}>
              <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: '#D2D2D7' }} />
            </View>
            
            {/* Title Block */}
            <View style={styles.simProximityHeader}>
              <View style={styles.simPinCircle}>
                <MapPin size={20} color={theme.colors.primary} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.simProximityTitle}>Move closer to your assigned vehicle</Text>
                <Text style={styles.simProximitySubtitle}>
                  You need to be within 500m of your truck to mark yourself as Ready.
                </Text>
              </View>
            </View>

            {/* Proximity Card (gray background) */}
            <View style={styles.simTruckDistanceCard}>
              <View style={styles.simTruckCol}>
                <View style={styles.simTruckCircle}>
                  <Truck size={18} color={theme.colors.primary} />
                </View>
                <View style={{ marginLeft: 10 }}>
                  <Text style={styles.simTruckLabel}>Your Vehicle</Text>
                  <Text style={styles.simTruckName}>ASAS TRK 04</Text>
                  <Text style={styles.simTrackerName}>ASAS Tracker 04</Text>
                </View>
              </View>
              
              <View style={styles.simDistanceCol}>
                <Text style={styles.simDistanceLabel}>Distance</Text>
                <Text style={styles.simDistanceVal}>3.1 km</Text>
                <Text style={styles.simDistanceStatus}>Away from vehicle</Text>
              </View>
            </View>

            {/* Information Message card */}
            <View style={styles.simInfoCard}>
              <Info size={16} color="#007AFF" style={{ marginRight: 10 }} />
              <Text style={styles.simInfoText}>
                Get closer to your vehicle to unlock the <Text style={{ fontWeight: '700' }}>Ready to Start</Text> option.
              </Text>
            </View>

            {/* Next Button in Simulation Mode (Assigned State) */}
            <TouchableOpacity
              style={[styles.tripActionBtn, styles.tripStartBtn, { marginTop: 12 }]}
              onPress={() => setSimulationStage('convoy_ready')}
              activeOpacity={0.85}
            >
              <Text style={styles.tripStartBtnText}>Next →</Text>
            </TouchableOpacity>
          </View>
        ) : simulationStage === 'convoy_ready' ? (
          <View style={styles.simSheetContent}>
            {/* Handle */}
            <View style={styles.handleContainer}>
              <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: '#D2D2D7' }} />
            </View>

            {/* Ready Banner */}
            <View style={styles.simReadyBanner}>
              <View style={styles.simUsersCircle}>
                <User size={22} color={theme.colors.primary} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.simReadyBannerTitle}>All vehicles are ready!</Text>
                <Text style={styles.simReadyBannerSubtitle}>
                  All 4 vehicles in the convoy are ready to begin. Please wait for all drivers to slide and start the trip.
                </Text>
              </View>
            </View>

            {/* Convoy Readiness Title */}
            <Text style={styles.simConvoyTitle}>Convoy Readiness</Text>

            {/* Convoy Grid (4 cards) */}
            <View style={styles.simConvoyGrid}>
              {[
                { id: '1', plate: 'TZA 123 AB', name: 'Driver A' },
                { id: '2', plate: 'TZA 456 CD', name: 'Driver B' },
                { id: '3', plate: 'TZA 789 EF', name: 'Driver C' },
                { id: '4', plate: 'TZA 321 GH', name: 'Driver D' },
              ].map((item) => (
                <View key={item.id} style={styles.simConvoyCardSmall}>
                  <View style={styles.simCardCheckBadge}>
                    <CheckCircle size={10} color={theme.colors.white} fill={theme.colors.success} />
                  </View>
                  <View style={styles.simCardTruckCircle}>
                    <Truck size={14} color={theme.colors.primary} />
                  </View>
                  <Text style={styles.simCardPlate} numberOfLines={1}>{item.plate}</Text>
                  <Text style={styles.simCardDriverName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.simCardStatus}>Ready</Text>
                </View>
              ))}
            </View>

            {/* Slide to Start Slider */}
            <View style={styles.simSliderContainer}>
              {/* Background Track with Text */}
              <View style={styles.simSliderTrack}>
                <Text style={styles.simSliderText}>SLIDE TO START TRIP</Text>
              </View>
              {/* Animated Sliding Handle */}
              <Animated.View
                style={[
                  styles.simSliderHandle,
                  { transform: [{ translateX: slideX }] }
                ]}
                {...sliderPanResponder.panHandlers}
              >
                <ArrowRight size={22} color={theme.colors.primary} />
              </Animated.View>
            </View>

            {/* Helper Text with lock icon */}
            <View style={styles.simSliderHelperContainer}>
              <Lock size={12} color="#6E6E73" style={{ marginRight: 6 }} />
              <Text style={styles.simSliderHelperText}>
                Slide to the right to start the trip.
              </Text>
            </View>
          </View>
        ) : simulationStage === 'trip_active' ? (
          <View style={styles.simSheetContent}>
            {/* Handle */}
            <View style={styles.handleContainer}>
              <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: '#D2D2D7' }} />
            </View>

            {/* Convoy Formation Section */}
            <Text style={styles.simConvoyTitle}>Convoy Formation</Text>
            <View style={styles.simFormationRow}>
              {/* Lead Vehicle */}
              <View style={styles.simFormationColumn}>
                <Text style={styles.simFormationLabel}>Lead Vehicle</Text>
                <View style={styles.simFormationItem}>
                  <View style={styles.simFormationIconContainer}>
                    <Truck size={16} color={theme.colors.primary} />
                  </View>
                  <Text style={styles.simFormationPlate}>TZA 123 AB</Text>
                  <Text style={styles.simFormationDriver}>Driver A</Text>
                </View>
              </View>

              {/* Connector */}
              <View style={styles.simFormationConnector}>
                <Text style={styles.simFormationDistance}>300m</Text>
                <View style={styles.simDashedLine} />
              </View>

              {/* My Vehicle */}
              <View style={styles.simFormationColumn}>
                <Text style={[styles.simFormationLabel, { color: theme.colors.primary }]}>My Vehicle</Text>
                <View style={[styles.simFormationItem, styles.simFormationItemActive]}>
                  <View style={styles.simFormationIconContainerActive}>
                    <Truck size={16} color={theme.colors.primary} />
                  </View>
                  <Text style={styles.simFormationPlate}>TZA 456 CD</Text>
                  <Text style={[styles.simFormationDriver, { color: theme.colors.primary, fontWeight: '700' }]}>You</Text>
                </View>
              </View>

              {/* Connector */}
              <View style={styles.simFormationConnector}>
                <Text style={styles.simFormationDistance}>450m</Text>
                <View style={styles.simDashedLine} />
              </View>

              {/* Vehicle C */}
              <View style={styles.simFormationColumn}>
                <Text style={styles.simFormationLabel}>Vehicle C</Text>
                <View style={styles.simFormationItem}>
                  <View style={styles.simFormationIconContainer}>
                    <Truck size={16} color={theme.colors.primary} />
                  </View>
                  <Text style={styles.simFormationPlate}>TZA 789 EF</Text>
                  <Text style={styles.simFormationDriver}>Driver C</Text>
                </View>
              </View>

              {/* Connector */}
              <View style={styles.simFormationConnector}>
                <Text style={styles.simFormationDistance}>290m</Text>
                <View style={styles.simDashedLine} />
              </View>

              {/* Tail Vehicle */}
              <View style={styles.simFormationColumn}>
                <Text style={styles.simFormationLabel}>Tail Vehicle</Text>
                <View style={styles.simFormationItem}>
                  <View style={styles.simFormationIconContainer}>
                    <Truck size={16} color={theme.colors.primary} />
                  </View>
                  <Text style={styles.simFormationPlate}>TZA 321 GH</Text>
                  <Text style={styles.simFormationDriver}>Driver D</Text>
                </View>
              </View>
            </View>

            {/* Convoy Health Section */}
            <Text style={styles.simConvoyTitle}>Convoy Health</Text>
            <View style={styles.simHealthCard}>
              <View style={styles.simHealthGrid}>
                {/* Vehicles Online */}
                <View style={styles.simHealthItem}>
                  <View style={styles.simHealthIconWrap}>
                    <Wifi size={16} color={theme.colors.primary} />
                  </View>
                  <View style={{ marginLeft: 8 }}>
                    <Text style={styles.simHealthLabel}>Vehicles Online</Text>
                    <Text style={styles.simHealthValue}>4/4</Text>
                  </View>
                </View>

                {/* Average Speed */}
                <View style={styles.simHealthItem}>
                  <View style={styles.simHealthIconWrap}>
                    <Gauge size={16} color={theme.colors.primary} />
                  </View>
                  <View style={{ marginLeft: 8 }}>
                    <Text style={styles.simHealthLabel}>Average Speed</Text>
                    <Text style={styles.simHealthValue}>58 km/h</Text>
                  </View>
                </View>

                {/* Distance Travelled */}
                <View style={styles.simHealthItem}>
                  <View style={styles.simHealthIconWrap}>
                    <Route size={16} color={theme.colors.primary} />
                  </View>
                  <View style={{ marginLeft: 8 }}>
                    <Text style={styles.simHealthLabel}>Distance Travelled</Text>
                    <Text style={styles.simHealthValue}>312 km</Text>
                  </View>
                </View>

                {/* Est. Time to Destination */}
                <View style={styles.simHealthItem}>
                  <View style={styles.simHealthIconWrap}>
                    <Clock size={16} color={theme.colors.primary} />
                  </View>
                  <View style={{ marginLeft: 8 }}>
                    <Text style={styles.simHealthLabel}>Est. Time to Dest.</Text>
                    <Text style={styles.simHealthValue}>6h 45m</Text>
                  </View>
                </View>
              </View>

              {/* Convoy Health Footer */}
              <View style={styles.simHealthFooter}>
                <CheckCircle size={14} color="#E53935" fill="#FFEEEF" />
                <Text style={styles.simHealthFooterText}>
                  Convoy is operating within safe distance.
                </Text>
              </View>
            </View>

            {/* Bottom Actions Row */}
            <View style={styles.simActiveActionsRow}>
              {/* Request Stop */}
              <TouchableOpacity 
                style={styles.simRequestStopBtn}
                onPress={() => console.log("Stop Requested")}
                activeOpacity={0.8}
              >
                <View style={styles.simPauseCircle}>
                  <Pause size={16} color={theme.colors.primary} />
                </View>
                <View style={{ marginLeft: 8, flex: 1 }}>
                  <Text style={styles.simActionBtnTitle}>Request a Stop</Text>
                  <Text style={styles.simActionBtnSub}>Notify convoy to pause</Text>
                </View>
              </TouchableOpacity>

              {/* End Trip (Disabled) */}
              <View style={styles.simEndTripBtnDisabled}>
                <View style={styles.simStopCircleDisabled}>
                  <Square size={14} color="#AEAEB2" fill="#AEAEB2" />
                </View>
                <View style={{ marginLeft: 8, flex: 1 }}>
                  <Text style={styles.simActionBtnTitleDisabled}>End Trip</Text>
                  <Text style={styles.simActionBtnSubDisabled}>Not available yet</Text>
                </View>
              </View>
            </View>
          </View>
        ) : (
          <>
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
                      <Text style={styles.sheetTitle}>{driverTripTitle}</Text>
                      <Text style={styles.sheetSubtitle}>{driverTripSubtitle}</Text>
                    </View>
                  </View>

                  {(driverTripSession?.status === 'active' || driverTripSession?.status === 'stopped' || driverTripSession?.status === 'delivered_pending_approval') && (
                    <View style={styles.timerStrip}>
                      <View style={styles.timerItem}>
                        <Text style={styles.timerLabel}>Drive Timer</Text>
                        <Text style={styles.timerValue}>{formatTimer(activeSeconds)}</Text>
                      </View>
                      <View style={styles.timerDivider} />
                      <View style={styles.timerItem}>
                        <Text style={styles.timerLabel}>Stop Timer</Text>
                        <Text style={[styles.timerValue, driverTripSession?.status === 'stopped' && stoppedSeconds >= ENGINE_IDLE_WARNING_SECONDS && styles.timerWarning]}>
                          {formatTimer(stoppedSeconds)}
                        </Text>
                      </View>
                    </View>
                  )}

                  {driverTripSession?.status === 'stopped' && (
                    <View style={styles.engineDisclaimer}>
                      <AlertTriangle size={16} color="#B45309" />
                      <Text style={styles.engineDisclaimerText}>
                        If stopping for more than 2 minutes, please shut off the engine.
                      </Text>
                    </View>
                  )}
                  
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
                          <Text style={styles.telemetryLabel}>Drive Timer</Text>
                          <Text style={styles.telemetryValue}>{formatTimer(activeSeconds)}</Text>
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
                            <Text style={[styles.proximityValue, { color: isWithinStartRange ? '#4CAF50' : '#FF9800' }]}>
                              {isWithinStartRange ? 'Ready' : 'Not Ready'}
                            </Text>
                            <Text style={styles.proximitySub}>
                              {isWithinStartRange ? 'Start enabled' : `Within ${Math.round(PROXIMITY_START_KM * 1000)} m required`}
                            </Text>
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
                            <Text style={styles.kpiLabel}>Stop Timer</Text>
                            <Text style={styles.kpiValue}>{formatTimer(stoppedSeconds)}</Text>
                            <Text style={styles.kpiSub}>Current Trip</Text>
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

                      {renderDriverTripActions()}
                    </ScrollView>
                  )}

                  {!expanded && (
                    renderDriverTripActions()
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
          </>
        )}
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
  timerStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  timerItem: {
    flex: 1,
  },
  timerLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.68)',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  timerValue: {
    fontSize: 20,
    color: theme.colors.white,
    fontWeight: '900',
    marginTop: 2,
  },
  timerWarning: {
    color: '#F59E0B',
  },
  timerDivider: {
    width: 1,
    height: 34,
    backgroundColor: 'rgba(255,255,255,0.18)',
    marginHorizontal: 12,
  },
  engineDisclaimer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },
  engineDisclaimerText: {
    flex: 1,
    fontSize: 12,
    color: '#92400E',
    fontWeight: '700',
    lineHeight: 17,
  },
  tripActionStack: {
    gap: 10,
  },
  tripActionBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  tripStartBtn: {
    backgroundColor: theme.colors.primary,
  },
  tripStartBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.white,
  },
  tripStopBtn: {
    backgroundColor: '#111827',
  },
  tripStopBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.white,
  },
  tripSecondaryBtn: {
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.white,
  },
  tripSecondaryBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  approvalBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 14,
    padding: 12,
    marginTop: 8,
  },
  checkStatusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
  },
  approvalTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#065F46',
  },
  approvalText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#047857',
    marginTop: 2,
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
  simConsignmentCard: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 70 : 60,
    left: '4%',
    right: '4%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    zIndex: 20,
  },
  simCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  simCardTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1D1D1F',
    letterSpacing: -0.3,
  },
  simCardRoute: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6E6E73',
    marginTop: 2,
  },
  simStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEEEF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 99,
  },
  simStatusText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#E53935',
    letterSpacing: 0.2,
  },
  simDivider: {
    height: 1,
    backgroundColor: '#F2F2F7',
    marginVertical: 10,
  },
  simStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  simStatCol: {
    flex: 1,
  },
  simStatLabel: {
    fontSize: 11,
    color: '#6E6E73',
    fontWeight: '500',
    marginBottom: 4,
  },
  simStatValRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  simStatValue: {
    fontSize: 14,
    fontWeight: '900',
    color: '#E53935',
  },
  simStatsDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#F2F2F7',
    marginHorizontal: 16,
  },
  simMarkerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  simMarkerBubble: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginLeft: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  simMarkerBubbleText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1D1D1F',
  },
  simDriverMarkerCircleOuter: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 122, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(0, 122, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  simDriverMarkerCircleInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#007AFF',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  simSheetContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  simProximityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  simPinCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFEEEF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  simProximityTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1D1D1F',
    lineHeight: 22,
  },
  simProximitySubtitle: {
    fontSize: 12,
    color: '#6E6E73',
    lineHeight: 16,
    marginTop: 2,
  },
  simTruckDistanceCard: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F7',
    borderRadius: 16,
    padding: 16,
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  simTruckCol: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  simTruckCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFEEEF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  simTruckLabel: {
    fontSize: 11,
    color: '#6E6E73',
    fontWeight: '500',
  },
  simTruckName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1D1D1F',
    marginTop: 1,
  },
  simTrackerName: {
    fontSize: 11,
    color: '#6E6E73',
    marginTop: 1,
  },
  simDistanceCol: {
    alignItems: 'flex-end',
    paddingLeft: 12,
  },
  simDistanceLabel: {
    fontSize: 11,
    color: '#6E6E73',
    fontWeight: '500',
  },
  simDistanceVal: {
    fontSize: 18,
    fontWeight: '900',
    color: '#E53935',
    marginTop: 1,
  },
  simDistanceStatus: {
    fontSize: 11,
    color: '#E53935',
    fontWeight: '600',
    marginTop: 1,
  },
  simInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F7FF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D2E3FF',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  simInfoText: {
    flex: 1,
    fontSize: 12,
    color: '#3A3A3C',
    lineHeight: 16,
  },
  zoomButton: {
    position: 'absolute',
    top: 180,
    right: 20,
    backgroundColor: theme.colors.white,
    width: 36,
    height: 36,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D2D2D7',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 15,
  },
  zoomButtonText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000000',
    marginTop: -2,
  },
  simReadyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  simUsersCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFEEEF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  simReadyBannerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#E53935',
    lineHeight: 22,
  },
  simReadyBannerSubtitle: {
    fontSize: 12,
    color: '#6E6E73',
    lineHeight: 16,
    marginTop: 2,
  },
  simConvoyTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6E6E73',
    marginBottom: 8,
    marginTop: 10,
    paddingHorizontal: 4,
  },
  simConvoyGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 18,
  },
  simConvoyCardSmall: {
    width: '23%',
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    paddingVertical: 12,
    paddingHorizontal: 6,
    alignItems: 'center',
    position: 'relative',
  },
  simCardCheckBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
  },
  simCardTruckCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFEEEF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  simCardPlate: {
    fontSize: 9,
    fontWeight: '800',
    color: '#1D1D1F',
  },
  simCardDriverName: {
    fontSize: 8,
    color: '#6E6E73',
    marginTop: 1,
  },
  simCardStatus: {
    fontSize: 8,
    fontWeight: '700',
    color: '#E53935',
    marginTop: 2,
  },
  simSliderContainer: {
    width: '100%',
    height: 60,
    backgroundColor: '#E53935',
    borderRadius: 30,
    position: 'relative',
    justifyContent: 'center',
    paddingHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  simSliderTrack: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  simSliderText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  simSliderHandle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  simSliderHelperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  simSliderHelperText: {
    fontSize: 11,
    color: '#6E6E73',
    fontWeight: '500',
  },
  simFormationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 14,
    paddingHorizontal: 4,
  },
  simFormationColumn: {
    alignItems: 'center',
  },
  simFormationLabel: {
    fontSize: 9,
    color: '#8E8E93',
    marginBottom: 4,
    fontWeight: '600',
    textAlign: 'center',
  },
  simFormationItem: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
  simFormationItemActive: {
    borderWidth: 1,
    borderColor: '#E53935',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    paddingVertical: 5,
    paddingHorizontal: 7,
    marginTop: -3,
    shadowColor: '#E53935',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  simFormationIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  simFormationIconContainerActive: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFEEEF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  simFormationPlate: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#1D1D1F',
  },
  simFormationDriver: {
    fontSize: 8,
    color: '#8E8E93',
    marginTop: 1,
  },
  simFormationConnector: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: -2,
    minWidth: 28,
  },
  simFormationDistance: {
    fontSize: 8,
    color: '#1D1D1F',
    fontWeight: '700',
    marginBottom: 2,
    textAlign: 'center',
  },
  simDashedLine: {
    width: '100%',
    height: 1,
    borderWidth: 0.5,
    borderColor: '#D2D2D7',
    borderStyle: 'dashed',
  },
  simHealthCard: {
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    padding: 10,
    marginBottom: 14,
    width: '100%',
  },
  simHealthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  simHealthItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  simHealthIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFEEEF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  simHealthLabel: {
    fontSize: 8,
    color: '#8E8E93',
    fontWeight: '600',
  },
  simHealthValue: {
    fontSize: 11,
    fontWeight: '800',
    color: '#E53935',
  },
  simHealthFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
    paddingTop: 8,
    marginTop: 2,
  },
  simHealthFooterText: {
    fontSize: 9.5,
    color: '#6E6E73',
    marginLeft: 6,
    fontWeight: '500',
  },
  simActiveActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 4,
  },
  simRequestStopBtn: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E53935',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: '#FFFFFF',
  },
  simPauseCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E53935',
    justifyContent: 'center',
    alignItems: 'center',
  },
  simActionBtnTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1D1D1F',
  },
  simActionBtnSub: {
    fontSize: 8,
    color: '#8E8E93',
  },
  simEndTripBtnDisabled: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 10,
    opacity: 0.8,
  },
  simStopCircleDisabled: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E5E5EA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  simActionBtnTitleDisabled: {
    fontSize: 11,
    fontWeight: '800',
    color: '#8E8E93',
  },
  simActionBtnSubDisabled: {
    fontSize: 8,
    color: '#AEAEB2',
  },
});
