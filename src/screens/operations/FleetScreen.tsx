import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import {
  Activity,
  Truck,
  Clock,
  WifiOff,
  Search,
  ArrowUpDown,
  Filter,
  ChevronRight,
  Play,
  Pause,
} from 'lucide-react-native';
import { OperationsHeader } from '../../components/operations/OperationsHeader';
import { useOperationsStore, DecodedVehicle, VehicleStatus } from '../../store/useOperationsStore';

const ASAS_RED = '#C0392B';
const GREEN = '#22c55e'; // Vibrant Green for moving
const ORANGE = '#f97316'; // Orange for stopped/idle
const RED = '#ef4444'; // Red for parked
const GREY = '#9ca3af'; // Gray for offline
const BLUE = '#3b82f6'; // Blue for pulse

// --- Helpers for styling based on status ---
const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'moving': return GREEN;
    case 'parked': return RED;
    case 'stopped': return ORANGE;
    case 'idle-stopped': return ORANGE;
    case 'idle-parked': return ORANGE;
    case 'offline': return GREY;
    default: return GREY;
  }
};

const getStatusIcon = (status: string, size = 16, color?: string) => {
  const iconColor = color || getStatusColor(status);
  switch (status.toLowerCase()) {
    case 'moving':
      return <Play size={size} color={iconColor} fill={iconColor} />;
    case 'stopped':
      return <Pause size={size} color={iconColor} fill={iconColor} />;
    case 'parked':
      return <Text style={{ color: iconColor, fontSize: size, fontWeight: '800' }}>P</Text>;
    case 'idle-stopped':
      return <Clock size={size} color={iconColor} />;
    case 'idle-parked':
      return <Text style={{ color: iconColor, fontSize: size, fontWeight: '800' }}>P</Text>;
    case 'offline':
      return <WifiOff size={size} color={iconColor} />;
    default:
      return <Truck size={size} color={iconColor} />;
  }
};

// ============================================================
// SECTION 1: Fleet Pulse Overview Grid
// ============================================================
const FleetPulseGrid = ({ stats }: { stats: any }) => {
  const cards = [
    { label: 'Total Vehicles', value: stats.total },
    { label: 'Moving', value: stats.moving, valueColor: GREEN },
    { label: 'Stopped', value: stats.stopped, valueColor: ORANGE },
    { label: 'Parked', value: stats.parked, valueColor: RED },
    { label: 'Idle-Stopped', value: stats.idleStopped, valueColor: ORANGE },
    { label: 'Idle-Parked', value: stats.idleParked, valueColor: ORANGE },
    { label: 'Offline', value: stats.offline, valueColor: '#4b5563' },
    { label: 'Fleet Pulse', value: `${stats.fleetPulse}%`, valueColor: BLUE },
  ];

  return (
    <View style={styles.gridContainer}>
      {cards.map((card, index) => {
        const isRightEdge = (index + 1) % 4 === 0;
        const isBottomEdge = index >= 4;

        return (
          <View
            key={card.label}
            style={[
              styles.gridCell,
              !isRightEdge && styles.cellRightBorder,
              !isBottomEdge && styles.cellBottomBorder,
            ]}
          >
            <Text style={[styles.gridValue, card.valueColor && { color: card.valueColor }]}>
              {card.value}
            </Text>
            <Text style={styles.gridLabel}>{card.label}</Text>
          </View>
        );
      })}
    </View>
  );
};

// ============================================================
// SECTION 2: Search, Sort, Filters Row
// ============================================================
const FleetSearchRow = ({
  searchQuery,
  setSearchQuery,
}: {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
}) => {
  return (
    <View style={styles.searchRow}>
      <View style={styles.searchBar}>
        <Search size={18} color={GREY} style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search vehicle, tracker, or driver..."
          placeholderTextColor="#9ca3af"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      <TouchableOpacity style={styles.actionBtn}>
        <ArrowUpDown size={16} color="#4b5563" />
        <Text style={styles.actionBtnText}>Sort</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.actionBtn}>
        <Filter size={16} color="#4b5563" />
        <Text style={styles.actionBtnText}>Filters</Text>
      </TouchableOpacity>
    </View>
  );
};

