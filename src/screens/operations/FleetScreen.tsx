import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import {
  Activity,
  Truck,
  MapPin,
  AlertTriangle,
  Clock,
  ChevronRight,
  Wifi,
  WifiOff,
  Navigation,
  BarChart3,
  FileText,
  Fuel,
  BookOpen,
  Layers,
  TrendingUp,
} from 'lucide-react-native';
import { OperationsHeader } from '../../components/operations/OperationsHeader';

const ASAS_RED = '#C0392B';
const GREEN = '#27AE60';
const ORANGE = '#E67E22';
const GREY = '#7F8C8D';

// ============================================================
// SECTION 1: Live Operations Dashboard
// ============================================================
const LiveOperationsDashboard = () => {
  const quickModules = [
    { icon: <BarChart3 size={20} color={ASAS_RED} />, label: 'Geofence\nIntelligence' },
    { icon: <FileText size={20} color={ASAS_RED} />, label: 'Nominations' },
    { icon: <Fuel size={20} color={ASAS_RED} />, label: 'Inventory\nLevels' },
    { icon: <BookOpen size={20} color={ASAS_RED} />, label: 'Operator\nLogs' },
  ];

  const recentAlerts = [
    {
      type: 'critical',
      title: 'Night Driving Violation',
      subtitle: 'TRK-114 • Sector 4 North',
      time: '02:45 AM',
      color: '#BA1A1A',
    },
    {
      type: 'warning',
      title: 'Speed Violation: 88 km/h',
      subtitle: 'TRK-227 • Dar Es Salaam Corridor',
      time: '03:12 AM',
      color: ORANGE,
    },
    {
      type: 'info',
      title: 'Prolonged Idling',
      subtitle: 'TRK-089 • Gate 04',
      time: '1h 20m',
      color: GREY,
    },
  ];

  return (
    <View style={styles.sectionContainer}>
      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Fleet Live Operations</Text>
          <Text style={styles.sectionSubtitle}>Telemetry-first fleet intelligence</Text>
        </View>
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      </View>

      {/* Quick Access Modules */}
      <Text style={styles.moduleLabel}>OPERATIONAL MODULES</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.modulesRow}
      >
        {quickModules.map((mod, i) => (
          <TouchableOpacity key={i} style={styles.moduleCard}>
            <View style={styles.moduleIcon}>{mod.icon}</View>
            <Text style={styles.moduleText}>{mod.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Fleet Status Summary */}
      <View style={styles.statusRow}>
        <View style={[styles.statusCard, { borderLeftColor: GREEN }]}>
          <Text style={styles.statusNumber}>18</Text>
          <Text style={styles.statusLabel}>Active</Text>
          <View style={[styles.statusDot, { backgroundColor: GREEN }]} />
        </View>
        <View style={[styles.statusCard, { borderLeftColor: ORANGE }]}>
          <Text style={styles.statusNumber}>4</Text>
          <Text style={styles.statusLabel}>Idling</Text>
          <View style={[styles.statusDot, { backgroundColor: ORANGE }]} />
        </View>
        <View style={[styles.statusCard, { borderLeftColor: GREY }]}>
          <Text style={styles.statusNumber}>7</Text>
          <Text style={styles.statusLabel}>Offline</Text>
          <View style={[styles.statusDot, { backgroundColor: GREY }]} />
        </View>
      </View>

      {/* Recent Alerts Preview */}
      <Text style={styles.moduleLabel}>RECENT ALERTS</Text>
      {recentAlerts.map((alert, i) => (
        <TouchableOpacity key={i} style={styles.alertCard}>
          <View style={[styles.alertBar, { backgroundColor: alert.color }]} />
          <View style={styles.alertContent}>
            <Text style={styles.alertTitle}>{alert.title}</Text>
            <Text style={styles.alertSubtitle}>{alert.subtitle}</Text>
          </View>
          <View style={styles.alertTime}>
            <Text style={styles.alertTimeText}>{alert.time}</Text>
            <ChevronRight color="#8D706C" size={16} />
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

// ============================================================
// SECTION 2: Geofence Intelligence
// ============================================================
const GeofenceIntelligence = () => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const categories = [
    {
      id: 'ops',
      title: 'Ops Yards',
      description: 'Staging and maintenance facilities.',
      color: '#005875',
      zones: [
        { name: 'Dar Main Yard', vehicles: 6, status: 'active' },
        { name: 'Dodoma Staging', vehicles: 3, status: 'active' },
        { name: 'Mbeya Service Bay', vehicles: 0, status: 'inactive' },
      ],
    },
    {
      id: 'loading',
      title: 'Loading / Origin',
      description: 'Primary dispatch and cargo onboarding.',
      color: GREEN,
      zones: [
        { name: 'Port of Dar', vehicles: 4, status: 'active' },
        { name: 'Warehouse Alpha', vehicles: 2, status: 'active' },
        { name: 'Depot B-12', vehicles: 1, status: 'approaching' },
      ],
    },
    {
      id: 'unloading',
      title: 'Unloading / Destination',
      description: 'Delivery points and offload terminals.',
      color: ORANGE,
      zones: [
        { name: 'Lusaka Terminal', vehicles: 3, status: 'active' },
        { name: 'Chipata Hub', vehicles: 1, status: 'approaching' },
        { name: 'Lilongwe Drop', vehicles: 0, status: 'inactive' },
      ],
    },
    {
      id: 'transit',
      title: 'Transit Corridors',
      description: 'Active fleet movement routes.',
      color: ASAS_RED,
      zones: [
        { name: 'TANZAM Highway', vehicles: 8, status: 'active' },
        { name: 'Great North Road', vehicles: 5, status: 'active' },
        { name: 'M1 Corridor', vehicles: 2, status: 'active' },
      ],
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return GREEN;
      case 'approaching': return ORANGE;
      case 'inactive': return GREY;
      default: return GREY;
    }
  };

  return (
    <View style={styles.sectionContainer}>
      {/* Geofence Header */}
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Geofence Intelligence</Text>
          <Text style={styles.sectionSubtitle}>
            Real-time spatial overview of operational categories.
          </Text>
        </View>
      </View>

      {/* Summary Bar */}
      <View style={styles.geoSummaryRow}>
        <View style={styles.geoSummaryItem}>
          <Text style={styles.geoSummaryNumber}>14</Text>
          <Text style={styles.geoSummaryLabel}>Active Zones</Text>
        </View>
        <View style={styles.geoSummaryDivider} />
        <View style={styles.geoSummaryItem}>
          <Text style={styles.geoSummaryNumber}>29</Text>
          <Text style={styles.geoSummaryLabel}>Vehicles Tracked</Text>
        </View>
        <View style={styles.geoSummaryDivider} />
        <View style={styles.geoSummaryItem}>
          <Text style={styles.geoSummaryNumber}>3</Text>
          <Text style={styles.geoSummaryLabel}>Alerts</Text>
        </View>
      </View>

      {/* Categories */}
      {categories.map((cat) => (
        <TouchableOpacity
          key={cat.id}
          style={styles.geoCategoryCard}
          onPress={() =>
            setExpandedCategory(expandedCategory === cat.id ? null : cat.id)
          }
          activeOpacity={0.7}
        >
          <View style={styles.geoCategoryHeader}>
            <View style={[styles.geoCategoryBar, { backgroundColor: cat.color }]} />
            <View style={styles.geoCategoryInfo}>
              <Text style={styles.geoCategoryTitle}>{cat.title}</Text>
              <Text style={styles.geoCategoryDesc}>{cat.description}</Text>
            </View>
            <View style={styles.geoCategoryCount}>
              <Text style={styles.geoCategoryCountText}>
                {cat.zones.reduce((sum, z) => sum + z.vehicles, 0)}
              </Text>
              <Truck size={14} color="#8D706C" />
            </View>
          </View>

          {/* Expanded Zone List */}
          {expandedCategory === cat.id && (
            <View style={styles.zoneList}>
              {cat.zones.map((zone, zi) => (
                <View key={zi} style={styles.zoneRow}>
                  <View style={[styles.zoneDot, { backgroundColor: getStatusColor(zone.status) }]} />
                  <Text style={styles.zoneName}>{zone.name}</Text>
                  <Text style={styles.zoneVehicles}>{zone.vehicles} vehicles</Text>
                  <View style={[styles.zoneStatusPill, { backgroundColor: getStatusColor(zone.status) + '20' }]}>
                    <Text style={[styles.zoneStatusText, { color: getStatusColor(zone.status) }]}>
                      {zone.status.toUpperCase()}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
};

// ============================================================
// MAIN FLEET SCREEN (scrollable composite)
// ============================================================
export const FleetScreen = ({ onNavigateToSettings }: { onNavigateToSettings?: () => void }) => {
  return (
    <View style={styles.screen}>
      <OperationsHeader onNavigateToSettings={onNavigateToSettings} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <LiveOperationsDashboard />
        {/* Separator */}
        <View style={styles.sectionSeparator}>
          <View style={styles.separatorLine} />
          <Layers size={16} color="#8D706C" />
          <View style={styles.separatorLine} />
        </View>
        <GeofenceIntelligence />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFF8F6',
  },

  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },

  // ---- Section Shared ----
  sectionContainer: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#261816',
  },
  sectionSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#59413D',
    marginTop: 4,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#27AE6020',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
    gap: 6,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: GREEN,
  },
  liveText: {
    fontSize: 11,
    fontWeight: '700',
    color: GREEN,
    letterSpacing: 1,
  },

  // ---- Modules ----
  moduleLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8D706C',
    letterSpacing: 1.5,
    marginBottom: 10,
    marginTop: 8,
  },
  modulesRow: {
    gap: 10,
    paddingBottom: 16,
  },
  moduleCard: {
    width: 90,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  moduleIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#FFF0EE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  moduleText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#261816',
    textAlign: 'center',
    lineHeight: 14,
  },

  // ---- Status Cards ----
  statusRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  statusCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 14,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statusNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: '#261816',
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#59413D',
    marginTop: 2,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    position: 'absolute',
    top: 12,
    right: 12,
  },

  // ---- Alerts ----
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  alertBar: {
    width: 4,
    alignSelf: 'stretch',
  },
  alertContent: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#261816',
  },
  alertSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#59413D',
    marginTop: 2,
  },
  alertTime: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 12,
    gap: 4,
  },
  alertTimeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8D706C',
  },

  // ---- Section Separator ----
  sectionSeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginVertical: 8,
    gap: 12,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E1BFB9',
  },

  // ---- Geofence Summary ----
  geoSummaryRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  geoSummaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  geoSummaryNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: '#261816',
  },
  geoSummaryLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#8D706C',
    marginTop: 2,
  },
  geoSummaryDivider: {
    width: 1,
    backgroundColor: '#E1BFB9',
    marginVertical: 4,
  },

  // ---- Geofence Categories ----
  geoCategoryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  geoCategoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  geoCategoryBar: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: 12,
  },
  geoCategoryInfo: {
    flex: 1,
  },
  geoCategoryTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#261816',
  },
  geoCategoryDesc: {
    fontSize: 12,
    fontWeight: '500',
    color: '#59413D',
    marginTop: 2,
  },
  geoCategoryCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF0EE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
  },
  geoCategoryCountText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#261816',
  },

  // ---- Zone List ----
  zoneList: {
    borderTopWidth: 1,
    borderTopColor: '#F7DDD9',
    paddingHorizontal: 14,
    paddingBottom: 12,
  },
  zoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F7DDD9',
  },
  zoneDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  zoneName: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#261816',
  },
  zoneVehicles: {
    fontSize: 12,
    fontWeight: '500',
    color: '#8D706C',
    marginRight: 8,
  },
  zoneStatusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 100,
  },
  zoneStatusText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
