import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Animated,
  Keyboard,
  TouchableHighlight,
  Platform,
} from 'react-native';
import {
  Locate,
  Satellite,
  Map as MapIcon,
  Search,
  SlidersHorizontal,
  X,
  Truck,
  Delete,
  ChevronDown,
  Share2,
} from 'lucide-react-native';
import { OperationsHeader } from '../../components/operations/OperationsHeader';
import MapView, { Marker, PROVIDER_DEFAULT } from '../../components/MapView';
import { useOperationsStore, VehicleStatus } from '../../store/useOperationsStore';
import { useFocusEffect } from '@react-navigation/native';
import Svg, { Path, Circle, Line, Text as SvgText } from 'react-native-svg';

const ASAS_RED = '#C0392B';
const GREEN = '#22c55e'; // Vibrant Green
const RED = '#ef4444'; // Vibrant Red
const ORANGE = '#f97316'; // Orange
const GREY = '#9ca3af'; // Gray
const DARK_GREY = '#1f2937'; // Dark Gray

// Default region — Tanzania/Zambia corridor
const DEFAULT_REGION = {
  latitude: -7.5,
  longitude: 36.5,
  latitudeDelta: 12,
  longitudeDelta: 12,
};

const getStatusColor = (statusOrVehicle: VehicleStatus | any) => {
  if (typeof statusOrVehicle === 'object' && statusOrVehicle !== null) {
    const v = statusOrVehicle;
    if (v.status === 'offline') {
      const diffHours = Math.round((Date.now() - v.lastStatusChange) / 3600000);
      return diffHours >= 24 ? DARK_GREY : GREY;
    }
    if (v.status === 'moving') return GREEN;
    if (v.status === 'idle-stopped' || v.status === 'idle-parked') return ORANGE;
    return RED;
  }

  const status = statusOrVehicle;
  switch (status) {
    case 'moving': return GREEN;
    case 'stopped':
    case 'parked': return RED;
    case 'idle-stopped':
    case 'idle-parked': return ORANGE;
    case 'offline': return GREY;
    default: return GREY;
  }
};

const getVehicleStatusDetails = (v: any) => {
  if (v.status === 'offline') {
    const diffHours = Math.round((Date.now() - v.lastStatusChange) / 3600000);
    if (diffHours >= 24) {
      return {
        type: 'not-working' as const,
        color: DARK_GREY,
      };
    } else {
      return {
        type: 'not-online' as const,
        color: GREY,
      };
    }
  }

  if (v.status === 'moving') {
    return {
      type: 'running' as const,
      color: GREEN,
    };
  }

  if (v.status === 'idle-stopped' || v.status === 'idle-parked') {
    return {
      type: 'idle' as const,
      color: ORANGE,
    };
  }

  return {
    type: 'stopped' as const,
    color: RED,
  };
};




// Keypad layout constants
const ALPHA_ROWS = [
  ['Q','W','E','R','T','Y','U','I','O','P'],
  ['A','S','D','F','G','H','J','K','L'],
  ['Z','X','C','V','B','N','M'],
];
const NUM_ROW = ['1','2','3','4','5','6','7','8','9','0'];
const QUICK_CHIPS = [
  { label: 'MOVING', filter: 'moving' },
  { label: 'PARKED', filter: 'parked' },
  { label: 'OFFLINE', filter: 'offline' },
  { label: 'IDLE', filter: 'idle-stopped' },
];

const PulseLoader = () => {
  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.4,
          duration: 800,
          useNativeDriver: true,
        })
      ])
    ).start();
  }, [pulseAnim]);

  return (
    <View style={styles.pulseLoaderContainer} pointerEvents="none">
      <Animated.Text style={[styles.pulseLoaderText, { opacity: pulseAnim }]}>
        ASAS
      </Animated.Text>
    </View>
  );
};

const FlashingCursor = () => {
  const anim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 0, duration: 400, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 1, duration: 400, useNativeDriver: true })
      ])
    ).start();
  }, [anim]);
  return (
    <Animated.Text style={{ opacity: anim, color: '#C0392B', fontSize: 16, fontWeight: '600', marginLeft: 1 }}>|</Animated.Text>
  );
};

