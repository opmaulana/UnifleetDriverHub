import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Modal,
  Dimensions,
  Animated,
  Platform,
  TouchableHighlight,
  TextInput,
} from 'react-native';
import {
  AlertTriangle,
  Gauge,
  Moon,
  Clock,
  Radio,
  MapPin,
  Filter,
  ChevronDown,
  ChevronRight,
  Bell,
  BellOff,
  Shield,
  TrendingUp,
  X,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Trash2,
  User,
  Check,
  Map,
  Truck,
} from 'lucide-react-native';
import { OperationsHeader } from '../../components/operations/OperationsHeader';
import { useOperationsStore, AlertSeverity, ComputedAlert } from '../../store/useOperationsStore';
import { useStore } from '../../store/useStore';
import MapView, { Marker, Polyline } from '../../components/MapView';

const ASAS_RED = '#C0392B';
const CRITICAL = '#BA1A1A';
const WARNING = '#E67E22';
const INFO = '#005875';
const GREY = '#7F8C8D';

const ALPHA_ROWS = [
  ['Q','W','E','R','T','Y','U','I','O','P'],
  ['A','S','D','F','G','H','J','K','L'],
  ['Z','X','C','V','B','N','M'],
];
const NUM_ROW = ['1','2','3','4','5','6','7','8','9','0'];

const getSeverityColor = (severity: AlertSeverity) => {
  switch (severity) {
    case 'critical': return CRITICAL;
    case 'high': return WARNING;
    case 'medium': return INFO;
    case 'low': return GREY;
  }
};

const getSeverityLabel = (severity: AlertSeverity) => {
  switch (severity) {
    case 'critical': return 'CRITICAL';
    case 'high': return 'HIGH';
    case 'medium': return 'MEDIUM';
    case 'low': return 'LOW';
  }
};

const getAlertIcon = (title: string) => {
  const lower = title.toLowerCase();
  if (lower.includes('speed')) {
    return <Gauge size={18} color="#FFFFFF" />;
  } else if (lower.includes('night') || lower.includes('driving')) {
    return <Moon size={18} color="#FFFFFF" />;
  } else if (lower.includes('idle') || lower.includes('idling')) {
    return <Clock size={18} color="#FFFFFF" />;
  } else if (lower.includes('offline') || lower.includes('battery') || lower.includes('signal')) {
    return <Radio size={18} color="#FFFFFF" />;
  }
  return <AlertTriangle size={18} color="#FFFFFF" />;
};

