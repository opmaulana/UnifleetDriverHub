import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
  StatusBar,
  Image,
} from 'react-native';
import {
  ArrowLeft,
  ChevronRight,
  Smartphone,
  Link,
  Globe,
  Radio,
  Wifi,
  Clock,
  MapPin,
  Signal,
  Key,
  Truck,
  Tag,
  Fuel,
  User,
  Activity,
  BarChart2,
} from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Vehicle } from './VehicleListScreen';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ASAS_RED = '#C0392B';

export const VehicleDetailsScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();

  // Extract the tapped vehicle object from navigation params, with a robust fallback
  const vehicle: Vehicle = route.params?.vehicle || {
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
  };

  const STATUS_BAR_HEIGHT = Platform.OS === 'android' ? (StatusBar.currentHeight || 40) : 44;

  const handleLiveLocation = () => {
    alert(`Routing to Live Map... Visualizing live telemetry tracks for ${vehicle.registration}.`);
  };

  const handleOpenAnalytics = () => {
    alert(`Opening Fleet Analytics Dashboard for vehicle ${vehicle.registration}...`);
  };

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
        <Text style={styles.headerTitle}>Vehicle Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* -------------------------------------------------------------
            16:9 ASPECT RATIO HERO IMAGE
            ------------------------------------------------------------- */}
        <View style={styles.heroImageCard}>
          <View style={styles.heroPlaceholderContent}>
            <Truck size={48} color="#8D706C" style={{ marginBottom: 12 }} />
            <Text style={styles.heroPlaceholderText}>VEHICLE PHOTO PLACEHOLDER</Text>
          </View>
        </View>

        {/* -------------------------------------------------------------
            VEHICLE IDENTITY CARD
            ------------------------------------------------------------- */}
        <View style={styles.identityCard}>
          <View style={styles.identityLeft}>
            <View style={styles.identityRegRow}>
              <Text style={styles.identityReg}>{vehicle.registration}</Text>
              {/* Status Badge */}
              <View style={[
                styles.statusBadge,
                { backgroundColor: vehicle.status === 'Active' ? '#EAFDF2' : vehicle.status === 'Idle' ? '#FFF5EB' : '#FDEDEC' }
              ]}>
                <View style={[
                  styles.statusDot,
                  { backgroundColor: vehicle.status === 'Active' ? '#27AE60' : vehicle.status === 'Idle' ? '#E67E22' : '#BA1A1A' }
                ]} />
                <Text style={[
                  styles.statusBadgeText,
                  { color: vehicle.status === 'Active' ? '#27AE60' : vehicle.status === 'Idle' ? '#D35400' : '#C0392B' }
                ]}>
                  {vehicle.status}
                </Text>
              </View>
            </View>
            <Text style={styles.identityModel}>{vehicle.model}</Text>
            <View style={styles.identitySpecRow}>
              <View style={[
                styles.categoryBadge,
                { backgroundColor: vehicle.category === 'Fuel Truck' ? '#EAFDF2' : vehicle.category === 'LPG Truck' ? '#FFF5EB' : '#EBF5FB' }
              ]}>
                <Text style={[
                  styles.categoryBadgeText,
                  { color: vehicle.category === 'Fuel Truck' ? '#27AE60' : vehicle.category === 'LPG Truck' ? '#D35400' : '#2980B9' }
                ]}>
                  {vehicle.category}
                </Text>
              </View>
              <Text style={styles.identityTransporter}>{vehicle.transporter}</Text>
            </View>
          </View>
          <View style={styles.identityRight}>
            <ChevronRight size={20} color="#8D706C" />
          </View>
        </View>

        {/* -------------------------------------------------------------
            QUICK STATS AREA (SIDE-BY-SIDE CARDS)
            ------------------------------------------------------------- */}
        <View style={styles.quickStatsRow}>
          {/* Left Stats Card */}
          <View style={styles.statCard}>
            <View style={styles.statItem}>
              <Smartphone size={16} color="#8D706C" style={styles.statIcon} />
              <View>
                <Text style={styles.statLabel}>Tracker ID</Text>
                <Text style={styles.statValue}>{vehicle.trackerId}</Text>
              </View>
            </View>
            <View style={styles.statItem}>
              <Link size={16} color="#8D706C" style={styles.statIcon} />
              <View>
                <Text style={styles.statLabel}>Source ID</Text>
                <Text style={styles.statValue}>{vehicle.sourceId}</Text>
              </View>
            </View>
            <View style={styles.statItem}>
              <Globe size={16} color="#8D706C" style={styles.statIcon} />
              <View>
                <Text style={styles.statLabel}>Country</Text>
                <Text style={styles.statValue}>{vehicle.country}</Text>
              </View>
            </View>
            <View style={styles.statItem}>
              <Radio size={16} color="#8D706C" style={styles.statIcon} />
              <View>
                <Text style={styles.statLabel}>Signal</Text>
                <Text style={styles.statValue}>{vehicle.signal}</Text>
              </View>
            </View>
          </View>

          {/* Right Stats Card */}
          <View style={styles.statCard}>
            <View style={styles.statItem}>
              <Wifi size={16} color="#8D706C" style={styles.statIcon} />
              <View>
                <Text style={styles.statLabel}>Connection Status</Text>
                <Text style={[
                  styles.statValue,
                  { color: vehicle.status === 'Offline' ? '#BA1A1A' : '#27AE60', fontWeight: '800' }
                ]}>
                  {vehicle.connectionStatus}
                </Text>
              </View>
            </View>
            <View style={styles.statItem}>
              <Clock size={16} color="#8D706C" style={styles.statIcon} />
              <View>
                <Text style={styles.statLabel}>Last Update</Text>
                <Text style={styles.statValue}>{vehicle.lastUpdate === '3 days ago' || vehicle.lastUpdate === '2 days ago' ? 'Offline' : '22:29:35'}</Text>
              </View>
            </View>
            <View style={styles.statItem}>
              <MapPin size={16} color="#8D706C" style={styles.statIcon} />
              <View>
                <Text style={styles.statLabel}>GPS Signal</Text>
                <Text style={[
                  styles.statValue,
                  { color: vehicle.status === 'Offline' ? '#BA1A1A' : '#27AE60', fontWeight: '800' }
                ]}>
                  {vehicle.gpsSignal}
                </Text>
              </View>
            </View>
            <View style={styles.statItem}>
              <Signal size={16} color="#8D706C" style={styles.statIcon} />
              <View>
                <Text style={styles.statLabel}>GSM Signal</Text>
                <Text style={styles.statValue}>{vehicle.gsmSignal}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* -------------------------------------------------------------
            REGISTRATION SECTION (3-COLUMN LAYOUT)
            ------------------------------------------------------------- */}
        <View style={styles.specsCard}>
          <Text style={styles.specsCardHeader}>REGISTRATION</Text>
          <View style={styles.registrationGrid}>
            <View style={styles.regCol}>
              <Text style={styles.regLabel}>Registration Number</Text>
              <Text style={styles.regValue}>{vehicle.registration}</Text>
            </View>
            <View style={styles.regCol}>
              <Text style={styles.regLabel}>Country</Text>
              <Text style={styles.regValue}>{vehicle.country === 'Tanzania' ? 'TZ' : 'ZM'}</Text>
            </View>
            <View style={styles.regCol}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <Key size={12} color="#8D706C" style={{ marginRight: 4 }} />
                <Text style={styles.regLabel}>Vehicle Key</Text>
              </View>
              <Text style={styles.regValue}>tracker:{vehicle.trackerId}</Text>
            </View>
          </View>
        </View>

        {/* -------------------------------------------------------------
            TECHNICAL INFORMATION
            ------------------------------------------------------------- */}
        <View style={styles.specsCard}>
          <Text style={styles.specsCardHeader}>TECHNICAL INFORMATION</Text>
          <View style={styles.techList}>
            <View style={styles.techItem}>
              <View style={styles.techLeft}>
                <Truck size={16} color="#8D706C" style={{ marginRight: 10 }} />
                <Text style={styles.techLabel}>Brand</Text>
              </View>
              <Text style={styles.techValue}>{vehicle.model.split(' ')[0]}</Text>
            </View>

            <View style={styles.techItem}>
              <View style={styles.techLeft}>
                <Tag size={16} color="#8D706C" style={{ marginRight: 10 }} />
                <Text style={styles.techLabel}>Model</Text>
              </View>
              <Text style={styles.techValue}>{vehicle.model.split(' ').slice(1).join(' ') || 'Standard'}</Text>
            </View>

            <View style={styles.techItem}>
              <View style={styles.techLeft}>
                <Fuel size={16} color="#8D706C" style={{ marginRight: 10 }} />
                <Text style={styles.techLabel}>Vehicle Type</Text>
              </View>
              <Text style={styles.techValue}>{vehicle.category.split(' ')[0]}</Text>
            </View>

            <View style={styles.techItem}>
              <View style={styles.techLeft}>
                <Smartphone size={16} color="#8D706C" style={{ marginRight: 10 }} />
                <Text style={styles.techLabel}>Tracker ID</Text>
              </View>
              <Text style={styles.techValue}>{vehicle.trackerId}</Text>
            </View>

            <View style={styles.techItem}>
              <View style={styles.techLeft}>
                <Link size={16} color="#8D706C" style={{ marginRight: 10 }} />
                <Text style={styles.techLabel}>Source ID</Text>
              </View>
              <Text style={styles.techValue}>{vehicle.sourceId}</Text>
            </View>
          </View>
        </View>

        {/* -------------------------------------------------------------
            DRIVER INFORMATION
            ------------------------------------------------------------- */}
        <View style={styles.specsCard}>
          <Text style={styles.specsCardHeader}>DRIVER INFORMATION</Text>
          <View style={styles.driverContainer}>
            {/* Driver Photo Placeholder */}
            <View style={styles.driverPhotoBox}>
              <User size={30} color="#8D706C" />
              <Text style={styles.driverPhotoLabel}>Driver Photo</Text>
            </View>

            <View style={styles.driverDetails}>
              <View style={styles.driverDetailRow}>
                <Text style={styles.driverLabel}>Name</Text>
                <Text style={styles.driverValueText}>Not Assigned</Text>
              </View>
              <View style={styles.driverDetailRow}>
                <Text style={styles.driverLabel}>Phone</Text>
                <Text style={styles.driverValueText}>-</Text>
              </View>
              <View style={styles.driverDetailRow}>
                <Text style={styles.driverLabel}>License</Text>
                <Text style={styles.driverValueText}>-</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Spacing for footer */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* -------------------------------------------------------------
          STICKY BOTTOM ACTIONS
          ------------------------------------------------------------- */}
      <View style={styles.stickyFooter}>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={handleLiveLocation}
          activeOpacity={0.8}
        >
          <MapPin size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.primaryBtnText}>View Live Location</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={handleOpenAnalytics}
          activeOpacity={0.7}
        >
          <BarChart2 size={18} color="#C0392B" style={{ marginRight: 8 }} />
          <Text style={styles.secondaryBtnText}>Open Vehicle Analytics</Text>
        </TouchableOpacity>
      </View>
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
  scrollContainer: {
    flex: 1,
    backgroundColor: '#FAF6F5',
  },
  scrollContent: {
    paddingBottom: 40,
  },

  // ---- 16:9 Aspect Ratio Hero Photo ----
  heroImageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 16,
    height: (SCREEN_WIDTH - 32) * (9 / 16),
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F2ECEB',
    shadowColor: '#261816',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  heroPlaceholderContent: {
    flex: 1,
    backgroundColor: '#F5ECEB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroPlaceholderText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#8D706C',
    letterSpacing: 1.5,
  },

  // ---- Identity Card ----
  identityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    borderLeftWidth: 6,
    borderLeftColor: '#27AE60', // Matches default 'Active' status strip
  },
  identityLeft: {
    flex: 1,
    marginRight: 12,
  },
  identityRegRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  identityReg: {
    fontSize: 22,
    fontWeight: '900',
    color: '#261816',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 999,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  identityModel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#59413D',
    marginTop: 4,
  },
  identitySpecRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 8,
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
  identityTransporter: {
    fontSize: 12,
    color: '#8D706C',
  },
  identityRight: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ---- Quick Stats Cards ----
  quickStatsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginTop: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F2ECEB',
    padding: 12,
    shadowColor: '#261816',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    marginRight: 10,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#8D706C',
  },
  statValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#261816',
    marginTop: 2,
  },

  // ---- Registration / Tech / Driver Card ----
  specsCard: {
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
  },
  specsCardHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#8D706C',
    letterSpacing: 1.5,
    borderBottomWidth: 1,
    borderBottomColor: '#FAF6F5',
    paddingBottom: 10,
    marginBottom: 12,
  },
  registrationGrid: {
    flexDirection: 'row',
  },
  regCol: {
    flex: 1,
  },
  regLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#8D706C',
  },
  regValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#261816',
    marginTop: 4,
  },
  techList: {
    gap: 12,
  },
  techItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  techLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  techLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#59413D',
  },
  techValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#261816',
  },

  // ---- Driver Card ----
  driverContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  driverPhotoBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FAF6F5',
    borderWidth: 1,
    borderColor: '#ECE0DF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  driverPhotoLabel: {
    fontSize: 8,
    color: '#8D706C',
    fontWeight: '600',
    marginTop: 2,
  },
  driverDetails: {
    flex: 1,
    gap: 6,
  },
  driverDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  driverLabel: {
    fontSize: 12,
    color: '#8D706C',
    fontWeight: '600',
  },
  driverValueText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#261816',
  },

  // ---- Sticky Footer Actions ----
  stickyFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#ECE0DF',
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    flexDirection: 'column',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 16,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ASAS_RED,
    height: 48,
    borderRadius: 8,
    shadowColor: ASAS_RED,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  primaryBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    height: 48,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: ASAS_RED,
  },
  secondaryBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: ASAS_RED,
  },
});