export const MapScreen = ({ onNavigateToSettings }: { onNavigateToSettings?: () => void }) => {
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState('moving');
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSatellite, setIsSatellite] = useState(false);
  const [keypadVisible, setKeypadVisible] = useState(false);
  const keypadAnim = useRef(new Animated.Value(0)).current;
  const searchInputRef = useRef<TextInput>(null);
  const mapRef = useRef<MapView>(null);

  const { vehicles, updateTelemetry, lastSyncTime, isLoading } = useOperationsStore();
  const [hasInitialFit, setHasInitialFit] = useState(false);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      moving: 0,
      parked: 0,
      'idle-stopped': 0,
      offline: 0,
      all: vehicles.length,
    };
    vehicles.forEach(v => {
      if (counts[v.status] !== undefined) {
        counts[v.status]++;
      }
    });
    return counts;
  }, [vehicles]);

  // Auto-Zoom / Bounds Fit upon initial data load
  useEffect(() => {
    if (vehicles.length > 0 && mapRef.current && !hasInitialFit) {
      const coordinates = vehicles
        .filter(v => v.latitude !== 0 && v.longitude !== 0 && !isNaN(v.latitude) && !isNaN(v.longitude))
        .map(v => ({ latitude: v.latitude, longitude: v.longitude }));

      if (coordinates.length > 0) {
        const timer = setTimeout(() => {
          mapRef.current?.fitToCoordinates(coordinates, {
            edgePadding: { top: 80, right: 50, bottom: 80, left: 50 },
            animated: true,
          });
        }, 800);
        setHasInitialFit(true);
        return () => clearTimeout(timer);
      }
    }
  }, [vehicles, hasInitialFit]);

  // Reset initial fit to allow auto-zoom on subsequent manual/sync reloads, only if no vehicle is selected
  useEffect(() => {
    if (lastSyncTime && selectedVehicle === null) {
      setHasInitialFit(false);
    }
  }, [lastSyncTime, selectedVehicle]);

  // Bootstrap and telemetry polling are centralized in OperationsNavigator
  // Only do a targeted telemetry fetch when selecting a specific vehicle

  // ===== KEYPAD MANAGEMENT =====
  const openKeypad = useCallback(() => {
    // Dismiss any native keyboard that might have opened
    Keyboard.dismiss();
    setKeypadVisible(true);
    Animated.spring(keypadAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 80,
      friction: 12,
    }).start();
  }, [keypadAnim]);

  const closeKeypad = useCallback(() => {
    Animated.timing(keypadAnim, {
      toValue: 0,
      duration: 180,
      useNativeDriver: true,
    }).start(() => setKeypadVisible(false));
  }, [keypadAnim]);

  useFocusEffect(
    useCallback(() => {
      return () => {
        // Run when screen loses focus
        closeKeypad();
      };
    }, [closeKeypad])
  );

  const handleKeyPress = useCallback((key: string) => {
    setSearchQuery(prev => prev + key);
  }, []);

  const handleBackspace = useCallback(() => {
    setSearchQuery(prev => prev.slice(0, -1));
  }, []);

  const handleSpace = useCallback(() => {
    setSearchQuery(prev => prev + ' ');
  }, []);


  const handleQuickChip = useCallback((filter: string) => {
    setActiveFilter(prev => prev === filter ? 'all' : filter);
    setSearchQuery('');
    closeKeypad();
  }, [closeKeypad]);

  // Memoized search and filter logic
  const filteredVehicles = useMemo(() => vehicles.filter(v => {
    // 1. Filter by Status Pill
    if (activeFilter !== 'all') {
      if (activeFilter === 'moving' && v.status !== 'moving') return false;
      if (activeFilter === 'stopped' && v.status !== 'stopped') return false;
      if (activeFilter === 'parked' && v.status !== 'parked') return false;
      if (activeFilter === 'idle-stopped' && v.status !== 'idle-stopped') return false;
      if (activeFilter === 'idle-parked' && v.status !== 'idle-parked') return false;
      if (activeFilter === 'offline' && v.status !== 'offline') return false;
    }

    // 2. Filter by Search Query
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      const matchName = v.id.toLowerCase().includes(q);
      const matchUnit = v.unitId.toString().includes(q);
      const matchLocation = v.locationName.toLowerCase().includes(q);
      return matchName || matchUnit || matchLocation;
    }

    return true;
  }), [vehicles, activeFilter, searchQuery]);

  const selected = vehicles.find(v => v.id === selectedVehicle);

  const [tracksMarkers, setTracksMarkers] = useState(true);

  // Dynamic tracksViewChanges hook to allow custom marker layout calculations on mount/update
  useEffect(() => {
    setTracksMarkers(true);
    const timer = setTimeout(() => {
      setTracksMarkers(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, [filteredVehicles.length, selectedVehicle]);

  const handleVehicleSelect = useCallback((vehicleId: string) => {
    if (selectedVehicle === vehicleId) {
      setSelectedVehicle(null);
      mapRef.current?.animateToRegion(DEFAULT_REGION, 600);
    } else {
      setSelectedVehicle(vehicleId);
      // Force update telemetry instantly for this specific select action
      updateTelemetry(vehicleId);
      const v = vehicles.find(veh => veh.id === vehicleId);
      if (v) {
        setSearchQuery(v.id);
        mapRef.current?.animateToRegion(
          {
            latitude: v.latitude,
            longitude: v.longitude,
            latitudeDelta: 0.2,
            longitudeDelta: 0.2,
          },
          800
        );
      }
    }
    // Close keypad when a vehicle is selected
    closeKeypad();
  }, [selectedVehicle, vehicles, updateTelemetry, closeKeypad]);

  const handleSearchSubmit = useCallback(() => {
    // If there's a single match, select it
    if (filteredVehicles.length === 1) {
      handleVehicleSelect(filteredVehicles[0].id);
    }
    closeKeypad();
  }, [filteredVehicles, handleVehicleSelect, closeKeypad]);

  return (
    <View style={styles.screen}>
      <OperationsHeader onNavigateToSettings={onNavigateToSettings} />

      {/* MAP AREA */}
      <View style={styles.mapContainer}>
        {(isLoading || vehicles.length === 0) && (
          <PulseLoader />
        )}

        {/* Top-Left Status Filter Dropdown */}
        <View style={styles.topStatusDropdownContainer} pointerEvents="box-none">
          {(() => {
            const selectedVehicleObj = selectedVehicle ? vehicles.find(v => v.id === selectedVehicle) : null;
            const effectiveStatus = selectedVehicleObj ? selectedVehicleObj.status : activeFilter;
            const displayStatus = effectiveStatus === 'idle-stopped' ? 'IDLE' : effectiveStatus.toUpperCase();

            return (
              <>
                <TouchableOpacity 
                  style={styles.statusDropdownButton}
                  onPress={() => {
                    if (selectedVehicleObj) {
                      setSelectedVehicle(null);
                      setSearchQuery('');
                      mapRef.current?.animateToRegion(DEFAULT_REGION, 600);
                    } else {
                      setStatusDropdownOpen(!statusDropdownOpen);
                    }
                  }}
                  activeOpacity={0.8}
                >
                  <Svg width={16} height={16} viewBox="0 0 24 24">
                    <Path d="M12 2L22 20L12 17L2 20L12 2Z" fill="#FFFFFF" />
                    <Path d="M12 4L19.5 18.5L12 16L4.5 18.5L12 4Z" fill={
                      effectiveStatus === 'moving' ? GREEN :
                      effectiveStatus === 'offline' ? RED :
                      effectiveStatus === 'parked' ? ORANGE :
                      effectiveStatus === 'idle-stopped' ? GREY : DARK_GREY
                    } />
                  </Svg>
                  <Text style={styles.statusDropdownButtonText}>
                    {selectedVehicleObj 
                      ? `${displayStatus} ( ${selectedVehicleObj.id} )` 
                      : `${displayStatus} (${statusCounts[activeFilter]})`}
                  </Text>
                  {selectedVehicleObj ? (
                    <X size={16} color="#261816" style={{ marginLeft: 2 }} />
                  ) : (
                    <ChevronDown size={16} color="#261816" style={{ marginLeft: 2 }} />
                  )}
                </TouchableOpacity>
                
                {statusDropdownOpen && !selectedVehicleObj && (
                  <View style={styles.statusDropdownMenu}>
                    {['moving', 'parked', 'idle-stopped', 'offline', 'all'].map(status => (
                      <TouchableOpacity 
                        key={status}
                        style={styles.statusDropdownItem}
                        onPress={() => {
                          setActiveFilter(status);
                          setStatusDropdownOpen(false);
                        }}
                      >
                        <View style={[styles.statusIndicatorDot, { 
                          backgroundColor: 
                            status === 'moving' ? GREEN :
                            status === 'offline' ? RED :
                            status === 'parked' ? ORANGE :
                            status === 'idle-stopped' ? GREY : DARK_GREY
                        }]} />
                        <Text style={styles.statusDropdownText}>
                          {status === 'idle-stopped' ? 'IDLE' : status.toUpperCase()} ({statusCounts[status]})
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </>
            );
          })()}
        </View>
        
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_DEFAULT}
          initialRegion={DEFAULT_REGION}
          mapType={isSatellite ? 'satellite' : 'standard'}
          showsUserLocation={false}
          showsCompass={true}
          showsScale={true}
          rotateEnabled={true}
          pitchEnabled={true}
          onPress={() => closeKeypad()}
        >
          {filteredVehicles
            .filter(v => {
              if (selectedVehicle && v.id !== selectedVehicle) return false;
              return v.latitude !== 0 && v.longitude !== 0 && !isNaN(v.latitude) && !isNaN(v.longitude);
            })
            .map((v) => {
              const isSelected = selectedVehicle === v.id;
              const statusDetails = getVehicleStatusDetails(v);
              const size = isSelected ? 32 : 22;

              return (
                <Marker
                  key={v.trackerId}
                  identifier={v.id}
                  coordinate={{
                    latitude: v.latitude,
                    longitude: v.longitude,
                  }}
                  title={v.id}
                  description={`${Math.round(v.speed)} km/h • ${v.locationName}`}
                  onPress={() => handleVehicleSelect(v.id)}
                  tracksViewChanges={tracksMarkers}
                >
                  <View
                    collapsable={false}
                    style={[
                      styles.markerShadowContainer,
                      isSelected && styles.markerSelectedHighlight,
                    ]}
                  >
                    <View
                      style={
                        statusDetails.type === 'running'
                          ? { transform: [{ rotate: `${v.heading || 0}deg` }] }
                          : undefined
                      }
                    >
                      <Svg width={size} height={size} viewBox="0 0 24 24">
                        {statusDetails.type === 'running' ? (
                          // Running (Moving): green directional pointer/arrow
                          <Path
                            d="M12 2L4 20L12 16L20 20L12 2Z"
                            fill="#22c55e"
                            stroke="white"
                            strokeWidth={isSelected ? 1.8 : 1.2}
                          />
                        ) : statusDetails.type === 'stopped' ? (
                          // Stopped: solid red circle with a white border
                          <Circle
                            cx="12"
                            cy="12"
                            r="8"
                            fill="#ef4444"
                            stroke="white"
                            strokeWidth="2"
                          />
                        ) : statusDetails.type === 'idle' ? (
                          // Idle: orange circle with a concentric white inner ring
                          <>
                            <Circle
                              cx="12"
                              cy="12"
                              r="9"
                              fill="#f97316"
                              stroke="white"
                              strokeWidth="2"
                            />
                            <Circle
                              cx="12"
                              cy="12"
                              r="5"
                              fill="none"
                              stroke="white"
                              strokeWidth="1.5"
                            />
                          </>
                        ) : statusDetails.type === 'not-online' ? (
                          // Not Online: white circle with a gray border and gray "X" cross in the center
                          <>
                            <Circle
                              cx="12"
                              cy="12"
                              r="8"
                              fill="white"
                              stroke="#9ca3af"
                              strokeWidth="2"
                            />
                            <Line
                              x1="8"
                              y1="8"
                              x2="16"
                              y2="16"
                              stroke="#9ca3af"
                              strokeWidth="2"
                            />
                            <Line
                              x1="16"
                              y1="8"
                              x2="8"
                              y2="16"
                              stroke="#9ca3af"
                              strokeWidth="2"
                            />
                          </>
                        ) : (
                          // Not Working: dark circle with white border and white exclamation mark "!" in the center
                          <>
                            <Circle
                              cx="12"
                              cy="12"
                              r="9"
                              fill="#1f2937"
                              stroke="white"
                              strokeWidth="2"
                            />
                            <SvgText
                              x="12"
                              y="16.5"
                              fill="white"
                              fontSize="13"
                              fontWeight="bold"
                              textAnchor="middle"
                            >
                              !
                            </SvgText>
                          </>
                        )}
                      </Svg>
                    </View>
                  </View>
                </Marker>
              );
            })}
        </MapView>

        {/* Floating Map Controls */}
        <View style={styles.mapControls}>
          <TouchableOpacity
            style={styles.mapControlBtn}
            onPress={() => {
              mapRef.current?.animateToRegion(DEFAULT_REGION, 600);
              setSelectedVehicle(null);
            }}
          >
            <Locate size={18} color="#261816" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.mapControlBtn,
              isSatellite && styles.mapControlBtnActive,
            ]}
            onPress={() => setIsSatellite(!isSatellite)}
          >
            {isSatellite ? (
              <MapIcon size={18} color="#FFFFFF" />
            ) : (
              <Satellite size={18} color="#261816" />
            )}
          </TouchableOpacity>

          {/* Share Button (only visible when a vehicle is selected) */}
          {selectedVehicle && (
            <TouchableOpacity
              style={styles.mapControlBtn}
              onPress={() => {
                // Share functionality to be implemented
              }}
            >
              <Share2 size={18} color="#261816" />
            </TouchableOpacity>
          )}
        </View>

      </View>

      {/* ===== FLOATING OVERLAYS (above bottom nav) ===== */}
      
      {/* Search Bar + Keypad Wrapper */}
      <Animated.View 
        pointerEvents="box-none"
        style={{
          position: 'absolute',
          bottom: -260, // Keypad is in flow (~320px tall). This puts the search bar at ~60px above bottom.
          left: 16,
          right: 16,
          justifyContent: 'flex-end',
          transform: [{
            translateY: keypadAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, -320], // slide up by 320px to show keypad below it
            }),
          }],
        }}
      >
        {/* Vehicle Info Card — shown when a vehicle is selected & keypad closed */}
        {selected && !keypadVisible && (
          <View style={[styles.vehicleInfoCard, { marginBottom: 12 }]}>
            {/* Top row: icon + name + dismiss */}
            <View style={styles.infoCardHeader}>
              <View style={styles.infoCardIconWrap}>
                <Truck size={18} color={ASAS_RED} />
              </View>
              <View style={styles.infoCardTitleGroup}>
                <Text style={styles.infoCardName} numberOfLines={1}>{selected.id}</Text>
                <Text style={styles.infoCardSubtitle}>Live Status</Text>
              </View>
              <TouchableOpacity
                style={styles.infoCardDismiss}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                onPress={() => {
                  setSelectedVehicle(null);
                  setSearchQuery('');
                  mapRef.current?.animateToRegion(DEFAULT_REGION, 600);
                }}
              >
                <X size={16} color="#8D706C" />
              </TouchableOpacity>
            </View>

            {/* Telemetry row */}
            <View style={styles.infoCardTelemetry}>
              {/* Status */}
              <View style={styles.telemetryBlock}>
                <View style={styles.telemetryStatusRow}>
                  <View style={[
                    styles.telemetryDot,
                    { backgroundColor: getStatusColor(selected) }
                  ]} />
                  <Text style={[
                    styles.telemetryStatusText,
                    { color: getStatusColor(selected) }
                  ]}>
                    {selected.status === 'moving' ? 'Moving'
                      : selected.status === 'idle-stopped' || selected.status === 'idle-parked' ? 'Idle'
                      : selected.status === 'offline' ? 'Offline'
                      : selected.status === 'parked' ? 'Parked'
                      : 'Stopped'}
                  </Text>
                </View>
                <Text style={styles.telemetryCoordsText}>
                  Lat: {selected.latitude.toFixed(4)}, Lng: {selected.longitude.toFixed(4)}
                </Text>
              </View>

              {/* Speed */}
              <View style={styles.telemetryMetric}>
                <Text style={styles.telemetryMetricValue}>{Math.round(selected.speed)}</Text>
                <Text style={styles.telemetryMetricUnit}>km/h</Text>
                <Text style={styles.telemetryMetricLabel}>Speed</Text>
              </View>

              {/* Last Update */}
              <View style={styles.telemetryMetric}>
                <Text style={styles.telemetryMetricValue}>{selected.statusDurationText === 'Just now' ? 'Just now' : selected.statusDurationText}</Text>
                <Text style={styles.telemetryMetricLabel}>Last Update</Text>
              </View>

              {/* Online Status */}
              <View style={styles.telemetryMetric}>
                <Text style={[
                  styles.telemetryOnlineStatus,
                  { color: selected.status === 'offline' ? RED : GREEN }
                ]}>
                  {selected.status === 'offline' ? 'Offline' : 'Online'}
                </Text>
                <Text style={styles.telemetryMetricLabel}>Status</Text>
              </View>
            </View>
          </View>
        )}
        {/* Search Results Dropdown */}
        {keypadVisible && searchQuery.length > 0 && (
            <View style={[styles.searchResultsDropdown, { marginBottom: 8 }]}>
              <ScrollView 
                style={styles.searchResultsScroll}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                {filteredVehicles.length > 0 ? (
                  filteredVehicles.slice(0, 5).map((v) => (
                    <TouchableOpacity
                      key={v.trackerId}
                      style={styles.searchResultItem}
                      onPress={() => {
                        handleVehicleSelect(v.id);
                        setSearchQuery('');
                      }}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.searchResultDot, { backgroundColor: getStatusColor(v) }]} />
                      <View style={styles.searchResultInfo}>
                        <Text style={styles.searchResultName} numberOfLines={1}>{v.id}</Text>
                        <Text style={styles.searchResultMeta}>
                          {v.status === 'moving' ? 'Moving' : v.status === 'offline' ? 'Offline' : v.status === 'parked' ? 'Parked' : 'Stopped'}
                          {' • '}{Math.round(v.speed)} km/h
                        </Text>
                      </View>
                      <Text style={styles.searchResultSpeed}>{Math.round(v.speed)} km/h</Text>
                    </TouchableOpacity>
                  ))
                ) : (
                  <View style={{ padding: 16, alignItems: 'center' }}>
                    <Text style={{ color: '#8D706C', fontSize: 14 }}>No vehicle matches "{searchQuery}"</Text>
                  </View>
                )}
              </ScrollView>
            </View>
          )}

          {/* Floating Search Bar */}
          <TouchableOpacity
            activeOpacity={1}
            style={[
              styles.floatingSearchBar,
              keypadVisible && styles.floatingSearchBarActive,
            ]}
            onPress={openKeypad}
          >
            <Search size={18} color={keypadVisible ? ASAS_RED : '#8D706C'} style={styles.floatingSearchIcon} />
            
            {keypadVisible ? (
              <View style={[styles.floatingSearchInput, { flexDirection: 'row', alignItems: 'center' }]}>
                <Text style={{ fontSize: 14, fontWeight: '500', color: '#261816' }}>
                  {searchQuery || <Text style={{ color: '#A08884' }}>Search vehicle, tracker, convoy…</Text>}
                </Text>
                <FlashingCursor />
              </View>
            ) : (
              <TextInput
                ref={searchInputRef}
                placeholder="Search vehicle, tracker, convoy…"
                placeholderTextColor="#A08884"
                value={searchQuery}
                editable={false}
                pointerEvents="none"
                style={styles.floatingSearchInput}
              />
            )}

            {searchQuery.length > 0 ? (
              <TouchableOpacity
                onPress={() => {
                  setSearchQuery('');
                  closeKeypad();
                }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={styles.floatingSearchAction}
              >
                <Search size={16} color="#8D706C" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => closeKeypad()}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={styles.floatingSearchAction}
              >
                <Search size={16} color="#8D706C" />
              </TouchableOpacity>
            )}
          </TouchableOpacity>

          {/* ===== CUSTOM OPERATIONAL KEYPAD ===== */}
          <Animated.View
            pointerEvents={keypadVisible ? 'auto' : 'none'}
            style={[
              styles.keypadContainer,
              {
                marginTop: 12,
                opacity: keypadAnim,
                transform: [{
                  translateY: keypadAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [300, 0],
                  }),
                }],
              },
            ]}
          >
            {/* Catch all stray touches so they don't hit the map */}
            <TouchableOpacity activeOpacity={1} style={StyleSheet.absoluteFill} />

            {/* Quick filter chips */}
            <View style={styles.keypadChipsRow}>
              {QUICK_CHIPS.map((chip) => (
                <TouchableOpacity
                  key={chip.filter}
                  style={[
                    styles.keypadChip,
                    activeFilter === chip.filter && styles.keypadChipActive,
                  ]}
                  onPress={() => handleQuickChip(chip.filter)}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.keypadChipDot,
                    { backgroundColor: chip.filter === 'moving' ? GREEN
                      : chip.filter === 'offline' ? RED
                      : ORANGE },
                  ]} />
                  <Text style={[
                    styles.keypadChipText,
                    activeFilter === chip.filter && styles.keypadChipTextActive,
                  ]}>{chip.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Number row */}
            <View style={styles.keypadRow}>
              {NUM_ROW.map((key) => (
                <TouchableHighlight
                  key={key}
                  style={styles.keypadKey}
                  underlayColor="#E1BFB9"
                  onPress={() => handleKeyPress(key)}
                >
                  <Text style={styles.keypadKeyText}>{key}</Text>
                </TouchableHighlight>
              ))}
            </View>

            {/* Alpha rows */}
            {ALPHA_ROWS.map((row, rowIdx) => (
              <View key={rowIdx} style={styles.keypadRow}>
                {rowIdx === 2 && <View style={styles.keypadEdgeSpacer} />}
                {row.map((key) => (
                  <TouchableHighlight
                    key={key}
                    style={styles.keypadKey}
                    underlayColor="#E1BFB9"
                    onPress={() => handleKeyPress(key)}
                  >
                    <Text style={styles.keypadKeyText}>{key}</Text>
                  </TouchableHighlight>
                ))}
                {rowIdx === 2 && (
                  <TouchableHighlight
                    style={[styles.keypadKey, styles.keypadKeyWide]}
                    underlayColor="#E1BFB9"
                    onPress={handleBackspace}
                  >
                    <Delete size={18} color="#59413D" />
                  </TouchableHighlight>
                )}
              </View>
            ))}

            {/* Bottom action row: Cancel / Space / Search */}
            <View style={styles.keypadActionRow}>
              <TouchableHighlight
                style={styles.keypadCancelBtn}
                underlayColor="#E1BFB9"
                onPress={closeKeypad}
              >
                <Text style={styles.keypadCancelText}>Cancel</Text>
              </TouchableHighlight>

              <TouchableHighlight
                style={styles.keypadSpaceBtn}
                underlayColor="#E1BFB9"
                onPress={handleSpace}
              >
                <Text style={styles.keypadSpaceText}>SPACE</Text>
              </TouchableHighlight>

              <TouchableOpacity
                style={styles.keypadSearchBtn}
                onPress={handleSearchSubmit}
                activeOpacity={0.7}
              >
                <Search size={16} color="#FFFFFF" />
                <Text style={styles.keypadSearchText}>GO</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Animated.View>
      </View>
    );
  };

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFF8F6',
  },

  // ---- Map Container ----
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  pulseLoaderContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10, // Ensure it sits above the map
  },
  pulseLoaderText: {
    fontSize: 48,
    fontWeight: '900',
    color: ASAS_RED,
    letterSpacing: 2,
    textShadowColor: 'rgba(255,255,255,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 10,
  },
  topStatusDropdownContainer: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 20,
    alignItems: 'flex-start',
  },
  statusDropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    gap: 8,
  },
  statusDropdownButtonText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#261816',
    letterSpacing: 0.5,
  },
  statusDropdownMenu: {
    marginTop: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    width: 140,
  },
  statusDropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  statusIndicatorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusDropdownText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#59413D',
  },
  map: {
    flex: 1,
  },
  markerShadowContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  markerSelectedHighlight: {
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 20,
    padding: 4,
    shadowOpacity: 0.45,
    shadowRadius: 6,
    elevation: 8,
  },

  // ---- Map Controls ----
  mapControls: {
    position: 'absolute',
    right: 16,
    top: 16,
    gap: 8,
  },
  mapControlBtn: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  mapControlBtnActive: {
    backgroundColor: ASAS_RED,
  },

  // ===== FLOATING OVERLAY CONTAINER =====
  floatingContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 14 : 10,
    gap: 10,
  },

  // ===== VEHICLE INFO CARD =====
  vehicleInfoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(192, 57, 43, 0.08)',
  },
  infoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoCardIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#FFF0EE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  infoCardTitleGroup: {
    flex: 1,
  },
  infoCardName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#261816',
    letterSpacing: -0.2,
  },
  infoCardSubtitle: {
    fontSize: 11,
    fontWeight: '500',
    color: '#8D706C',
    marginTop: 1,
  },
  infoCardDismiss: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F7F7F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoCardTelemetry: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F2EDEC',
    paddingTop: 12,
  },
  telemetryBlock: {
    flex: 1.4,
  },
  telemetryStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 4,
  },
  telemetryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  telemetryStatusText: {
    fontSize: 13,
    fontWeight: '800',
  },
  telemetryCoordsText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#8D706C',
    marginTop: 2,
  },
  telemetryMetric: {
    alignItems: 'center',
    flex: 0.8,
  },
  telemetryMetricValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#261816',
  },
  telemetryMetricUnit: {
    fontSize: 9,
    fontWeight: '600',
    color: '#8D706C',
    marginTop: -1,
  },
  telemetryMetricLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: '#A69996',
    marginTop: 3,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  telemetryOnlineStatus: {
    fontSize: 13,
    fontWeight: '800',
  },

  // ===== SEARCH RESULTS DROPDOWN =====
  searchResultsDropdown: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    maxHeight: 240,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  searchResultsScroll: {
    paddingVertical: 6,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  searchResultDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  searchResultInfo: {
    flex: 1,
  },
  searchResultName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#261816',
  },
  searchResultMeta: {
    fontSize: 11,
    fontWeight: '500',
    color: '#8D706C',
    marginTop: 1,
  },
  searchResultSpeed: {
    fontSize: 13,
    fontWeight: '700',
    color: '#59413D',
  },

  // ===== FLOATING SEARCH BAR =====
  floatingSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    height: 50,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(192, 57, 43, 0.06)',
  },
  floatingSearchIcon: {
    marginRight: 10,
  },
  floatingSearchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#261816',
    padding: 0,
  },
  floatingSearchAction: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F8F3F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },

  floatingSearchBarActive: {
    borderColor: ASAS_RED,
    borderWidth: 1.5,
    shadowOpacity: 0.15,
  },

  // ===== CUSTOM OPERATIONAL KEYPAD =====
  keypadContainer: {
    left: 0,
    right: 0,
    marginTop: 10, // Small gap below search bar
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 6 : 8,
    paddingHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
  },

  // Quick filter chips
  keypadChipsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 8,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F2EDEC',
    marginBottom: 8,
  },
  keypadChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F0EF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    gap: 5,
  },
  keypadChipActive: {
    backgroundColor: ASAS_RED,
  },
  keypadChipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  keypadChipText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#59413D',
    letterSpacing: 0.5,
  },
  keypadChipTextActive: {
    color: '#FFFFFF',
  },

  // Key grid
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
    marginBottom: 4,
  },
  keypadKey: {
    width: 32,
    height: 38,
    borderRadius: 6,
    backgroundColor: '#F5F0EF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keypadKeyText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#261816',
  },
  keypadKeyWide: {
    width: 44,
    backgroundColor: '#EDE5E3',
  },
  keypadEdgeSpacer: {
    width: 16,
  },

  // Action row
  keypadActionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
    paddingHorizontal: 8,
  },
  keypadCancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F5F0EF',
  },
  keypadCancelText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8D706C',
  },
  keypadSpaceBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F5F0EF',
    alignItems: 'center',
  },
  keypadSpaceText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#59413D',
    letterSpacing: 1,
  },
  keypadSearchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: ASAS_RED,
  },
  keypadSearchText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },

  // ---- Utility Layouts ----
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: '#8D706C',
    fontWeight: '500',
  },
});