// ============================================================
// Memoized Alert Card Component
// ============================================================
const AlertCard = React.memo(({
  alert,
  isExpanded,
  onToggleExpand,
  onAcknowledge,
  onViewOnMap,
  isAcknowledged,
}: {
  alert: ComputedAlert;
  isExpanded: boolean;
  onToggleExpand: (id: string) => void;
  onAcknowledge: (alert: ComputedAlert) => void;
  onViewOnMap: (alert: ComputedAlert) => void;
  isAcknowledged: boolean;
}) => {
  return (
    <TouchableOpacity
      style={[styles.alertCard, isAcknowledged && styles.alertCardAcknowledged]}
      onPress={() => onToggleExpand(alert.id)}
      activeOpacity={0.7}
    >
      {/* Severity bar */}
      <View style={[styles.alertSeverityBar, { backgroundColor: isAcknowledged ? '#27AE60' : getSeverityColor(alert.severity) }]} />

      <View style={styles.alertBody}>
        {/* Top row */}
        <View style={styles.alertTopRow}>
          <View style={[styles.alertIconCircle, { backgroundColor: isAcknowledged ? '#27AE60' : getSeverityColor(alert.severity) }]}>
            {isAcknowledged ? <Check size={18} color="#FFFFFF" /> : getAlertIcon(alert.title)}
          </View>
          <View style={styles.alertMainInfo}>
            <Text style={[styles.alertTitle, isAcknowledged && styles.textLineThrough]}>{alert.title}</Text>
            {alert.vehicle && (
              <Text style={styles.alertVehicle}>{alert.vehicle}</Text>
            )}
          </View>
          <View style={[
            styles.severityBadge, 
            { backgroundColor: (isAcknowledged ? '#27AE60' : getSeverityColor(alert.severity)) + '20' }
          ]}>
            <Text style={[styles.severityBadgeText, { color: isAcknowledged ? '#27AE60' : getSeverityColor(alert.severity) }]}>
              {isAcknowledged ? 'RESOLVED' : getSeverityLabel(alert.severity)}
            </Text>
          </View>
        </View>

        {/* Description */}
        {alert.description && (
          <Text style={[styles.alertDescription, isAcknowledged && styles.textMuted]}>{alert.description}</Text>
        )}

        {/* Metadata row */}
        <View style={styles.alertMeta}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>LOCATION</Text>
            <Text style={[styles.metaValue, isAcknowledged && styles.textMuted]}>{alert.location}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>
              {alert.duration ? 'DURATION' : 'TIMESTAMP'}
            </Text>
            <Text style={[styles.metaValue, isAcknowledged && styles.textMuted]}>
              {alert.duration || alert.timestamp}
            </Text>
          </View>
        </View>

        {/* Expanded details */}
        {isExpanded && !isAcknowledged && (
          <View style={styles.expandedSection}>
            <View style={styles.expandedDivider} />
            {alert.threshold && (
              <View style={styles.expandedRow}>
                <Text style={styles.expandedLabel}>SPEED LIMIT</Text>
                <Text style={styles.expandedValue}>{alert.threshold}</Text>
              </View>
            )}
            <View style={styles.expandedActions}>
              <TouchableOpacity 
                style={styles.actionBtn}
                onPress={() => onAcknowledge(alert)}
              >
                <Text style={styles.actionBtnText}>Acknowledge</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionBtn, styles.actionBtnOutline]}
                onPress={() => onViewOnMap(alert)}
              >
                <Text style={[styles.actionBtnText, styles.actionBtnOutlineText]}>
                  View on Map
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
});

// ============================================================
// MAIN ALERTS SCREEN
// ============================================================
export const AlertsScreen = ({ onNavigateToSettings }: { onNavigateToSettings?: () => void }) => {
  const [activeFilter, setActiveFilter] = useState<'all' | AlertSeverity>('all');
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null);

  // Modals & Form States
  const [resolvedIds, setResolvedIds] = useState<string[]>([]);
  const [ackModalOpen, setAckModalOpen] = useState(false);
  const [playbackModalOpen, setPlaybackModalOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<ComputedAlert | null>(null);

  // Acknowledgement form inputs
  const { user } = useStore();
  const managerName = user?.name || 'Operations Manager';
  const [ackReason, setAckReason] = useState<'overtaking' | 'breaking_sop' | 'custom' | null>(null);
  const [customReasonText, setCustomReasonText] = useState('');
  const [keypadVisible, setKeypadVisible] = useState(false);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);

  // Animated states
  const keypadAnim = useRef(new Animated.Value(0)).current;

  // Playback Simulation States
  const [playbackPlaying, setPlaybackPlaying] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0); // 0 to 100
  const [playbackSpeed, setPlaybackSpeed] = useState(0);
  const [playbackTimeStr, setPlaybackTimeStr] = useState('');
  const playbackTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Snapped road coordinates state
  const [roadCoords, setRoadCoords] = useState<{ latitude: number, longitude: number }[]>([]);
  const [loadingRoute, setLoadingRoute] = useState(false);

  const { alerts, isLoading } = useOperationsStore();

  // OSRM road-snapping route fetch
  useEffect(() => {
    if (playbackModalOpen && selectedAlert?.lat !== undefined && selectedAlert?.lng !== undefined && selectedAlert?.end_lat !== undefined && selectedAlert?.end_lng !== undefined) {
      const startLat = selectedAlert.lat;
      const startLng = selectedAlert.lng;
      const endLat = selectedAlert.end_lat;
      const endLng = selectedAlert.end_lng;
      const fetchRoadSnappedRoute = async () => {
        setLoadingRoute(true);
        try {
          const url = `http://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`;
          const res = await fetch(url);
          if (res.ok) {
            const data = await res.json();
            if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
              const points = data.routes[0].geometry.coordinates.map((c: any) => ({
                latitude: c[1],
                longitude: c[0]
              }));
              // Downsample points if there are too many (e.g. > 150) to ensure high-performance smooth animations
              if (points.length > 150) {
                const step = Math.ceil(points.length / 150);
                const downsampled = [];
                for (let i = 0; i < points.length; i += step) {
                  downsampled.push(points[i]);
                }
                // Ensure the final point is included
                if (downsampled[downsampled.length - 1] !== points[points.length - 1]) {
                  downsampled.push(points[points.length - 1]);
                }
                setRoadCoords(downsampled);
              } else {
                setRoadCoords(points);
              }
              setLoadingRoute(false);
              return;
            }
          }
        } catch (err) {
          console.warn('Failed to fetch road snapped route from OSRM:', err);
        }
        
        // Fallback to straight line if OSRM fails
        setRoadCoords([
          { latitude: startLat, longitude: startLng },
          { latitude: endLat, longitude: endLng }
        ]);
        setLoadingRoute(false);
      };
      
      fetchRoadSnappedRoute();
    } else {
      setRoadCoords([]);
    }
  }, [playbackModalOpen, selectedAlert]);

  // Filter lists: Filter out resolved ones if tab filter is active, or keep in All as green
  const activeAlerts = useMemo(() => {
    return alerts;
  }, [alerts]);

  // Memoize filter counts
  const filterCounts = useMemo(() => {
    const unacknowledged = activeAlerts.filter(a => !resolvedIds.includes(a.id));
    return {
      all: activeAlerts.length,
      critical: unacknowledged.filter(a => a.severity === 'critical').length,
      high: unacknowledged.filter(a => a.severity === 'high').length,
      medium: unacknowledged.filter(a => a.severity === 'medium').length,
      resolved: resolvedIds.length,
    };
  }, [activeAlerts, resolvedIds]);

  // Memoize filtered alerts list
  const filteredAlerts = useMemo(() => {
    if (activeFilter === 'all') {
      return activeAlerts;
    }
    // Show remaining unresolved matching filter
    return activeAlerts.filter(
      (a) => a.severity === activeFilter && !resolvedIds.includes(a.id)
    );
  }, [activeAlerts, activeFilter, resolvedIds]);

  // Color coded corridor path segments memo
  const tripSegments = useMemo(() => {
    if (!selectedAlert) return [];
    const peakSpeed = selectedAlert.max_speed || 88;
    
    if (roadCoords.length === 0) {
      if (selectedAlert.lat !== undefined && selectedAlert.lng !== undefined && selectedAlert.end_lat !== undefined && selectedAlert.end_lng !== undefined) {
        const speedColor = peakSpeed >= 90 ? '#E74C3C' : (peakSpeed > 80 ? '#E67E22' : '#2C3E50');
        return [{
          key: 'fallback-segment',
          coordinates: [
            { latitude: selectedAlert.lat, longitude: selectedAlert.lng },
            { latitude: selectedAlert.end_lat, longitude: selectedAlert.end_lng }
          ],
          strokeColor: speedColor
        }];
      }
      return [];
    }

    const getSpeedAtProgress = (p: number, maxSpd: number) => {
      if (p < 30) {
        return (p / 30) * maxSpd;
      } else if (p < 75) {
        return maxSpd - 3 + Math.sin(p) * 4;
      } else {
        return maxSpd * ((100 - p) / 25);
      }
    };

    const getSpeedColor = (speed: number) => {
      if (speed >= 90) return '#E74C3C'; // Red
      if (speed > 80) return '#E67E22';  // Orange
      return '#2C3E50';                  // Black/Dark Slate
    };

    const polylines: { key: string; coordinates: { latitude: number; longitude: number }[]; strokeColor: string }[] = [];
    let currentPolyline: typeof polylines[0] | null = null;

    for (let i = 0; i < roadCoords.length - 1; i++) {
      const progress = (i / (roadCoords.length - 1)) * 100;
      const speed = getSpeedAtProgress(progress, peakSpeed);
      const color = getSpeedColor(speed);

      if (currentPolyline && currentPolyline.strokeColor === color) {
        currentPolyline.coordinates.push(roadCoords[i + 1]);
      } else {
        currentPolyline = {
          key: `poly-group-${i}-${color}`,
          coordinates: [roadCoords[i], roadCoords[i + 1]],
          strokeColor: color
        };
        polylines.push(currentPolyline);
      }
    }

    return polylines;
  }, [roadCoords, selectedAlert]);

  // Expand Toggle
  const handleToggleExpand = useCallback((id: string) => {
    setExpandedAlert(prev => prev === id ? null : id);
  }, []);

  // Map coordinate interpolation helper for playback
  const getInterpolatedCoord = (startLat: number, startLng: number, endLat: number, endLng: number, progress: number) => {
    const p = progress / 100;
    const lat = startLat + (endLat - startLat) * p;
    const lng = startLng + (endLng - startLng) * p;
    return { latitude: lat, longitude: lng };
  };

  // central trigger for play/pause simulation
  const togglePlay = () => {
    if (playbackPlaying) {
      if (playbackTimer.current) clearInterval(playbackTimer.current);
      setPlaybackPlaying(false);
    } else {
      setPlaybackPlaying(true);
      const startSecs = selectedAlert?.start_time_raw ? new Date(selectedAlert.start_time_raw).getTime() : Date.now();
      
      playbackTimer.current = setInterval(() => {
        setPlaybackProgress(prev => {
          if (prev >= 100) {
            if (playbackTimer.current) clearInterval(playbackTimer.current);
            setPlaybackPlaying(false);
            return 100;
          }
          const nextProgress = prev + 2.5;

          // Dynamically compute speed profiles (accelerating, speeding zones, then decelerating)
          const peakSpeed = selectedAlert?.max_speed || 88;
          let calculatedSpeed = 0;
          if (nextProgress < 30) {
            calculatedSpeed = (nextProgress / 30) * peakSpeed;
          } else if (nextProgress >= 30 && nextProgress < 75) {
            // High speed zone: slight fluctuation
            calculatedSpeed = peakSpeed - 3 + Math.sin(nextProgress) * 4;
          } else {
            // Decelerating
            calculatedSpeed = peakSpeed * ((100 - nextProgress) / 25);
          }
          setPlaybackSpeed(Math.round(calculatedSpeed));

          // Time ticker offsets
          const currentOffsetTime = new Date(startSecs + (nextProgress / 100) * (selectedAlert?.duration ? parseFloat(selectedAlert.duration) * 60000 : 180000));
          setPlaybackTimeStr(currentOffsetTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));

          return nextProgress;
        });
      }, 150);
    }
  };

  const resetPlayback = () => {
    if (playbackTimer.current) clearInterval(playbackTimer.current);
    setPlaybackPlaying(false);
    setPlaybackProgress(0);
    setPlaybackSpeed(0);
    if (selectedAlert?.start_time_raw) {
      setPlaybackTimeStr(new Date(selectedAlert.start_time_raw).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } else {
      setPlaybackTimeStr('00:00:00');
    }
  };

  useEffect(() => {
    return () => {
      if (playbackTimer.current) clearInterval(playbackTimer.current);
    };
  }, []);

  // ===== CUSTOM KEYBOARD ACTIONS =====
  const openKeypad = () => {
    setKeypadVisible(true);
    Animated.spring(keypadAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
      friction: 12,
    }).start();
  };

  const closeKeypad = () => {
    Animated.timing(keypadAnim, {
      toValue: 0,
      duration: 180,
      useNativeDriver: true,
    }).start(() => setKeypadVisible(false));
  };

  const handleKeyPress = (key: string) => {
    setCustomReasonText(prev => prev + key);
  };

  const handleBackspace = () => {
    setCustomReasonText(prev => prev.slice(0, -1));
  };

  const handleSpace = () => {
    setCustomReasonText(prev => prev + ' ');
  };

  const handleDone = () => {
    closeKeypad();
  };

  // Submit Acknowledgement
  const submitAck = () => {
    if (!selectedAlert) return;
    
    // Animate a premium checklist tick overlay
    setShowSuccessOverlay(true);
    
    setTimeout(() => {
      // Add alert ID to resolved list
      setResolvedIds(prev => [...prev, selectedAlert.id]);
      
      // Close overlay and modal
      setShowSuccessOverlay(false);
      setAckModalOpen(false);
      setSelectedAlert(null);
      setAckReason(null);
      setCustomReasonText('');
      setExpandedAlert(null);
    }, 1500);
  };

  // Callbacks from cards
  const triggerAcknowledge = useCallback((alert: ComputedAlert) => {
    setSelectedAlert(alert);
    setAckReason(null);
    setCustomReasonText('');
    setAckModalOpen(true);
  }, []);

  const triggerViewOnMap = useCallback((alert: ComputedAlert) => {
    setSelectedAlert(alert);
    setPlaybackProgress(0);
    setPlaybackSpeed(0);
    setPlaybackPlaying(false);
    
    if (alert.start_time_raw) {
      setPlaybackTimeStr(new Date(alert.start_time_raw).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } else {
      setPlaybackTimeStr('00:00:00');
    }
    
    setPlaybackModalOpen(true);
  }, []);

  const keyExtractor = useCallback((item: ComputedAlert) => item.id, []);

  const renderItem = useCallback(({ item }: { item: ComputedAlert }) => (
    <AlertCard
      alert={item}
      isExpanded={expandedAlert === item.id}
      onToggleExpand={handleToggleExpand}
      onAcknowledge={triggerAcknowledge}
      onViewOnMap={triggerViewOnMap}
      isAcknowledged={resolvedIds.includes(item.id)}
    />
  ), [expandedAlert, handleToggleExpand, triggerAcknowledge, triggerViewOnMap, resolvedIds]);

  const filterPills = useMemo(() => [
    { id: 'all' as const, label: 'All', count: filterCounts.all },
    { id: 'critical' as const, label: 'Critical', count: filterCounts.critical },
    { id: 'high' as const, label: 'High', count: filterCounts.high },
  ], [filterCounts]);

  const ListHeader = useMemo(() => (
    <View>
      <View style={styles.titleSection}>
        <View>
          <Text style={styles.pageTitle}>Operational Alerts</Text>
          <Text style={styles.pageSubtitle}>
            Live exception monitoring across all operational sectors.
          </Text>
        </View>
        <TouchableOpacity style={styles.muteButton}>
          <Bell size={18} color="#8D706C" />
        </TouchableOpacity>
      </View>

      {isLoading && (
        <View style={{ paddingBottom: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="small" color={ASAS_RED} />
          <Text style={{ fontSize: 11, color: '#8D706C', marginLeft: 6 }}>Syncing telemetry stream...</Text>
        </View>
      )}

      {/* Activity Summary Card */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Critical alerts today</Text>
            <Text style={[styles.summaryNumber, { color: CRITICAL }]}>{filterCounts.critical}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total alerts</Text>
            <Text style={styles.summaryNumber}>{filterCounts.all}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Resolved</Text>
            <Text style={[styles.summaryNumber, { color: '#27AE60' }]}>{filterCounts.resolved}</Text>
          </View>
        </View>
      </View>

      {/* Area Hotspot Notice */}
      <View style={styles.hotspotBanner}>
        <Shield size={16} color={WARNING} />
        <Text style={styles.hotspotText}>
          Attention: Night driving restrictions are currently in effect for Sectors 1-5.
        </Text>
      </View>

      {/* Filter Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {filterPills.map((f) => (
          <TouchableOpacity
            key={f.id}
            style={[styles.filterPill, activeFilter === f.id && styles.filterPillActive]}
            onPress={() => setActiveFilter(f.id)}
          >
            {f.id !== 'all' && (
              <View style={[styles.filterDot, { backgroundColor: getSeverityColor(f.id as AlertSeverity) }]} />
            )}
            <Text style={[styles.filterPillText, activeFilter === f.id && styles.filterPillTextActive]}>
              {f.label} ({f.count})
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  ), [isLoading, filterCounts, filterPills, activeFilter]);

  const ListEmpty = useMemo(() => (
    <View style={styles.emptyCardContainer}>
      <Text style={styles.emptyCardText}>No active alerts found for the selected filter.</Text>
    </View>
  ), []);

  // Compute interpolated coordinate for playing marker
  const vehiclePlayCoord = useMemo(() => {
    if (roadCoords.length > 0) {
      const index = Math.min(
        Math.floor((playbackProgress / 100) * (roadCoords.length - 1)),
        roadCoords.length - 1
      );
      return roadCoords[index];
    }
    if (selectedAlert?.lat && selectedAlert?.lng && selectedAlert?.end_lat && selectedAlert?.end_lng) {
      return getInterpolatedCoord(
        selectedAlert.lat,
        selectedAlert.lng,
        selectedAlert.end_lat,
        selectedAlert.end_lng,
        playbackProgress
      );
    }
    return null;
  }, [selectedAlert, playbackProgress, roadCoords]);

  // Center coordinate of play corridor
  const playbackMapCenter = useMemo(() => {
    if (selectedAlert?.lat && selectedAlert?.lng && selectedAlert?.end_lat && selectedAlert?.end_lng) {
      return {
        latitude: (selectedAlert.lat + selectedAlert.end_lat) / 2,
        longitude: (selectedAlert.lng + selectedAlert.end_lng) / 2,
      };
    }
    return { latitude: -7.5, longitude: 36.5 };
  }, [selectedAlert]);

  return (
    <View style={styles.screen}>
      <OperationsHeader onNavigateToSettings={onNavigateToSettings} />

      <FlatList
        data={filteredAlerts}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        initialNumToRender={8}
        maxToRenderPerBatch={6}
        windowSize={5}
        removeClippedSubviews={true}
      />

      {/* ============================================================
          MODAL 1: ACKNOWLEDGEMENT FORM (WITH MAP & CUSTOM KEYPAD)
          ============================================================ */}
      <Modal
        visible={ackModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          if (keypadVisible) closeKeypad();
          else setAckModalOpen(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, keypadVisible && styles.modalCardRaised]}>
            
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderTitleWrap}>
                <AlertTriangle size={20} color={ASAS_RED} style={{ marginRight: 8 }} />
                <Text style={styles.modalTitle}>Acknowledge Violation</Text>
              </View>
              <TouchableOpacity 
                style={styles.modalCloseBtn}
                onPress={() => setAckModalOpen(false)}
              >
                <X size={20} color="#8D706C" />
              </TouchableOpacity>
            </View>

            <ScrollView 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalScrollContent}
              keyboardShouldPersistTaps="handled"
            >
              {/* Alert Info Summary */}
              <View style={styles.modalAlertInfoBanner}>
                <Text style={styles.modalAlertTruckName}>{selectedAlert?.vehicle}</Text>
                <Text style={styles.modalAlertDetails}>
                  {selectedAlert?.title} on {selectedAlert?.timestamp}
                </Text>
              </View>

              {/* 1. Small Map Showing Location */}
              <Text style={styles.formSectionLabel}>VIOLATION LOCATION MAP</Text>
              <View style={styles.smallMapContainer}>
                {selectedAlert?.lat && selectedAlert?.lng ? (
                  <MapView
                    style={styles.smallMap}
                    initialRegion={{
                      latitude: selectedAlert.lat,
                      longitude: selectedAlert.lng,
                      latitudeDelta: 0.05,
                      longitudeDelta: 0.05,
                    }}
                    scrollEnabled={false}
                    zoomEnabled={false}
                  >
                    <Marker
                      coordinate={{ latitude: selectedAlert.lat, longitude: selectedAlert.lng }}
                      title="Violation Breach"
                    >
                      <View style={styles.mapBreachMarker}>
                        <Gauge size={14} color="#FFFFFF" />
                      </View>
                    </Marker>
                  </MapView>
                ) : (
                  <View style={styles.mapLoadingPlaceholder}>
                    <Text style={styles.placeholderText}>GPS coordinates unavailable for this segment</Text>
                  </View>
                )}
              </View>

              {/* 2. Operations Manager Name (Auto-filled & grayed out) */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Operations Manager (Logged In)</Text>
                <View style={styles.disabledInputContainer}>
                  <User size={16} color="#8D706C" style={{ marginRight: 8 }} />
                  <Text style={styles.disabledInputText}>{managerName}</Text>
                </View>
              </View>

              {/* 3. Reason selection chips */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Select Violation Reason</Text>
                <View style={styles.chipsRow}>
                  <TouchableOpacity
                    style={[
                      styles.reasonChip,
                      ackReason === 'overtaking' && styles.reasonChipActive
                    ]}
                    onPress={() => {
                      setAckReason('overtaking');
                      setCustomReasonText('Driver reported safe overtaking maneuver, but exceeded zone limit temporarily.');
                      if (keypadVisible) closeKeypad();
                    }}
                  >
                    <Text style={[
                      styles.reasonChipText,
                      ackReason === 'overtaking' && styles.reasonChipTextActive
                    ]}>Overtaking</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.reasonChip,
                      ackReason === 'breaking_sop' && styles.reasonChipActive
                    ]}
                    onPress={() => {
                      setAckReason('breaking_sop');
                      setCustomReasonText('Immediate SOP safety breach. Fleet dispatcher warning issued to driver.');
                      if (keypadVisible) closeKeypad();
                    }}
                  >
                    <Text style={[
                      styles.reasonChipText,
                      ackReason === 'breaking_sop' && styles.reasonChipTextActive
                    ]}>Breaking SOP</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.reasonChip,
                      ackReason === 'custom' && styles.reasonChipActive
                    ]}
                    onPress={() => {
                      setAckReason('custom');
                      setCustomReasonText('');
                      openKeypad();
                    }}
                  >
                    <Text style={[
                      styles.reasonChipText,
                      ackReason === 'custom' && styles.reasonChipTextActive
                    ]}>Custom Text</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* 4. Text Display Input */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Reason Notes</Text>
                <TouchableOpacity 
                  style={[styles.reasonTextBox, keypadVisible && styles.reasonTextBoxFocused]}
                  onPress={() => {
                    setAckReason('custom');
                    openKeypad();
                  }}
                  activeOpacity={0.9}
                >
                  <Text style={[styles.reasonTextValue, customReasonText.length === 0 && styles.reasonTextPlaceholder]}>
                    {customReasonText || 'Tap here to enter custom explanation...'}
                  </Text>
                  {keypadVisible && <Text style={styles.customKeypadCursor}>|</Text>}
                </TouchableOpacity>
              </View>

              {/* 5. Submit Button */}
              <TouchableOpacity
                style={[
                  styles.submitBtn,
                  (!customReasonText || customReasonText.trim().length === 0) && styles.submitBtnDisabled
                ]}
                disabled={!customReasonText || customReasonText.trim().length === 0}
                onPress={submitAck}
              >
                <CheckCircle2 size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.submitBtnText}>Confirm Acknowledgement</Text>
              </TouchableOpacity>

            </ScrollView>

            {/* Premium Checklist tick Success Overlay */}
            {showSuccessOverlay && (
              <View style={styles.successOverlay}>
                <CheckCircle2 size={64} color="#27AE60" />
                <Text style={styles.successText}>Acknowledged Successfully</Text>
                <Text style={styles.successSubtext}>Violation cleared & resolved count updated.</Text>
              </View>
            )}

            {/* Sliding Virtual Keypad Panel */}
            {keypadVisible && (
              <Animated.View style={[
                styles.virtualKeyboardContainer,
                { transform: [{ translateY: keypadAnim.interpolate({ inputRange: [0, 1], outputRange: [300, 0] }) }] }
              ]}>
                
                {/* Keyboard Header */}
                <View style={styles.keypadHeader}>
                  <Text style={styles.keypadHeaderText} numberOfLines={1}>
                    Typed: {customReasonText || 'Awaiting entry...'}
                  </Text>
                  <TouchableOpacity onPress={handleDone} style={styles.keypadDoneBtn}>
                    <Text style={styles.keypadDoneBtnText}>Done</Text>
                  </TouchableOpacity>
                </View>

                {/* Keyboard Layout */}
                <View style={styles.keypadBody}>
                  {/* Numbers */}
                  <View style={styles.keypadRow}>
                    {NUM_ROW.map((n) => (
                      <TouchableHighlight
                        key={n}
                        style={styles.keypadKey}
                        underlayColor="#E1BFB9"
                        onPress={() => handleKeyPress(n)}
                      >
                        <Text style={styles.keypadKeyText}>{n}</Text>
                      </TouchableHighlight>
                    ))}
                  </View>

                  {/* QWERTY Row 1 */}
                  {ALPHA_ROWS.map((row, rowIdx) => (
                    <View key={rowIdx} style={styles.keypadRow}>
                      {rowIdx === 2 && <View style={{ width: 12 }} />}
                      {row.map((k) => (
                        <TouchableHighlight
                          key={k}
                          style={styles.keypadKey}
                          underlayColor="#E1BFB9"
                          onPress={() => handleKeyPress(k)}
                        >
                          <Text style={styles.keypadKeyText}>{k}</Text>
                        </TouchableHighlight>
                      ))}
                      {rowIdx === 2 && (
                        <TouchableHighlight
                          style={[styles.keypadKey, { flex: 1.4, backgroundColor: '#E1BFB9' }]}
                          underlayColor="#C5A49E"
                          onPress={handleBackspace}
                        >
                          <Text style={[styles.keypadKeyText, { fontSize: 11 }]}>DEL</Text>
                        </TouchableHighlight>
                      )}
                    </View>
                  ))}

                  {/* Actions (Space / Done) */}
                  <View style={styles.keypadRow}>
                    <TouchableHighlight
                      style={[styles.keypadKey, { flex: 4, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F7DDD9' }]}
                      underlayColor="#E1BFB9"
                      onPress={handleSpace}
                    >
                      <Text style={styles.keypadKeyText}>SPACE</Text>
                    </TouchableHighlight>
                  </View>
                </View>

              </Animated.View>
            )}

          </View>
        </View>
      </Modal>

      {/* ============================================================
          MODAL 2: PLAYBACK SIMULATION MAP MODAL
          ============================================================ */}
      <Modal
        visible={playbackModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          if (playbackTimer.current) clearInterval(playbackTimer.current);
          setPlaybackModalOpen(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.playbackModalCard}>
            
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderTitleWrap}>
                <Map size={20} color={ASAS_RED} style={{ marginRight: 8 }} />
                <Text style={styles.modalTitle}>Violation Playback Analysis</Text>
              </View>
              <TouchableOpacity 
                style={styles.modalCloseBtn}
                onPress={() => {
                  if (playbackTimer.current) clearInterval(playbackTimer.current);
                  setPlaybackModalOpen(false);
                }}
              >
                <X size={20} color="#8D706C" />
              </TouchableOpacity>
            </View>

            {/* Playback Map */}
            <View style={styles.playbackMapContainer}>
              {loadingRoute && (
                <View style={styles.snappingOverlay}>
                  <ActivityIndicator size="small" color={ASAS_RED} />
                  <Text style={styles.snappingText}>Snapping corridor to actual highway roads...</Text>
                </View>
              )}
              {selectedAlert?.lat && selectedAlert?.lng && selectedAlert?.end_lat && selectedAlert?.end_lng ? (
                <MapView
                  style={styles.playbackMap}
                  initialRegion={{
                    latitude: playbackMapCenter.latitude,
                    longitude: playbackMapCenter.longitude,
                    latitudeDelta: Math.abs(selectedAlert.lat - selectedAlert.end_lat) * 2.5 || 0.15,
                    longitudeDelta: Math.abs(selectedAlert.lng - selectedAlert.end_lng) * 2.5 || 0.15,
                  }}
                >
                  {/* Start Point Marker */}
                  <Marker
                    coordinate={{ latitude: selectedAlert.lat, longitude: selectedAlert.lng }}
                    title="Breach Point"
                    description="Overspeed threshold triggered"
                  >
                    <View style={styles.playbackStartMarker}>
                      <AlertTriangle size={12} color="#FFFFFF" />
                    </View>
                  </Marker>

                  {/* End Point Marker */}
                  <Marker
                    coordinate={{ latitude: selectedAlert.end_lat, longitude: selectedAlert.end_lng }}
                    title="Destination Point"
                    description="Trip segment endpoint"
                  >
                    <View style={styles.playbackEndMarker}>
                      <Check size={12} color="#FFFFFF" />
                    </View>
                  </Marker>

                  {/* Simulated Corridor Path (Color Coded Segments) */}
                  {tripSegments.map((segment) => (
                    <Polyline
                      key={segment.key}
                      coordinates={segment.coordinates}
                      strokeColor={segment.strokeColor}
                      strokeWidth={4}
                    />
                  ))}

                  {/* Playing Vehicle Marker */}
                  {vehiclePlayCoord && (
                    <Marker
                      coordinate={vehiclePlayCoord}
                      anchor={{ x: 0.5, y: 0.5 }}
                      zIndex={15}
                    >
                      <View style={[
                        styles.playbackVehicleMarker,
                        playbackSpeed > 80 && styles.playbackVehicleMarkerViolating,
                        playbackSpeed >= 90 && styles.playbackVehicleMarkerExtreme
                      ]}>
                        <Truck size={14} color="#FFFFFF" />
                      </View>
                    </Marker>
                  )}
                </MapView>
              ) : (
                <View style={styles.mapLoadingPlaceholder}>
                  <Text style={styles.placeholderText}>GPS Path coordinates unavailable</Text>
                </View>
              )}
            </View>

            {/* Playback Controls Panel */}
            <View style={styles.playbackControlsPanel}>
              
              {/* Telemetry HUD display */}
              <View style={styles.playbackHUD}>
                <View style={styles.hudBlock}>
                  <Text style={styles.hudLabel}>VEHICLE</Text>
                  <Text style={styles.hudValue} numberOfLines={1}>{selectedAlert?.vehicle}</Text>
                </View>
                
                {/* Speed indicator with flashing warning colors */}
                <View style={[
                  styles.hudBlock, 
                  styles.hudSpeedBlock,
                  playbackSpeed > 80 && styles.hudSpeedWarning,
                  playbackSpeed >= 90 && styles.hudSpeedCritical
                ]}>
                  <Text style={[styles.hudLabel, playbackSpeed > 80 && { color: '#FFFFFF' }]}>LIVE SPEED</Text>
                  <Text style={[styles.hudValue, styles.hudSpeedValue, playbackSpeed > 80 && { color: '#FFFFFF' }]}>
                    {playbackSpeed} <Text style={{ fontSize: 11, fontWeight: '700' }}>km/h</Text>
                  </Text>
                </View>

                <View style={styles.hudBlock}>
                  <Text style={styles.hudLabel}>TIMESTAMP</Text>
                  <Text style={styles.hudValue}>{playbackTimeStr || 'Awaiting...'}</Text>
                </View>
              </View>

              {/* Progress Slider Bar */}
              <View style={styles.playbackProgressBarContainer}>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${playbackProgress}%` }]} />
                </View>
                <Text style={styles.progressPercentText}>{Math.round(playbackProgress)}%</Text>
              </View>

              {/* Control Action Buttons */}
              <View style={styles.playbackActionRow}>
                <TouchableOpacity 
                  style={[styles.playbackCtrlBtn, styles.ctrlReset]} 
                  onPress={resetPlayback}
                >
                  <RotateCcw size={18} color="#59413D" />
                  <Text style={styles.ctrlBtnText}>Reset</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[
                    styles.playbackCtrlBtn, 
                    styles.ctrlPlay,
                    playbackPlaying && styles.ctrlPause
                  ]} 
                  onPress={togglePlay}
                >
                  {playbackPlaying ? (
                    <>
                      <Pause size={18} color="#FFFFFF" />
                      <Text style={styles.ctrlPlayText}>Pause</Text>
                    </>
                  ) : (
                    <>
                      <Play size={18} color="#FFFFFF" fill="#FFFFFF" />
                      <Text style={styles.ctrlPlayText}>Play Corridor</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>

            </View>

          </View>
        </View>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFF8F6',
  },

  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },

  // ---- Title ----
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#261816',
  },
  pageSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#59413D',
    marginTop: 4,
    maxWidth: 280,
  },
  muteButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  // ---- Summary Card ----
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: 'row',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#8D706C',
    marginBottom: 4,
    textAlign: 'center',
  },
  summaryNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: '#261816',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: '#E1BFB9',
    marginVertical: 4,
  },

  // ---- Hotspot ----
  hotspotBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFF0EE',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: WARNING,
    marginBottom: 16,
  },
  hotspotText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#261816',
    lineHeight: 18,
  },

  // ---- Filter ----
  filterRow: {
    gap: 8,
    paddingBottom: 16,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F7DDD9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
  },
  filterPillActive: {
    backgroundColor: ASAS_RED,
  },
  filterDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#59413D',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
  },

  // ---- Alert Cards ----
  alertCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  alertCardAcknowledged: {
    backgroundColor: '#F9FAF9',
    borderColor: '#E8F5E9',
    borderWidth: 1,
    opacity: 0.8,
  },
  alertSeverityBar: {
    width: 4,
  },
  alertBody: {
    flex: 1,
    padding: 14,
  },
  alertTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  alertMainInfo: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#261816',
  },
  textLineThrough: {
    textDecorationLine: 'line-through',
    color: '#7F8C8D',
  },
  alertVehicle: {
    fontSize: 12,
    fontWeight: '600',
    color: ASAS_RED,
    marginTop: 1,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 100,
  },
  severityBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  alertDescription: {
    fontSize: 13,
    fontWeight: '500',
    color: '#59413D',
    marginTop: 8,
    lineHeight: 18,
  },
  textMuted: {
    color: '#7F8C8D',
  },
  alertMeta: {
    flexDirection: 'row',
    gap: 24,
    marginTop: 10,
  },
  metaItem: {},
  metaLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#8D706C',
    letterSpacing: 1,
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#261816',
  },

  // ---- Expanded ----
  expandedSection: {
    marginTop: 10,
  },
  expandedDivider: {
    height: 1,
    backgroundColor: '#F7DDD9',
    marginBottom: 10,
  },
  expandedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  expandedLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8D706C',
    letterSpacing: 0.5,
  },
  expandedValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#261816',
  },
  expandedActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    height: 40,
    backgroundColor: ASAS_RED,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  actionBtnOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: ASAS_RED,
  },
  actionBtnOutlineText: {
    color: ASAS_RED,
  },
  emptyCardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F7DDD9',
    borderStyle: 'dashed',
    marginTop: 16,
  },
  emptyCardText: {
    fontSize: 14,
    color: '#8D706C',
    fontWeight: '500',
    textAlign: 'center',
  },

  // ============================================================
  // MODAL STYLING
  // ============================================================
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 10,
    position: 'relative',
  },
  modalCardRaised: {
    transform: [{ translateY: -20 }],
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F7DDD9',
    backgroundColor: '#FFF8F6',
  },
  modalHeaderTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#261816',
    letterSpacing: 0.1,
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalScrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  modalAlertInfoBanner: {
    backgroundColor: '#FFF0EE',
    borderWidth: 1,
    borderColor: 'rgba(192, 57, 43, 0.15)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  modalAlertTruckName: {
    fontSize: 14,
    fontWeight: '800',
    color: ASAS_RED,
  },
  modalAlertDetails: {
    fontSize: 12,
    color: '#59413D',
    fontWeight: '600',
    marginTop: 2,
  },
  formSectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8D706C',
    letterSpacing: 1,
    marginBottom: 8,
  },

  // ---- Map in Modal ----
  smallMapContainer: {
    height: 140,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F7DDD9',
  },
  smallMap: {
    flex: 1,
  },
  mapBreachMarker: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: ASAS_RED,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  mapLoadingPlaceholder: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  placeholderText: {
    fontSize: 12,
    color: '#8D706C',
    fontWeight: '500',
    textAlign: 'center',
  },

  // ---- Form Elements ----
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#261816',
    marginBottom: 8,
  },
  disabledInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
  },
  disabledInputText: {
    fontSize: 14,
    color: '#59413D',
    fontWeight: '700',
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  reasonChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F7DDD9',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  reasonChipActive: {
    backgroundColor: ASAS_RED,
  },
  reasonChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#59413D',
  },
  reasonChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  reasonTextBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F7DDD9',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 64,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
  },
  reasonTextBoxFocused: {
    borderColor: ASAS_RED,
    borderWidth: 1.5,
  },
  reasonTextValue: {
    fontSize: 13,
    color: '#261816',
    fontWeight: '600',
    lineHeight: 18,
    flex: 1,
  },
  reasonTextPlaceholder: {
    color: '#8D706C',
  },
  customKeypadCursor: {
    color: ASAS_RED,
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 2,
  },
  submitBtn: {
    flexDirection: 'row',
    backgroundColor: '#27AE60',
    borderRadius: 10,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  submitBtnDisabled: {
    backgroundColor: '#BDC3C7',
    opacity: 0.6,
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // ---- Virtual Keypad Styling ----
  virtualKeyboardContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF8F6',
    borderTopWidth: 1,
    borderTopColor: '#F7DDD9',
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
    zIndex: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
  },
  keypadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F7DDD9',
    backgroundColor: '#FFF0EE',
  },
  keypadHeaderText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: '#261816',
    marginRight: 10,
  },
  keypadDoneBtn: {
    backgroundColor: ASAS_RED,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  keypadDoneBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  keypadBody: {
    padding: 8,
    gap: 6,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  keypadKey: {
    flex: 1,
    height: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  keypadKeyText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#261816',
  },

  // ---- Success Checklist Tick Overlay ----
  successOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    gap: 12,
  },
  successText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#27AE60',
    marginTop: 8,
  },
  successSubtext: {
    fontSize: 12,
    color: '#8D706C',
    fontWeight: '600',
  },

  // ============================================================
  // MODAL 2: PLAYBACK STYLING
  // ============================================================
  playbackModalCard: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    height: '80%',
    maxHeight: 650,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 10,
  },
  playbackMapContainer: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    borderBottomWidth: 1,
    borderBottomColor: '#F2EDEC',
    position: 'relative',
  },
  snappingOverlay: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    zIndex: 20,
    borderWidth: 1,
    borderColor: '#F7DDD9',
  },
  snappingText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#C0392B',
  },
  playbackMap: {
    flex: 1,
  },
  playbackStartMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: WARNING,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playbackEndMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#27AE60',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playbackVehicleMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3498DB',
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 6,
  },
  playbackVehicleMarkerViolating: {
    backgroundColor: WARNING,
  },
  playbackVehicleMarkerExtreme: {
    backgroundColor: CRITICAL,
  },

  // ---- Control Panel ----
  playbackControlsPanel: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F7DDD9',
  },
  playbackHUD: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  hudBlock: {
    flex: 1,
    backgroundColor: '#FFF8F6',
    borderRadius: 10,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F7DDD9',
  },
  hudSpeedBlock: {
    flex: 1.2,
  },
  hudSpeedWarning: {
    backgroundColor: WARNING,
    borderColor: WARNING,
  },
  hudSpeedCritical: {
    backgroundColor: CRITICAL,
    borderColor: CRITICAL,
  },
  hudLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: '#8D706C',
    letterSpacing: 0.8,
  },
  hudValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#261816',
    marginTop: 4,
  },
  hudSpeedValue: {
    fontSize: 17,
  },
  playbackProgressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  progressBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: ASAS_RED,
    borderRadius: 4,
  },
  progressPercentText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#261816',
    minWidth: 32,
    textAlign: 'right',
  },
  playbackActionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  playbackCtrlBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    borderRadius: 10,
    gap: 6,
  },
  ctrlReset: {
    backgroundColor: '#F7DDD9',
  },
  ctrlPlay: {
    backgroundColor: ASAS_RED,
    flex: 2,
  },
  ctrlPause: {
    backgroundColor: '#261816',
  },
  ctrlBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#59413D',
  },
  ctrlPlayText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
