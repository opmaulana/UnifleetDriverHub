import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import {
  FileText,
  ChevronRight,
  BarChart2,
  TrendingUp,
  Calendar,
  Moon,
  AlertTriangle,
  Activity,
  Truck,
  MapPin,
  BookOpen,
  Cpu,
  Layers,
  Database,
  Clock,
  WifiOff,
  SlidersHorizontal,
  Timer,
  Search,
  Filter,
  ArrowLeft,
  Info,
  Check,
  Lock
} from 'lucide-react-native';
import { OperationsHeader } from '../../components/operations/OperationsHeader';
import { useOperationsStore } from '../../store/useOperationsStore';

const ASAS_RED = '#C0392B';
const GREEN = '#22c55e';
const GREY = '#9ca3af';

interface ReportOption {
  id: string;
  title: string;
  description: string;
  status: 'Available' | 'Coming Soon';
  icon: React.ReactNode;
}

export const ReportsScreen = ({ navigation, onNavigateToSettings }: { navigation?: any; onNavigateToSettings?: () => void }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'available' | 'soon'>('all');

  // Custom Details View States
  const [selectedReport, setSelectedReport] = useState<ReportOption | null>(null);
  const [detailTab, setDetailTab] = useState<'filters' | 'about'>('filters');
  const [timePeriod, setTimePeriod] = useState<'MTD' | '30_days' | '7_days' | '1_day' | 'till_date'>('30_days');
  const [scope, setScope] = useState<'entire_fleet' | 'specific_vehicle'>('entire_fleet');
  const [selectedVehicles, setSelectedVehicles] = useState<string[]>([]);
  const [format, setFormat] = useState<'csv' | 'pdf'>('csv');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [vehicleSearch, setVehicleSearch] = useState('');

  const { vehicles } = useOperationsStore();

  const filteredVehicles = useMemo(() => {
    return vehicles.filter(v => v.id.toLowerCase().includes(vehicleSearch.toLowerCase()));
  }, [vehicles, vehicleSearch]);

  const reportOptions: ReportOption[] = [
    {
      id: 'fleet_performance',
      title: 'Fleet Performance',
      description: 'Comprehensive performance analysis per vehicle in the selected period, with active days, operating speed, and daily averages.',
      status: 'Available',
      icon: <TrendingUp size={20} color={GREEN} />
    },
    {
      id: 'geofence_report',
      title: 'Geofence Report',
      description: 'Detailed summary of vehicle entries, exits, and dwell times inside mapped geofences, with total dwell duration.',
      status: 'Available',
      icon: <MapPin size={20} color="#3b82f6" />
    },
    {
      id: 'geofence_list',
      title: 'Geofence List',
      description: 'Canonical geofence master list with site type, size band, area, coordinates, and current occupancy count.',
      status: 'Available',
      icon: <Layers size={20} color="#ec4899" />
    },
    {
      id: 'all_tracker_list',
      title: 'All Tracker List',
      description: 'Navixy tracker registry joined to vehicle master names — tracker labels, device models, SIM card details, and live states.',
      status: 'Available',
      icon: <Cpu size={20} color="#10b981" />
    },
    {
      id: 'night_drivers',
      title: 'Night Drivers',
      description: 'Vehicles ranked by total overnight operating hours. Identifies drivers operating during high-risk night windows.',
      status: 'Available',
      icon: <Moon size={20} color="#3b82f6" />
    },
    {
      id: 'speed_violators',
      title: 'Speed Violators',
      description: 'Vehicles exceeding speed limits, ranked by incident count with max speed, average speed, and total duration.',
      status: 'Available',
      icon: <AlertTriangle size={20} color="#f59e0b" />
    },
    {
      id: 'fuel_expense',
      title: 'Fuel Expense',
      description: 'Daily fuel costs and consumption split by movement and idling. Sourced from telemetry records.',
      status: 'Available',
      icon: <Database size={20} color={GREEN} />
    },
    {
      id: 'below_average',
      title: 'Below Average',
      description: 'Identification of vehicles and drivers operating below fleet performance, safety, and fuel efficiency benchmarks.',
      status: 'Available',
      icon: <BarChart2 size={20} color={ASAS_RED} />
    },
    {
      id: 'above_average',
      title: 'Above Average',
      description: 'Outstanding performers exceeding fleet averages in fuel economy, uptime, and safety compliance benchmarks.',
      status: 'Available',
      icon: <BarChart2 size={20} color={GREEN} />
    },
    {
      id: 'night_speeding',
      title: 'Night Speeding',
      description: 'Coupled risk where speeding incidents overlap night-driving windows, with tracker-level summary and detailed overlap intervals.',
      status: 'Coming Soon',
      icon: <Activity size={20} color={GREY} />
    },
    {
      id: 'live_fleet_status',
      title: 'Live Fleet Status',
      description: 'Real-time snapshot of all active devices — location, speed, movement status, ignition state, and last-seen timestamp.',
      status: 'Coming Soon',
      icon: <Truck size={20} color={GREY} />
    },
    {
      id: 'vehicle_registry',
      title: 'Vehicle Registry',
      description: 'Complete region-scoped vehicle master registry — standardized vehicle name, vehicle type, transporter, tracker link, status, and metadata.',
      status: 'Coming Soon',
      icon: <BookOpen size={20} color={GREY} />
    },
    {
      id: 'route_deviation',
      title: 'Route Deviation',
      description: 'Tracks instances where vehicles deviated from expected corridors. Requires corridor learning data.',
      status: 'Coming Soon',
      icon: <WifiOff size={20} color={GREY} />
    },
    {
      id: 'idle_time',
      title: 'Idle Time',
      description: 'Breaks down total engine-on idle time per vehicle. Coming soon.',
      status: 'Coming Soon',
      icon: <Clock size={20} color={GREY} />
    },
    {
      id: 'inactive_trackers',
      title: 'Inactive Trackers',
      description: 'Devices that have stopped transmitting beyond the expected threshold. Coming soon.',
      status: 'Coming Soon',
      icon: <WifiOff size={20} color={GREY} />
    },
    {
      id: 'driver_consistency',
      title: 'Driver Consistency',
      description: 'Evaluates driver behavior consistency. Coming soon.',
      status: 'Coming Soon',
      icon: <SlidersHorizontal size={20} color={GREY} />
    },
    {
      id: 'high_risk_time',
      title: 'High-Risk Time',
      description: 'Pinpoints time windows with the highest concentration of risk events. Coming soon.',
      status: 'Coming Soon',
      icon: <Timer size={20} color={GREY} />
    }
  ];

  // Filter options based on tab and search query
  const filteredReports = useMemo(() => {
    return reportOptions.filter((item) => {
      // Search query filter
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      // Tab filter
      if (activeTab === 'available') {
        return item.status === 'Available';
      }
      if (activeTab === 'soon') {
        return item.status === 'Coming Soon';
      }
      return true;
    });
  }, [searchQuery, activeTab]);

  const availableCount = reportOptions.filter(r => r.status === 'Available').length;
  const soonCount = reportOptions.filter(r => r.status === 'Coming Soon').length;

  return (
    <View style={styles.screen}>
      <OperationsHeader onNavigateToSettings={onNavigateToSettings} />

      <View style={styles.fixedHeader}>
        {/* Title Block */}
        <View style={styles.titleRow}>
          <View>
            <Text style={styles.title}>Live Fleet Reports</Text>
            <Text style={styles.subtitle}>Telemetry-first analytics & register lists</Text>
          </View>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{reportOptions.length} TOTAL</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Search size={18} color="#9ca3af" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search report templates..."
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Categories Tab Selector */}
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'all' && styles.tabActive]}
            onPress={() => setActiveTab('all')}
          >
            <Text style={[styles.tabText, activeTab === 'all' && styles.tabTextActive]}>
              All ({reportOptions.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'available' && styles.tabActive]}
            onPress={() => setActiveTab('available')}
          >
            <Text style={[styles.tabText, activeTab === 'available' && styles.tabTextActive]}>
              Available ({availableCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'soon' && styles.tabActive]}
            onPress={() => setActiveTab('soon')}
          >
            <Text style={[styles.tabText, activeTab === 'soon' && styles.tabTextActive]}>
              Coming Soon ({soonCount})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Render Cards */}
        {filteredReports.map((item) => {
          const isAvailable = item.status === 'Available';

          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.card, !isAvailable && styles.cardDisabled]}
              activeOpacity={isAvailable ? 0.7 : 1}
              disabled={!isAvailable}
              onPress={() => {
                if (isAvailable) {
                  navigation?.navigate('ReportDetail', { reportId: item.id });
                }
              }}
            >
              <View style={styles.cardHeader}>
                <View style={[styles.iconCircle, !isAvailable && styles.iconCircleDisabled]}>
                  {item.icon}
                </View>
                <View style={[
                  styles.statusBadge,
                  isAvailable ? styles.badgeAvailable : styles.badgeSoon
                ]}>
                  <Text style={[
                    styles.statusBadgeText,
                    isAvailable ? styles.textAvailable : styles.textSoon
                  ]}>
                    {item.status.toUpperCase()}
                  </Text>
                </View>
              </View>

              <Text style={[styles.cardTitle, !isAvailable && styles.textMuted]}>
                {item.title}
              </Text>
              <Text style={[styles.cardDescription, !isAvailable && styles.textMuted]}>
                {item.description}
              </Text>

              {isAvailable && (
                <View style={styles.cardFooter}>
                  <View style={styles.dateContainer}>
                    <Calendar size={14} color="#9ca3af" />
                    <Text style={styles.dateText}>Select Date Range</Text>
                  </View>
                  <ChevronRight size={18} color={ASAS_RED} />
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        {filteredReports.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No report templates match your search.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  fixedHeader: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingTop: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
  },
  subtitle: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
    marginTop: 2,
  },
  countBadge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  countBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#4b5563',
    letterSpacing: 0.5,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
    marginBottom: 14,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 13,
    color: '#111827',
  },
  tabRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tabActive: {
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
    borderBottomColor: 'transparent',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    marginBottom: -1,
    zIndex: 10,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  tabTextActive: {
    color: ASAS_RED,
    fontWeight: '800',
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  cardDisabled: {
    backgroundColor: '#f9fafb',
    borderColor: '#e5e7eb',
    opacity: 0.75,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#f9fafb',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  iconCircleDisabled: {
    backgroundColor: '#f3f4f6',
    borderColor: '#e5e7eb',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  badgeAvailable: {
    backgroundColor: '#ecfdf5',
    borderColor: '#a7f3d0',
  },
  badgeSoon: {
    backgroundColor: '#f3f4f6',
    borderColor: '#e5e7eb',
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  textAvailable: {
    color: '#059669',
  },
  textSoon: {
    color: '#6b7280',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 12.5,
    color: '#4b5563',
    lineHeight: 18,
    marginBottom: 16,
    fontWeight: '500',
  },
  textMuted: {
    color: '#9ca3af',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9ca3af',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: '600',
  },
  // ============================================================
  // Report Generation Detail View Screen Styles
  // ============================================================
  detailScreen: {
    flex: 1,
    backgroundColor: '#C0392B', // Header color matches ASAS Red
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 54, // Safe area space
    paddingBottom: 24,
    backgroundColor: '#C0392B',
  },
  backButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: 14,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.2,
  },
  headerSubtitle: {
    fontSize: 11.5,
    color: 'rgba(255, 255, 255, 0.75)',
    fontWeight: '600',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  sheetContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -16,
    overflow: 'hidden',
  },
  scrollView: {
    flex: 1,
  },
  detailTabRow: {
    flexDirection: 'row',
    height: 48,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    backgroundColor: '#ffffff',
  },
  detailTabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  detailTabActive: {
    // Target active tab
  },
  detailTabText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#6b7280',
  },
  detailTabTextActive: {
    color: '#C0392B',
    fontWeight: '800',
  },
  activeTabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: '20%',
    right: '20%',
    height: 3,
    backgroundColor: '#C0392B',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  detailScrollContainer: {
    padding: 20,
    paddingBottom: 80,
  },
  infoCard: {
    backgroundColor: '#f0f9ff',
    borderWidth: 1,
    borderColor: '#bae6fd',
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#0ea5e9',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
  },
  infoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoCardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0369a1',
    letterSpacing: 0.2,
  },
  infoCardText: {
    fontSize: 12.5,
    color: '#334155',
    lineHeight: 19,
    fontWeight: '500',
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: 0.2,
  },
  periodBtnRow: {
    flexDirection: 'row',
    gap: 8,
  },
  periodBtn: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#f3f4f6',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1,
  },
  periodBtnActive: {
    borderColor: '#C0392B',
    backgroundColor: '#ffffff',
  },
  periodBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#4b5563',
  },
  periodBtnTextActive: {
    color: '#C0392B',
  },
  tillDateContainer: {
    flexDirection: 'row',
  },
  tillDateButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#C0392B',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  tillDateText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#C0392B',
  },
  tillDateIndicator: {
    // active bar
  },
  scopeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#f3f4f6',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  scopeCardActive: {
    borderColor: '#C0392B',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  radioCircleActive: {
    borderColor: '#C0392B',
  },
  radioInnerCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#C0392B',
  },
  scopeIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  scopeTextContainer: {
    flex: 1,
  },
  scopeTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#111827',
  },
  scopeSubtitle: {
    fontSize: 11.5,
    color: '#6b7280',
    fontWeight: '600',
    marginTop: 2,
  },
  vehicleSelectorWrapper: {
    backgroundColor: '#f9fafb',
    borderWidth: 1.5,
    borderColor: '#f3f4f6',
    borderRadius: 14,
    padding: 14,
    marginTop: 4,
    marginBottom: 12,
  },
  vehicleSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 38,
    marginBottom: 12,
  },
  vehicleSearchInput: {
    flex: 1,
    height: '100%',
    fontSize: 12.5,
    color: '#111827',
  },
  vehicleListContainer: {
    maxHeight: 180,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  vehicleItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  checkboxContainer: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxActive: {
    backgroundColor: '#C0392B',
    borderColor: '#C0392B',
  },
  vehicleItemText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: '#1f2937',
  },
  vehicleStatusBadge: {
    fontSize: 9,
    fontWeight: '800',
    backgroundColor: '#f3f4f6',
    color: '#4b5563',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  noVehiclesText: {
    padding: 20,
    textAlign: 'center',
    fontSize: 12.5,
    color: '#9ca3af',
    fontWeight: '600',
  },
  selectedCountText: {
    fontSize: 11.5,
    color: '#4b5563',
    fontWeight: '700',
    marginTop: 10,
    textAlign: 'right',
  },
  formatRow: {
    flexDirection: 'row',
    gap: 12,
  },
  formatCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#f3f4f6',
    borderRadius: 14,
    padding: 16,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  formatCardActive: {
    borderColor: '#C0392B',
  },
  checkBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#C0392B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  formatIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#f9fafb',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#f3f4f6',
    marginBottom: 12,
  },
  formatTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
  },
  formatSubtitle: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '600',
    marginTop: 2,
  },
  btnSection: {
    marginTop: 12,
    alignItems: 'center',
  },
  downloadBtn: {
    backgroundColor: '#C0392B',
    borderRadius: 12,
    height: 50,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#C0392B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  downloadBtnDisabled: {
    opacity: 0.6,
  },
  downloadBtnText: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  securityText: {
    fontSize: 11,
    color: '#9ca3af',
    fontWeight: '600',
  },
  successContainer: {
    backgroundColor: '#ecfdf5',
    borderWidth: 1.5,
    borderColor: '#a7f3d0',
    borderRadius: 12,
    height: 50,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  successText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#065f46',
  },
  aboutContainer: {
    paddingTop: 6,
  },
  aboutHeader: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
    marginTop: 18,
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  aboutBody: {
    fontSize: 13,
    color: '#4b5563',
    lineHeight: 20,
    fontWeight: '500',
  },
  columnsList: {
    backgroundColor: '#f9fafb',
    borderRadius: 14,
    padding: 14,
    marginVertical: 10,
    borderWidth: 1.5,
    borderColor: '#f3f4f6',
  },
  columnItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#C0392B',
    marginRight: 10,
  },
  columnText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#374151',
  },
});
