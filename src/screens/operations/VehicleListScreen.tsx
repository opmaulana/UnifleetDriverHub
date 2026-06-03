import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Dimensions,
  Platform,
  StatusBar,
  Modal,
} from 'react-native';
import {
  ArrowLeft,
  Search,
  ChevronRight,
  TrendingUp,
  SlidersHorizontal,
  Info,
  X,
  Plus,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ASAS_RED = '#C0392B';

export interface Vehicle {
  id: string;
  registration: string;
  model: string;
  transporter: string;
  lastUpdate: string;
  status: 'Active' | 'Idle' | 'Offline';
  category: string; // 'Fuel Truck', 'LPG Truck', 'Flatbed'
  trackerId: string;
  sourceId: string;
  country: string; // 'Tanzania', 'Zambia'
  signal: string;
  connectionStatus: string;
  gpsSignal: string;
  gsmSignal: string;
}

// -------------------------------------------------------------
// STATIC HIGH-FIDELITY SAMPLE VEHICLE ROSTER
// -------------------------------------------------------------
const VEHICLE_ROSTER: Vehicle[] = [
  {
    id: '1',
    registration: 'BBD 4534',
    model: 'Shacman H3000',
    transporter: 'Horizon Hauliers',
    lastUpdate: '2 min ago',
    status: 'Active',
    category: 'Fuel Truck',
    trackerId: '3237758',
    sourceId: '10337751',
    country: 'Zambia',
    signal: '96%',
    connectionStatus: 'Active',
    gpsSignal: 'Good',
    gsmSignal: '96%',
  },
  {
    id: '2',
    registration: 'BBD 2944',
    model: 'Scania P360',
    transporter: 'Horizon Hauliers',
    lastUpdate: '15 min ago',
    status: 'Idle',
    category: 'LPG Truck',
    trackerId: '3237759',
    sourceId: '10337752',
    country: 'Zambia',
    signal: '91%',
    connectionStatus: 'Active',
    gpsSignal: 'Good',
    gsmSignal: '91%',
  },
  {
    id: '3',
    registration: 'BBD 4532',
    model: 'Shacman H3000',
    transporter: 'Horizon Hauliers',
    lastUpdate: '3 days ago',
    status: 'Offline',
    category: 'Fuel Truck',
    trackerId: '3237760',
    sourceId: '10337753',
    country: 'Zambia',
    signal: '0%',
    connectionStatus: 'Offline',
    gpsSignal: 'No Fix',
    gsmSignal: '0%',
  },
  {
    id: '4',
    registration: 'T 814 DKX',
    model: 'Scania TR',
    transporter: 'ASAS Transport',
    lastUpdate: '5 min ago',
    status: 'Active',
    category: 'Flatbed',
    trackerId: '3237761',
    sourceId: '10337754',
    country: 'Tanzania',
    signal: '98%',
    connectionStatus: 'Active',
    gpsSignal: 'Good',
    gsmSignal: '98%',
  },
  {
    id: '5',
    registration: 'T 916 DUC',
    model: 'Howo TR',
    transporter: 'ASAS Transport',
    lastUpdate: '22 min ago',
    status: 'Idle',
    category: 'Fuel Truck',
    trackerId: '3237762',
    sourceId: '10337755',
    country: 'Tanzania',
    signal: '88%',
    connectionStatus: 'Active',
    gpsSignal: 'Good',
    gsmSignal: '88%',
  },
  {
    id: '6',
    registration: 'T 391 DVR',
    model: 'Scania P360 TR',
    transporter: 'ASAS Transport',
    lastUpdate: '2 days ago',
    status: 'Offline',
    category: 'Fuel Truck',
    trackerId: '3237763',
    sourceId: '10337756',
    country: 'Tanzania',
    signal: '0%',
    connectionStatus: 'Offline',
    gpsSignal: 'No Fix',
    gsmSignal: '0%',
  },
  {
    id: '7',
    registration: 'T 597 EKN',
    model: 'Tiper TR (NEW)',
    transporter: 'Horizon Hauliers',
    lastUpdate: '1 hour ago',
    status: 'Active',
    category: 'Fuel Truck',
    trackerId: '3237764',
    sourceId: '10337757',
    country: 'Tanzania',
    signal: '95%',
    connectionStatus: 'Active',
    gpsSignal: 'Good',
    gsmSignal: '95%',
  },
  {
    id: '8',
    registration: 'T 620 EKN',
    model: 'Tiper TR (NEW)',
    transporter: 'ASAS Transport',
    lastUpdate: '4 hours ago',
    status: 'Idle',
    category: 'Flatbed',
    trackerId: '3237765',
    sourceId: '10337758',
    country: 'Tanzania',
    signal: '84%',
    connectionStatus: 'Active',
    gpsSignal: 'Good',
    gsmSignal: '84%',
  },
];

export const VehicleListScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  // Filter and search states
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [sortOption, setSortOption] = useState<'Last Updated' | 'Vehicle Name' | 'Status' | 'Vehicle Type'>('Vehicle Name');
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const STATUS_BAR_HEIGHT = Platform.OS === 'android' ? (StatusBar.currentHeight || 40) : 44;

  // Filter lists dynamically in-memory based on queries and chips
  const filteredVehicles = useMemo(() => {
    let result = [...VEHICLE_ROSTER];

    // Filter by query (name, reg number, tracker)
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (v) =>
          v.registration.toLowerCase().includes(q) ||
          v.model.toLowerCase().includes(q) ||
          v.transporter.toLowerCase().includes(q) ||
          v.trackerId.includes(q)
      );
    }

    // Filter by chips selection
    if (activeFilter !== 'All') {
      if (activeFilter === 'Active' || activeFilter === 'Idle' || activeFilter === 'Offline') {
        result = result.filter((v) => v.status === activeFilter);
      } else if (activeFilter === 'Fuel' || activeFilter === 'LPG' || activeFilter === 'Flatbed') {
        result = result.filter((v) => v.category.toLowerCase().includes(activeFilter.toLowerCase()));
      } else if (activeFilter === 'Tanzania' || activeFilter === 'Zambia') {
        result = result.filter((v) => v.country === activeFilter);
      }
    }

    // Sort list
    if (sortOption === 'Vehicle Name') {
      result.sort((a, b) => a.registration.localeCompare(b.registration));
    } else if (sortOption === 'Status') {
      result.sort((a, b) => a.status.localeCompare(b.status));
    } else if (sortOption === 'Vehicle Type') {
      result.sort((a, b) => a.category.localeCompare(b.category));
    } else if (sortOption === 'Last Updated') {
      // Offline items go last
      result.sort((a, b) => {
        if (a.status === 'Offline' && b.status !== 'Offline') return 1;
        if (a.status !== 'Offline' && b.status === 'Offline') return -1;
        return a.lastUpdate.localeCompare(b.lastUpdate);
      });
    }

    return result;
  }, [searchQuery, activeFilter, sortOption]);

  const filterChips = [
    'All',
    'Active',
    'Idle',
    'Offline',
    'Fuel',
    'LPG',
    'Flatbed',
    'Tanzania',
    'Zambia',
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* -------------------------------------------------------------
          STICKY BRAND RED HEADER
          ------------------------------------------------------------- */}
      <View style={[styles.header, { height: 56 + STATUS_BAR_HEIGHT, paddingTop: STATUS_BAR_HEIGHT }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <ArrowLeft color="#FFFFFF" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Vehicle List</Text>
        <TouchableOpacity
          onPress={() => setSearchFocused(!searchFocused)}
          style={styles.searchIconBtn}
          activeOpacity={0.7}
        >
          <Search color="#FFFFFF" size={22} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* -------------------------------------------------------------
            SUMMARY OPERATIONS CARD
            ------------------------------------------------------------- */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>
            Total Vehicles: <Text style={{ color: ASAS_RED }}>1,274</Text>
          </Text>
          <View style={styles.statusGridRow}>
            <View style={styles.statusCol}>
              <View style={[styles.statusDot, { backgroundColor: '#27AE60' }]} />
              <Text style={styles.statusText}>Active: 542</Text>
            </View>
            <View style={styles.statusCol}>
              <View style={[styles.statusDot, { backgroundColor: '#E67E22' }]} />
              <Text style={styles.statusText}>Idle: 411</Text>
            </View>
            <View style={styles.statusCol}>
              <View style={[styles.statusDot, { backgroundColor: '#BA1A1A' }]} />
              <Text style={styles.statusText}>Offline: 321</Text>
            </View>
          </View>
        </View>

        {/* -------------------------------------------------------------
            INTERACTIVE SEARCH BAR
            ------------------------------------------------------------- */}
        <View style={styles.searchBarWrapper}>
          <Search size={18} color="#8D706C" style={styles.searchIconInside} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search vehicle, reg no, tracker..."
            placeholderTextColor="#8D706C"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus={searchFocused}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={16} color="#BA1A1A" style={{ marginRight: 8 }} />
            </TouchableOpacity>
          )}
        </View>

        {/* -------------------------------------------------------------
            HORIZONALLY SCROLLABLE FILTER CHIPS
            ------------------------------------------------------------- */}
        <View style={styles.chipsScrollContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsScrollContent}
          >
            {filterChips.map((chip) => (
              <TouchableOpacity
                key={chip}
                style={[
                  styles.filterChip,
                  activeFilter === chip ? styles.filterChipActive : styles.filterChipInactive,
                ]}
                onPress={() => setActiveFilter(chip)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    activeFilter === chip ? styles.filterChipTextActive : styles.filterChipTextInactive,
                  ]}
                >
                  {chip}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* -------------------------------------------------------------
            VEHICLE ROSTER CARDS
            ------------------------------------------------------------- */}
        <View style={styles.rosterContainer}>
          {filteredVehicles.length === 0 ? (
            /* Centered Empty State View */
            <View style={styles.emptyStateContainer}>
              <View style={styles.emptyIconBox}>
                <SlidersHorizontal size={40} color="#BA1A1A" />
              </View>
              <Text style={styles.emptyTitleText}>No vehicles found.</Text>
              <Text style={styles.emptySubText}>Try a different search.</Text>
            </View>
          ) : (
            filteredVehicles.map((vehicle) => (
              <TouchableOpacity
                key={vehicle.id}
                style={styles.vehicleCard}
                onPress={() => navigation.navigate('VehicleDetails', { vehicle })}
                activeOpacity={0.85}
              >
                {/* Status Indicator Left Color Strip */}
                <View
                  style={[
                    styles.statusLeftStrip,
                    {
                      backgroundColor:
                        vehicle.status === 'Active'
                          ? '#27AE60'
                          : vehicle.status === 'Idle'
                          ? '#E67E22'
                          : '#BA1A1A',
                    },
                  ]}
                />

                {/* Card Main Body */}
                <View style={styles.vehicleCardMain}>
                  <View style={styles.cardHeaderRow}>
                    <View style={styles.cardHeaderLeft}>
                      <View
                        style={[
                          styles.cardHeaderDot,
                          {
                            backgroundColor:
                              vehicle.status === 'Active'
                                ? '#27AE60'
                                : vehicle.status === 'Idle'
                                ? '#E67E22'
                                : '#BA1A1A',
                          },
                        ]}
                      />
                      <Text style={styles.vehicleRegText}>{vehicle.registration}</Text>
                    </View>
                    <Text style={styles.cardUpdateText}>Last Update: {vehicle.lastUpdate}</Text>
                  </View>

                  <View style={styles.cardSpecRow}>
                    <View>
                      <Text style={styles.vehicleModelText}>{vehicle.model}</Text>
                      <Text style={styles.transporterText}>{vehicle.transporter}</Text>
                    </View>
                    <View style={styles.specRowRight}>
                      <Text style={styles.statusValueLabel}>
                        Status:{' '}
                        <Text
                          style={{
                            color:
                              vehicle.status === 'Active'
                                ? '#27AE60'
                                : vehicle.status === 'Idle'
                                ? '#E67E22'
                                : '#BA1A1A',
                            fontWeight: '800',
                          }}
                        >
                          {vehicle.status}
                        </Text>
                      </Text>

                      {/* Category Badge */}
                      <View
                        style={[
                          styles.categoryBadge,
                          {
                            backgroundColor:
                              vehicle.category === 'Fuel Truck'
                                ? '#EAFDF2'
                                : vehicle.category === 'LPG Truck'
                                ? '#FFF5EB'
                                : '#EBF5FB',
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.categoryBadgeText,
                            {
                              color:
                                vehicle.category === 'Fuel Truck'
                                  ? '#27AE60'
                                  : vehicle.category === 'LPG Truck'
                                  ? '#D35400'
                                  : '#2980B9',
                            },
                          ]}
                        >
                          {vehicle.category}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Right Arrow navigation indicator */}
                <View style={styles.arrowBox}>
                  <ChevronRight size={18} color="#8D706C" />
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>

      {/* -------------------------------------------------------------
          FLOATING CIRCULAR SORT ACTION BUTTON
          ------------------------------------------------------------- */}
      <TouchableOpacity
        style={styles.floatingSortFab}
        onPress={() => setSortModalVisible(true)}
        activeOpacity={0.85}
      >
        <SlidersHorizontal size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
        <Text style={styles.floatingSortFabText}>Sort</Text>
      </TouchableOpacity>

      {/* -------------------------------------------------------------
          SORT MODAL OPTIONS PICKER
          ------------------------------------------------------------- */}
      <Modal
        visible={sortModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSortModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sort Vehicles</Text>
              <TouchableOpacity onPress={() => setSortModalVisible(false)}>
                <X size={20} color="#261816" />
              </TouchableOpacity>
            </View>

            {(['Last Updated', 'Vehicle Name', 'Status', 'Vehicle Type'] as const).map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.sortOptionRow,
                  sortOption === option && styles.sortOptionRowActive,
                ]}
                onPress={() => {
                  setSortOption(option);
                  setSortModalVisible(false);
                }}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.sortOptionLabel,
                    sortOption === option && styles.sortOptionLabelActive,
                  ]}
                >
                  {option}
                </Text>
                {sortOption === option && (
                  <View style={styles.sortIndicatorCircle} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
};

// -------------------------------------------------------------
// PREMIUM STYLING DESIGN SYSTEM (VANILLA STYLESHEET)
// -------------------------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: ASAS_RED,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  searchIconBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: '#FAF6F5',
  },
  scrollContent: {
    paddingBottom: 40,
  },

  // ---- Summary Stats Card ----
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F2ECEB',
    shadowColor: '#261816',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    alignItems: 'center',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#261816',
    marginBottom: 12,
  },
  statusGridRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  statusCol: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#59413D',
  },

  // ---- Search Bar ----
  searchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ECE0DF',
    marginHorizontal: 16,
    marginTop: 16,
    height: 44,
  },
  searchIconInside: {
    marginLeft: 12,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#261816',
    fontWeight: '600',
  },

  // ---- Filter Chips ----
  chipsScrollContainer: {
    marginTop: 12,
  },
  chipsScrollContent: {
    paddingHorizontal: 16,
    gap: 8,
    paddingBottom: 4,
  },
  filterChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 1,
  },
  filterChipActive: {
    backgroundColor: ASAS_RED,
    borderColor: ASAS_RED,
  },
  filterChipInactive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#ECE0DF',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  filterChipTextInactive: {
    color: '#59413D',
  },

  // ---- Vehicle Cards List ----
  rosterContainer: {
    marginTop: 16,
    paddingHorizontal: 16,
    gap: 12,
  },
  vehicleCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F2ECEB',
    shadowColor: '#261816',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    overflow: 'hidden',
  },
  statusLeftStrip: {
    width: 6,
  },
  vehicleCardMain: {
    flex: 1,
    padding: 16,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardHeaderDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  vehicleRegText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#261816',
  },
  cardUpdateText: {
    fontSize: 11,
    color: '#8D706C',
  },
  cardSpecRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  vehicleModelText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#59413D',
  },
  transporterText: {
    fontSize: 12,
    color: '#8D706C',
    marginTop: 2,
  },
  specRowRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  statusValueLabel: {
    fontSize: 11,
    color: '#8D706C',
  },
  categoryBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  categoryBadgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  arrowBox: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingRight: 16,
  },

  // ---- Floating Sort Action ----
  floatingSortFab: {
    position: 'absolute',
    bottom: 24,
    right: 16,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#ECE0DF',
  },
  floatingSortFabText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#261816',
  },

  // ---- Empty State ----
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FDEDEC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitleText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#261816',
    marginBottom: 4,
  },
  emptySubText: {
    fontSize: 12,
    color: '#8D706C',
  },

  // ---- Sort Modal Options ----
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#FAF6F5',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#261816',
  },
  sortOptionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#FAF6F5',
  },
  sortOptionRowActive: {
    backgroundColor: '#FEF5F4',
    borderRadius: 8,
    paddingHorizontal: 8,
    marginHorizontal: -8,
  },
  sortOptionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#59413D',
  },
  sortOptionLabelActive: {
    color: ASAS_RED,
    fontWeight: '800',
  },
  sortIndicatorCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: ASAS_RED,
  },
});
