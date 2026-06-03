import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
  StatusBar,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import {
  ArrowLeft,
  Plus,
  RotateCw,
  Activity,
  ChevronRight,
  MapPin,
  Truck,
  Compass,
  Building2,
  Anchor,
  Globe,
  Milestone,
  User,
  SlidersHorizontal,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 48; // Leaves padding on sides for next card peek if wanted, or full screen card
const ASAS_RED = '#C0392B';

export const GeofenceAnalyticsScreen: React.FC = () => {
  const navigation = useNavigation();

  // Interactive UI states
  const [activeCountry, setActiveCountry] = useState<'Tanzania' | 'Zambia' | 'TZ Ops'>('Tanzania');
  const [activePageIndex, setActivePageIndex] = useState<number>(0);
  const STATUS_BAR_HEIGHT = Platform.OS === 'android' ? (StatusBar.currentHeight || 40) : 44;

  // Carousel scroll listener to update pagination dots dynamically
  const handleCarouselScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const pageIndex = Math.round(contentOffsetX / (SCREEN_WIDTH - 32));
    if (pageIndex !== activePageIndex && pageIndex >= 0 && pageIndex < 3) {
      setActivePageIndex(pageIndex);
    }
  };

  const handleAddZone = () => {
    alert('Launching live geofence drawing interface... Define zone coordinates on the operations map.');
  };

  const handleResync = () => {
    alert('Synchronizing global geofences coordinates from Navixy and AWS Gateways... Complete!');
  };

  const handleSignalActive = () => {
    alert('Fleet cellular signal surveillance mode is healthy and active.');
  };

  // -------------------------------------------------------------
  // MOCK GEOFENCES DATA
  // -------------------------------------------------------------
  const trackedGeofences = [
    { name: 'DAR GEOFENCE', count: 343 },
    { name: 'ASAS TABATA', count: 150 },
    { name: 'KURASINI ALL TOGETHER', count: 101 },
    { name: 'HORIZON NDOLA', count: 47 },
    { name: 'MTWARA GF', count: 71 },
    { name: 'TANGA GF', count: 26 },
    { name: 'ASAS CHAPWA YARD', count: 26 },
    { name: 'ORYX LOADING DEPOT (KIGAMBONI)', count: 11 },
    { name: 'LILONGWE', count: 10 },
  ];

  const parentGeofences = [
    { name: 'DAR GEOFENCE', type: 'Gateway', count: 297, color: '#FDEDEC', icon: <Anchor size={16} color="#C0392B" /> },
    { name: 'KURASINI ZONE', type: 'Zone', count: 68, color: '#E8F8F5', icon: <MapPin size={16} color="#117A65" /> },
    { name: 'MTWARA ZONE', type: 'Zone', count: 24, color: '#FEF9E7', icon: <Compass size={16} color="#B7950B" /> },
    { name: 'DRC REGION', type: 'Region', count: 14, color: '#EEF2FF', icon: <Globe size={16} color="#3F51B5" /> },
  ];

  const standaloneGeofences = [
    { name: 'ASAS IRINGA YARD', type: 'Yard', vehicles: 112, moving: 3, parked: 106, color: '#FDEDEC', icon: <Building2 size={16} color="#C0392B" /> },
    { name: 'HORIZON NDOLA', type: 'Yard', vehicles: 47, moving: 0, parked: 45, color: '#EEF5FF', icon: <Building2 size={16} color="#2980B9" /> },
    { name: 'ASAS CHAPWA YARD', type: 'Border', vehicles: 26, moving: 0, parked: 26, color: '#EBF5FB', icon: <Milestone size={16} color="#2E86C1" /> },
    { name: 'HORIZON LUSAKA YARD', type: 'Yard', vehicles: 24, moving: 1, parked: 23, color: '#FFF5EB', icon: <Building2 size={16} color="#D35400" /> },
    { name: 'EXPREE OIL', type: 'Customer', vehicles: 20, moving: 0, parked: 20, color: '#F4ECF7', icon: <User size={16} color="#8E44AD" /> },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      {/* -------------------------------------------------------------
          STICKY RED HEADER
          ------------------------------------------------------------- */}
      <View style={[styles.header, { height: 56 + STATUS_BAR_HEIGHT, paddingTop: STATUS_BAR_HEIGHT }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <ArrowLeft color="#FFFFFF" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Geofence Analytics</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* -------------------------------------------------------------
            LIVE GEOFENCE MONITORING SECTION
            ------------------------------------------------------------- */}
        <View style={styles.monitoringSection}>
          <View style={styles.overviewHeaderRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.overviewTitle}>Live Geofence Monitoring</Text>
              <View style={styles.subtextRow}>
                <Text style={styles.overviewSubtext}>Network Surveillance Mode</Text>
                <Text style={styles.overviewDot}> • </Text>
                <Text style={[styles.overviewSubtext, { color: ASAS_RED, fontWeight: '700' }]}>
                  TZ Sector
                </Text>
              </View>
            </View>

            {/* Top Right "Add Zone" Action button */}
            <TouchableOpacity
              style={styles.addZoneButton}
              onPress={handleAddZone}
              activeOpacity={0.8}
            >
              <Plus size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
              <Text style={styles.addZoneButtonText}>Add Zone</Text>
            </TouchableOpacity>
          </View>

          {/* Region Tabs & Sub Actions */}
          <View style={styles.filterContainerRow}>
            <View style={styles.countryTabsContainer}>
              {(['Tanzania', 'Zambia', 'TZ Ops'] as const).map((tab) => (
                <TouchableOpacity
                  key={tab}
                  style={[
                    styles.countryTab,
                    activeCountry === tab ? styles.countryTabActive : styles.countryTabInactive,
                  ]}
                  onPress={() => setActiveCountry(tab)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.countryTabText,
                      activeCountry === tab ? styles.countryTabTextActive : styles.countryTabTextInactive,
                    ]}
                  >
                    {tab}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity
                style={styles.outlinedCompactBtn}
                onPress={handleResync}
                activeOpacity={0.7}
              >
                <RotateCw size={12} color="#59413D" style={{ marginRight: 4 }} />
                <Text style={styles.outlinedCompactBtnText}>Resync</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.greenStatusBtn}
                onPress={handleSignalActive}
                activeOpacity={0.7}
              >
                <Activity size={12} color="#27AE60" style={{ marginRight: 4 }} />
                <Text style={styles.greenStatusBtnText}>Signal Active</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* -------------------------------------------------------------
            TRACK GEOFENCES SECTION
            ------------------------------------------------------------- */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeadingTitle}>TRACK GEOFENCES</Text>
          <TouchableOpacity
            onPress={() => alert('Opening complete Tracked Geofences roster...')}
            activeOpacity={0.7}
          >
            <Text style={styles.sectionHeadingAction}>View All</Text>
          </TouchableOpacity>
        </View>

        {/* Compact Grid List */}
        <View style={styles.geofenceGridContainer}>
          {trackedGeofences.map((gf, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.geofenceGridCard}
              activeOpacity={0.7}
              onPress={() => alert(`Selected geofence: ${gf.name}`)}
            >
              <View style={styles.geofenceDotIndicator} />
              <Text style={styles.geofenceGridName} numberOfLines={1} ellipsizeMode="tail">
                {gf.name}
              </Text>
              <View style={styles.geofenceGridBadge}>
                <Text style={styles.geofenceGridBadgeText}>{gf.count}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* -------------------------------------------------------------
            LIVE OBSERVATION SECTION (CAROUSEL)
            ------------------------------------------------------------- */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeadingTitle}>LIVE OBSERVATION</Text>
          <TouchableOpacity
            onPress={() => alert('Opening active live observation lists...')}
            activeOpacity={0.7}
          >
            <Text style={styles.sectionHeadingAction}>View All</Text>
          </TouchableOpacity>
        </View>

        {/* Swipeable ScrollView Carousel Container */}
        <View style={styles.carouselContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleCarouselScroll}
            scrollEventThrottle={16}
            contentContainerStyle={styles.carouselScrollContent}
            snapToInterval={SCREEN_WIDTH - 32}
            snapToAlignment="center"
            decelerationRate="fast"
          >
            {/* Card 1: ASAS TABATA */}
            <View style={styles.observationCard}>
              <View style={styles.obsCardHeader}>
                <View>
                  <Text style={styles.obsCardTitle}>ASAS TABATA</Text>
                  <Text style={styles.obsCardAssetsInfo}>150 Assets Inside</Text>
                </View>
                <Text style={styles.obsCardTimeAvg}>Avg: 90d 14h</Text>
              </View>

              {/* Sample Vehicles inside */}
              <View style={styles.obsVehicleList}>
                <View style={styles.obsVehicleRow}>
                  <Text style={styles.obsVehicleName}>620425</Text>
                  <View style={styles.obsVehicleDetailRow}>
                    <Text style={styles.obsVehicleDuration}>253d 16h</Text>
                    <View style={[styles.statusBadge, styles.statusBadgeOffline]}>
                      <Text style={styles.statusBadgeTextOffline}>PARKED (OFFLINE)</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.obsVehicleRow}>
                  <Text style={styles.obsVehicleName}>T454 DMN - Scania TR</Text>
                  <View style={styles.obsVehicleDetailRow}>
                    <Text style={styles.obsVehicleDuration}>9h 41m</Text>
                    <View style={[styles.statusBadge, styles.statusBadgeParked]}>
                      <Text style={styles.statusBadgeTextParked}>PARKED</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.obsVehicleRow}>
                  <Text style={styles.obsVehicleName}>T 814 DKX SCANIA TR</Text>
                  <View style={styles.obsVehicleDetailRow}>
                    <Text style={styles.obsVehicleDuration}>14h 48m</Text>
                    <View style={[styles.statusBadge, styles.statusBadgeParked]}>
                      <Text style={styles.statusBadgeTextParked}>PARKED</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.obsVehicleRow}>
                  <Text style={styles.obsVehicleName}>T 946 DQG BENZ TR</Text>
                  <View style={styles.obsVehicleDetailRow}>
                    <Text style={styles.obsVehicleDuration}>1h 21m</Text>
                    <View style={[styles.statusBadge, styles.statusBadgeOffline]}>
                      <Text style={styles.statusBadgeTextOffline}>PARKED (OFFLINE)</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Bottom Assets count banner */}
              <TouchableOpacity
                style={styles.obsCardFooterRow}
                onPress={() => alert('Navigating to full ASAS TABATA asset records...')}
                activeOpacity={0.7}
              >
                <Text style={styles.obsCardFooterText}>+147 more assets</Text>
                <ChevronRight size={14} color="#C0392B" />
              </TouchableOpacity>
            </View>

            {/* Card 2: KURASINI ALL TOGETHER */}
            <View style={styles.observationCard}>
              <View style={styles.obsCardHeader}>
                <View>
                  <Text style={styles.obsCardTitle}>KURASINI ALL TOGETHER</Text>
                  <Text style={styles.obsCardAssetsInfo}>101 Assets Inside</Text>
                </View>
                <Text style={styles.obsCardTimeAvg}>Avg: 10d 22h</Text>
              </View>

              {/* Sample Vehicles inside */}
              <View style={styles.obsVehicleList}>
                <View style={styles.obsVehicleRow}>
                  <Text style={styles.obsVehicleName}>T814 BTM - SCANIA TR</Text>
                  <View style={styles.obsVehicleDetailRow}>
                    <Text style={styles.obsVehicleDuration}>2h 47m</Text>
                    <View style={[styles.statusBadge, styles.statusBadgeOffline]}>
                      <Text style={styles.statusBadgeTextOffline}>PARKED (OFFLINE)</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.obsVehicleRow}>
                  <Text style={styles.obsVehicleName}>T 805 DQA SCANIA TR</Text>
                  <View style={styles.obsVehicleDetailRow}>
                    <Text style={styles.obsVehicleDuration}>1h 17m</Text>
                    <View style={[styles.statusBadge, styles.statusBadgeOffline]}>
                      <Text style={styles.statusBadgeTextOffline}>PARKED (OFFLINE)</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.obsVehicleRow}>
                  <Text style={styles.obsVehicleName}>T241 DJV-SCANIA G460 TR</Text>
                  <View style={styles.obsVehicleDetailRow}>
                    <Text style={styles.obsVehicleDuration}>2d 5h</Text>
                    <View style={[styles.statusBadge, styles.statusBadgeOffline]}>
                      <Text style={styles.statusBadgeTextOffline}>PARKED (OFFLINE)</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.obsVehicleRow}>
                  <Text style={styles.obsVehicleName}>T 261 CSJ-HOWO TR</Text>
                  <View style={styles.obsVehicleDetailRow}>
                    <Text style={styles.obsVehicleDuration}>474d 18h</Text>
                    <View style={[styles.statusBadge, styles.statusBadgeOffline]}>
                      <Text style={styles.statusBadgeTextOffline}>PARKED (OFFLINE)</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Bottom Assets count banner */}
              <TouchableOpacity
                style={styles.obsCardFooterRow}
                onPress={() => alert('Navigating to full KURASINI asset roster...')}
                activeOpacity={0.7}
              >
                <Text style={styles.obsCardFooterText}>+97 more assets</Text>
                <ChevronRight size={14} color="#C0392B" />
              </TouchableOpacity>
            </View>

            {/* Card 3: DAR GEOFENCE */}
            <View style={styles.observationCard}>
              <View style={styles.obsCardHeader}>
                <View>
                  <Text style={styles.obsCardTitle}>DAR GEOFENCE</Text>
                  <Text style={styles.obsCardAssetsInfo}>243 Assets Inside</Text>
                </View>
                <Text style={styles.obsCardTimeAvg}>Avg: 88d 13h</Text>
              </View>

              {/* Sample Vehicles inside */}
              <View style={styles.obsVehicleList}>
                <View style={styles.obsVehicleRow}>
                  <Text style={styles.obsVehicleName}>620425</Text>
                  <View style={styles.obsVehicleDetailRow}>
                    <Text style={styles.obsVehicleDuration}>253d 16h</Text>
                    <View style={[styles.statusBadge, styles.statusBadgeOffline]}>
                      <Text style={styles.statusBadgeTextOffline}>PARKED (OFFLINE)</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.obsVehicleRow}>
                  <Text style={styles.obsVehicleName}>T 166 DHE TOYOTA</Text>
                  <View style={styles.obsVehicleDetailRow}>
                    <Text style={styles.obsVehicleDuration}>5h 44m</Text>
                    <View style={[styles.statusBadge, styles.statusBadgeParked]}>
                      <Text style={styles.statusBadgeTextParked}>PARKED</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.obsVehicleRow}>
                  <Text style={styles.obsVehicleName}>T814 BTM - SCANIA TR</Text>
                  <View style={styles.obsVehicleDetailRow}>
                    <Text style={styles.obsVehicleDuration}>2h 47m</Text>
                    <View style={[styles.statusBadge, styles.statusBadgeOffline]}>
                      <Text style={styles.statusBadgeTextOffline}>PARKED (OFFLINE)</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.obsVehicleRow}>
                  <Text style={styles.obsVehicleName}>T 915 DRH HOWO TR</Text>
                  <View style={styles.obsVehicleDetailRow}>
                    <Text style={styles.obsVehicleDuration}>1d 14h</Text>
                    <View style={[styles.statusBadge, styles.statusBadgeParked]}>
                      <Text style={styles.statusBadgeTextParked}>PARKED</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Bottom Assets count banner */}
              <TouchableOpacity
                style={styles.obsCardFooterRow}
                onPress={() => alert('Navigating to complete DAR GEOFENCE asset list...')}
                activeOpacity={0.7}
              >
                <Text style={styles.obsCardFooterText}>+339 more assets</Text>
                <ChevronRight size={14} color="#C0392B" />
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Indicator Pagination Dots */}
          <View style={styles.paginationRow}>
            {[0, 1, 2].map((dotIndex) => (
              <View
                key={dotIndex}
                style={[
                  styles.paginationDot,
                  activePageIndex === dotIndex ? styles.paginationDotActive : styles.paginationDotInactive,
                ]}
              />
            ))}
          </View>
        </View>

        {/* -------------------------------------------------------------
            GEOFENCE ASSET COUNT SECTION
            ------------------------------------------------------------- */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeadingTitle}>GEOFENCE ASSET COUNT</Text>
          <Text style={styles.timestampLabel}>Last updated: 01:05:40 EAT</Text>
        </View>

        {/* Three KPI Cards (Side-by-side) */}
        <View style={styles.kpiCardsContainer}>
          <View style={styles.kpiCard}>
            <View style={[styles.kpiIconBox, { backgroundColor: '#FDF2F0' }]}>
              <Truck size={16} color="#BA1A1A" />
            </View>
            <Text style={styles.kpiLabel}>TOTAL FLEET</Text>
            <Text style={styles.kpiValue}>1,353</Text>
          </View>

          <View style={styles.kpiCard}>
            <View style={[styles.kpiIconBox, { backgroundColor: '#EAFDF2' }]}>
              <MapPin size={16} color="#27AE60" />
            </View>
            <Text style={styles.kpiLabel}>IN GEOFENCES</Text>
            <Text style={styles.kpiValue}>
              732 <Text style={styles.kpiPercentTagPositive}>(54%)</Text>
            </Text>
          </View>

          <View style={styles.kpiCard}>
            <View style={[styles.kpiIconBox, { backgroundColor: '#FFF7ED' }]}>
              <SlidersHorizontal size={16} color="#E67E22" />
            </View>
            <Text style={styles.kpiLabel}>ON ROAD</Text>
            <Text style={styles.kpiValue}>
              621 <Text style={styles.kpiPercentTagNeutral}>(46%)</Text>
            </Text>
          </View>
        </View>

        {/* -------------------------------------------------------------
            PARENT GEOFENCES (4) SECTION
            ------------------------------------------------------------- */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeadingTitle}>PARENT GEOFENCES (4)</Text>
          <TouchableOpacity
            onPress={() => alert('Launching Parent Geofences full details panel...')}
            activeOpacity={0.7}
          >
            <Text style={styles.sectionHeadingAction}>View All</Text>
          </TouchableOpacity>
        </View>

        {/* Parent Geofences lists */}
        <View style={styles.listCardWrapper}>
          {parentGeofences.map((parent, idx) => (
            <TouchableOpacity
              key={idx}
              style={[
                styles.listItemRow,
                idx === parentGeofences.length - 1 && { borderBottomWidth: 0 },
              ]}
              onPress={() => alert(`Details for parent geofence: ${parent.name}`)}
              activeOpacity={0.6}
            >
              <View style={[styles.listItemIconBox, { backgroundColor: parent.color }]}>
                {parent.icon}
              </View>
              <View style={styles.listItemTextContainer}>
                <Text style={styles.listItemTitle}>{parent.name}</Text>
                <Text style={styles.listItemSubtitle}>{parent.type}</Text>
              </View>
              <View style={styles.listItemRightContainer}>
                <Text style={styles.listItemCountText}>{parent.count} vehicles</Text>
                <ChevronRight size={14} color="#8D706C" style={{ marginLeft: 4 }} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* -------------------------------------------------------------
            STANDALONE GEOFENCES (30) SECTION
            ------------------------------------------------------------- */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeadingTitle}>STANDALONE GEOFENCES (30)</Text>
          <TouchableOpacity
            onPress={() => alert('Opening Standalone Geofences directory roster...')}
            activeOpacity={0.7}
          >
            <Text style={styles.sectionHeadingAction}>View All</Text>
          </TouchableOpacity>
        </View>

        {/* Standalone list items */}
        <View style={styles.listCardWrapper}>
          {standaloneGeofences.map((standalone, idx) => (
            <TouchableOpacity
              key={idx}
              style={[
                styles.listItemRow,
                idx === standaloneGeofences.length - 1 && { borderBottomWidth: 0 },
              ]}
              onPress={() => alert(`Details for standalone geofence: ${standalone.name}`)}
              activeOpacity={0.6}
            >
              <View style={[styles.listItemIconBox, { backgroundColor: standalone.color }]}>
                {standalone.icon}
              </View>
              <View style={styles.listItemTextContainer}>
                <Text style={styles.listItemTitle}>{standalone.name}</Text>
                <Text style={styles.listItemSubtitle}>{standalone.type}</Text>
                {/* Stats indicators (moving / parked) */}
                <View style={styles.listItemStatsRow}>
                  <Text style={[styles.listStatTag, { color: '#27AE60' }]}>
                    {standalone.moving} moving
                  </Text>
                  <Text style={styles.listStatDivider}>•</Text>
                  <Text style={[styles.listStatTag, { color: '#8D706C' }]}>
                    {standalone.parked} parked
                  </Text>
                </View>
              </View>
              <View style={styles.listItemRightContainer}>
                <Text style={styles.listItemCountText}>{standalone.vehicles} vehicles</Text>
                <ChevronRight size={14} color="#8D706C" style={{ marginLeft: 4 }} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
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

  // ---- Monitoring Header Section ----
  monitoringSection: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2ECEB',
  },
  overviewHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  overviewTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#261816',
    letterSpacing: 0.5,
  },
  subtextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  overviewSubtext: {
    fontSize: 12,
    color: '#8D706C',
  },
  overviewDot: {
    fontSize: 12,
    color: '#8D706C',
    marginHorizontal: 4,
  },
  addZoneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ASAS_RED,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 6,
    shadowColor: ASAS_RED,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  addZoneButtonText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  filterContainerRow: {
    flexDirection: 'column',
    gap: 12,
    marginTop: 16,
  },
  countryTabsContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  countryTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
    borderWidth: 1,
  },
  countryTabActive: {
    backgroundColor: ASAS_RED,
    borderColor: ASAS_RED,
  },
  countryTabInactive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#ECE0DF',
  },
  countryTabText: {
    fontSize: 12,
    fontWeight: '700',
  },
  countryTabTextActive: {
    color: '#FFFFFF',
  },
  countryTabTextInactive: {
    color: '#59413D',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  outlinedCompactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ECE0DF',
    backgroundColor: '#FFFFFF',
  },
  outlinedCompactBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#59413D',
  },
  greenStatusBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D4EFDF',
    backgroundColor: '#EAF2F8',
  },
  greenStatusBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#27AE60',
  },

  // ---- Section Titles ----
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 8,
  },
  sectionHeadingTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#8D706C',
    letterSpacing: 1.5,
  },
  sectionHeadingAction: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3498DB',
  },
  timestampLabel: {
    fontSize: 11,
    color: '#8D706C',
  },

  // ---- Track Geofences Grid ----
  geofenceGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 8,
  },
  geofenceGridCard: {
    width: (SCREEN_WIDTH - 32 - 8) / 2, // 2-column with padding & gap accounting
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F2ECEB',
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#261816',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1,
  },
  geofenceDotIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#3498DB',
    marginRight: 6,
  },
  geofenceGridName: {
    fontSize: 10,
    fontWeight: '800',
    color: '#261816',
    flex: 1,
    marginRight: 6,
  },
  geofenceGridBadge: {
    backgroundColor: '#EBF5FB',
    borderRadius: 4,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  geofenceGridBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2980B9',
  },

  // ---- Live Observation Carousel ----
  carouselContainer: {
    marginTop: 4,
  },
  carouselScrollContent: {
    paddingHorizontal: 16,
    gap: 16,
  },
  observationCard: {
    width: SCREEN_WIDTH - 32,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F2ECEB',
    padding: 16,
    shadowColor: '#261816',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  obsCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#FAF6F5',
    paddingBottom: 10,
    marginBottom: 8,
  },
  obsCardTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#261816',
  },
  obsCardAssetsInfo: {
    fontSize: 11,
    color: '#8D706C',
    marginTop: 2,
  },
  obsCardTimeAvg: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8D706C',
    backgroundColor: '#FAF6F5',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  obsVehicleList: {
    marginVertical: 4,
  },
  obsVehicleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#FAF6F5',
  },
  obsVehicleName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#261816',
    flex: 1,
    marginRight: 10,
  },
  obsVehicleDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  obsVehicleDuration: {
    fontSize: 11,
    color: '#8D706C',
  },
  statusBadge: {
    borderRadius: 4,
    paddingVertical: 2,
    paddingHorizontal: 6,
    minWidth: 90,
    alignItems: 'center',
  },
  statusBadgeOffline: {
    backgroundColor: '#F2F4F4',
  },
  statusBadgeParked: {
    backgroundColor: '#EAF2F8',
  },
  statusBadgeTextOffline: {
    fontSize: 8,
    fontWeight: '800',
    color: '#7F8C8D',
  },
  statusBadgeTextParked: {
    fontSize: 8,
    fontWeight: '800',
    color: '#2980B9',
  },
  obsCardFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    marginTop: 4,
  },
  obsCardFooterText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#C0392B',
  },
  paginationRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
    marginBottom: 8,
  },
  paginationDot: {
    height: 6,
    borderRadius: 3,
  },
  paginationDotActive: {
    width: 14,
    backgroundColor: ASAS_RED,
  },
  paginationDotInactive: {
    width: 6,
    backgroundColor: '#D2D2D7',
  },

  // ---- KPI Cards (Side-by-side) ----
  kpiCardsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F2ECEB',
    padding: 12,
    shadowColor: '#261816',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1,
  },
  kpiIconBox: {
    width: 28,
    height: 28,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  kpiLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#8D706C',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  kpiValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#261816',
  },
  kpiPercentTagPositive: {
    fontSize: 12,
    color: '#27AE60',
    fontWeight: '800',
  },
  kpiPercentTagNeutral: {
    fontSize: 12,
    color: '#E67E22',
    fontWeight: '800',
  },

  // ---- Parent & Standalone row lists ----
  listCardWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#F2ECEB',
    shadowColor: '#261816',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  listItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#FAF6F5',
  },
  listItemIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  listItemTextContainer: {
    flex: 1,
    marginRight: 10,
  },
  listItemTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#261816',
  },
  listItemSubtitle: {
    fontSize: 11,
    color: '#8D706C',
    marginTop: 2,
  },
  listItemRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listItemCountText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3498DB',
  },
  listItemStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  listStatTag: {
    fontSize: 10,
    fontWeight: '700',
  },
  listStatDivider: {
    fontSize: 10,
    color: '#ECE0DF',
  },
});