// ============================================================
// SECTION 3: Fleet Status Category Tabs
// ============================================================
const TABS = [
  { id: 'all', label: 'All' },
  { id: 'moving', label: 'Moving' },
  { id: 'stopped', label: 'Stopped' },
  { id: 'parked', label: 'Parked' },
  { id: 'idle-stopped', label: 'Idle-Stopped' },
  { id: 'idle-parked', label: 'Idle-Parked' },
  { id: 'offline', label: 'Offline' },
];

const FleetCategoryTabs = ({
  activeTab,
  setActiveTab,
  stats,
}: {
  activeTab: string;
  setActiveTab: (val: string) => void;
  stats: any;
}) => {
  const getTabCount = (tabId: string) => {
    switch (tabId) {
      case 'all': return stats.total;
      case 'moving': return stats.moving;
      case 'stopped': return stats.stopped;
      case 'parked': return stats.parked;
      case 'idle-stopped': return stats.idleStopped;
      case 'idle-parked': return stats.idleParked;
      case 'offline': return stats.offline;
      default: return 0;
    }
  };

  return (
    <View style={styles.tabsContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const count = getTabCount(tab.id);
          const dotColor = tab.id === 'all' ? 'transparent' : getStatusColor(tab.id);

          return (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tabBtn, isActive ? styles.tabBtnActive : styles.tabBtnInactive]}
              onPress={() => setActiveTab(tab.id)}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                {tab.id !== 'all' && (
                  <View style={[styles.tabDot, { backgroundColor: dotColor }]} />
                )}
                <Text style={[styles.tabLabelText, isActive ? styles.tabTextActive : styles.tabTextInactive]}>
                  {tab.label}
                </Text>
              </View>
              <Text style={[styles.tabCountText, isActive ? styles.tabTextActive : styles.tabTextInactive]}>
                ({count})
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

// ============================================================
// SECTION 4: Live Fleet List (Main Content)
// ============================================================
const LiveFleetList = ({ vehicles }: { vehicles: DecodedVehicle[] }) => {
  const renderItem = ({ item }: { item: DecodedVehicle }) => {
    const statusColor = getStatusColor(item.status);

    return (
      <View style={styles.vehicleRow}>
        {/* Left Circle Icon */}
        <View style={[styles.vehicleIconCircle, { borderColor: statusColor, opacity: item.status === 'offline' ? 0.6 : 1 }]}>
          {item.status === 'offline' ? (
            <Truck size={20} color={statusColor} />
          ) : (
            getStatusIcon(item.status, 20, statusColor)
          )}
        </View>

        {/* Middle Info */}
        <View style={styles.vehicleInfo}>
          <Text style={styles.vehicleName} numberOfLines={1}>
            {item.id} - {item.locationName || 'TR'}
          </Text>
          <Text style={styles.vehicleCoordinates} numberOfLines={1}>
            Lat: {item.latitude.toFixed(4)}, Lng: {item.longitude.toFixed(4)}
          </Text>
          <View style={styles.speedRow}>
            <Activity size={14} color="#6b7280" />
            <Text style={styles.speedText}>{Math.round(item.speed)} km/h</Text>
          </View>
        </View>

        {/* Right Info */}
        <View style={styles.vehicleRight}>
          <View style={styles.statusPill}>
            <Text style={[styles.statusPillText, { color: statusColor }]}>
              {item.status.toUpperCase()}
            </Text>
          </View>
          <Text style={[styles.durationText, { color: statusColor }]}>
            {item.statusDurationText || '13m 45s'}
          </Text>
          <Text style={styles.updatedText}>
            Updated: {new Date(item.lastUpdate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </Text>
        </View>

        {/* Chevron */}
        <View style={styles.chevronWrapper}>
          <ChevronRight size={18} color="#d1d5db" />
        </View>
      </View>
    );
  };

  if (vehicles.length === 0) {
    return (
      <View style={styles.emptyList}>
        <Text style={styles.emptyListText}>No vehicles match the selected criteria.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={vehicles}
      keyExtractor={(item) => item.trackerId.toString()}
      renderItem={renderItem}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      windowSize={5}
    />
  );
};

// ============================================================
// MAIN FLEET SCREEN
// ============================================================
export const FleetScreen = ({ onNavigateToSettings }: { onNavigateToSettings?: () => void }) => {
  const { vehicles, getStats, isLoading } = useOperationsStore();
  const stats = useMemo(() => getStats(), [vehicles]);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  // Filter vehicles based on active tab and search query
  const filteredVehicles = useMemo(() => {
    let filtered = vehicles;

    // Filter by Tab
    if (activeTab !== 'all') {
      filtered = filtered.filter((v) => v.status === activeTab);
    }

    // Filter by Search Query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (v) =>
          v.id.toLowerCase().includes(q) ||
          (v.locationName && v.locationName.toLowerCase().includes(q))
      );
    }

    return filtered;
  }, [vehicles, activeTab, searchQuery]);

  return (
    <View style={styles.screen}>
      <OperationsHeader onNavigateToSettings={onNavigateToSettings} />

      {/* Screen Header Content */}
      <View style={styles.headerContainer}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>Fleet Live Operations</Text>
            <Text style={styles.headerSubtitle}>Telemetry-first fleet intelligence</Text>
          </View>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        </View>

        {/* Top Grid */}
        <FleetPulseGrid stats={stats} />

        {/* Search & Actions */}
        <FleetSearchRow searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      </View>

      {/* Tabs */}
      <FleetCategoryTabs activeTab={activeTab} setActiveTab={setActiveTab} stats={stats} />

      {/* Loading state indicator */}
      {isLoading && vehicles.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={ASAS_RED} />
          <Text style={styles.loadingText}>Syncing live telemetry...</Text>
        </View>
      ) : (
        <LiveFleetList vehicles={filteredVehicles} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f9fafb', // Light gray background app shell
  },

  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#ffffff',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6b7280',
    marginTop: 4,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dcfce7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
    gap: 6,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: GREEN,
  },
  liveText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#166534',
    letterSpacing: 1,
  },

  // ---- Grid ----
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 16,
  },
  gridCell: {
    width: '25%',
    alignItems: 'center',
    paddingVertical: 18,
  },
  cellRightBorder: {
    borderRightWidth: 1,
    borderRightColor: '#f3f4f6',
  },
  cellBottomBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  gridValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  gridLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: '#6b7280',
    marginTop: 2,
    marginBottom: 0,
    textAlign: 'center',
  },
  gridIconWrapper: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent', 
  },

  // ---- Search Row ----
  searchRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 13,
    color: '#111827',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 40,
    gap: 6,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4b5563',
  },

  // ---- Tabs ----
  tabsContainer: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  tabsScroll: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  tabBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBtnInactive: {
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
  },
  tabBtnActive: {
    backgroundColor: ASAS_RED,
    borderColor: ASAS_RED,
  },
  tabDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  tabLabelText: {
    fontSize: 12,
    fontWeight: '600',
  },
  tabCountText: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  tabTextInactive: {
    color: '#4b5563',
  },
  tabTextActive: {
    color: '#ffffff',
  },

  // ---- List ----
  listContent: {
    padding: 16,
    gap: 12,
    paddingBottom: 100,
  },
  vehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  vehicleIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  vehicleInfo: {
    flex: 1,
    paddingHorizontal: 12,
  },
  vehicleName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  vehicleCoordinates: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
    marginBottom: 4,
  },
  speedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  speedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4b5563',
  },
  vehicleRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  statusPill: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 6,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  durationText: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 2,
  },
  updatedText: {
    fontSize: 10,
    color: '#9ca3af',
    fontWeight: '500',
  },
  chevronWrapper: {
    marginLeft: 8,
  },
  emptyList: {
    padding: 32,
    alignItems: 'center',
  },
  emptyListText: {
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
});
