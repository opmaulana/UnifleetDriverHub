import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import {
  Navigation,
  Truck,
  ChevronUp,
  ChevronDown,
  Wifi,
  WifiOff,
  Locate,
  Satellite,
  Map as MapIcon,
} from 'lucide-react-native';
import { OperationsHeader } from '../../components/operations/OperationsHeader';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';

const ASAS_RED = '#C0392B';
const GREEN = '#27AE60';
const ORANGE = '#E67E22';
const GREY = '#7F8C8D';
const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Default region — Tanzania/Zambia corridor
const DEFAULT_REGION = {
  latitude: -7.5,
  longitude: 36.5,
  latitudeDelta: 12,
  longitudeDelta: 12,
};

// Simulated vehicles at real East Africa coordinates
const vehicles = [
  {
    id: 'TRK-492',
    unitId: '88A-7B9-XQ',
    status: 'moving',
    speed: '62 km/h',
    heading: 'NE',
    location: 'TANZAM Hwy, Km 234',
    lastUpdate: '2m ago',
    latitude: -6.82,
    longitude: 37.66,
  },
  {
    id: 'TRK-114',
    unitId: '21C-4D8-PL',
    status: 'idling',
    speed: '0 km/h',
    heading: '--',
    location: 'Dar Main Yard, Bay 3',
    lastUpdate: '1m ago',
    latitude: -6.78,
    longitude: 39.25,
  },
  {
    id: 'TRK-227',
    unitId: '55F-9A2-WK',
    status: 'moving',
    speed: '78 km/h',
    heading: 'SW',
    location: 'Great North Road, Km 89',
    lastUpdate: '30s ago',
    latitude: -8.85,
    longitude: 33.45,
  },
  {
    id: 'TRK-089',
    unitId: '72B-1E6-MX',
    status: 'offline',
    speed: '--',
    heading: '--',
    location: 'Last: Gate 04',
    lastUpdate: '4h ago',
    latitude: -7.77,
    longitude: 36.32,
  },
  {
    id: 'TRK-301',
    unitId: '44D-8G3-RV',
    status: 'moving',
    speed: '55 km/h',
    heading: 'S',
    location: 'M1 Corridor, Km 18',
    lastUpdate: '45s ago',
    latitude: -9.12,
    longitude: 35.89,
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'moving': return GREEN;
    case 'idling': return ORANGE;
    case 'offline': return GREY;
    default: return GREY;
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'moving': return <Navigation size={14} color={GREEN} />;
    case 'idling': return <Wifi size={14} color={ORANGE} />;
    case 'offline': return <WifiOff size={14} color={GREY} />;
    default: return <WifiOff size={14} color={GREY} />;
  }
};

export const MapScreen = ({ onNavigateToSettings }: { onNavigateToSettings?: () => void }) => {
  const [panelExpanded, setPanelExpanded] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [isSatellite, setIsSatellite] = useState(false);
  const mapRef = useRef<MapView>(null);

  const filters = [
    { id: 'all', label: 'All', count: vehicles.length },
    { id: 'moving', label: 'Moving', count: vehicles.filter(v => v.status === 'moving').length },
    { id: 'idling', label: 'Idling', count: vehicles.filter(v => v.status === 'idling').length },
    { id: 'offline', label: 'Offline', count: vehicles.filter(v => v.status === 'offline').length },
  ];

  const filteredVehicles = activeFilter === 'all'
    ? vehicles
    : vehicles.filter(v => v.status === activeFilter);

  const selected = vehicles.find(v => v.id === selectedVehicle);

  const handleVehicleSelect = (vehicleId: string) => {
    if (selectedVehicle === vehicleId) {
      setSelectedVehicle(null);
      mapRef.current?.animateToRegion(DEFAULT_REGION, 600);
    } else {
      setSelectedVehicle(vehicleId);
      const v = vehicles.find(veh => veh.id === vehicleId);
      if (v) {
        mapRef.current?.animateToRegion(
          {
            latitude: v.latitude,
            longitude: v.longitude,
            latitudeDelta: 0.5,
            longitudeDelta: 0.5,
          },
          800
        );
      }
    }
  };

  return (
    <View style={styles.screen}>
      <OperationsHeader onNavigateToSettings={onNavigateToSettings} />

      {/* Map */}
      <View style={styles.mapContainer}>
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
        >
          {/* Vehicle Markers */}
          {filteredVehicles.map((v) => (
            <Marker
              key={v.id}
              identifier={v.id}
              coordinate={{
                latitude: v.latitude,
                longitude: v.longitude,
              }}
              title={v.id}
              description={`${v.speed} • ${v.location}`}
              onPress={() => handleVehicleSelect(v.id)}
              tracksViewChanges={false}
            >
              {/* Custom marker */}
              <View
                style={[
                  styles.markerOuter,
                  {
                    backgroundColor: getStatusColor(v.status),
                    borderWidth: selectedVehicle === v.id ? 3 : 0,
                    borderColor: '#FFFFFF',
                    width: selectedVehicle === v.id ? 42 : 34,
                    height: selectedVehicle === v.id ? 42 : 34,
                    borderRadius: selectedVehicle === v.id ? 21 : 17,
                  },
                ]}
              >
                <Truck size={selectedVehicle === v.id ? 16 : 14} color="#FFFFFF" />
              </View>
            </Marker>
          ))}
        </MapView>

        {/* Map Controls */}
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
        </View>

        {/* Selected vehicle overlay */}
        {selected && (
          <View style={styles.selectedOverlay}>
            <View style={[styles.selectedDot, { backgroundColor: getStatusColor(selected.status) }]} />
            <View style={styles.selectedInfo}>
              <Text style={styles.selectedTitle}>{selected.id}</Text>
              <Text style={styles.selectedSub}>
                {selected.speed} • {selected.location}
              </Text>
            </View>
            <TouchableOpacity onPress={() => {
              setSelectedVehicle(null);
              mapRef.current?.animateToRegion(DEFAULT_REGION, 600);
            }}>
              <Text style={styles.selectedClose}>✕</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Bottom Panel */}
      <View style={[styles.bottomPanel, panelExpanded && styles.bottomPanelExpanded]}>
        <TouchableOpacity
          style={styles.panelHandle}
          onPress={() => setPanelExpanded(!panelExpanded)}
        >
          <View style={styles.handleBar} />
          <View style={styles.panelHeaderRow}>
            <Text style={styles.panelTitle}>
              Fleet Roster ({filteredVehicles.length})
            </Text>
            {panelExpanded ? (
              <ChevronDown size={18} color="#8D706C" />
            ) : (
              <ChevronUp size={18} color="#8D706C" />
            )}
          </View>
        </TouchableOpacity>

        {/* Filter Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {filters.map((f) => (
            <TouchableOpacity
              key={f.id}
              style={[
                styles.filterPill,
                activeFilter === f.id && styles.filterPillActive,
              ]}
              onPress={() => setActiveFilter(f.id)}
            >
              {f.id !== 'all' && (
                <View
                  style={[styles.filterDot, { backgroundColor: getStatusColor(f.id) }]}
                />
              )}
              <Text
                style={[
                  styles.filterPillText,
                  activeFilter === f.id && styles.filterPillTextActive,
                ]}
              >
                {f.label} ({f.count})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Vehicle List */}
        {panelExpanded && (
          <ScrollView style={styles.vehicleList} showsVerticalScrollIndicator={false}>
            {filteredVehicles.map((v) => (
              <TouchableOpacity
                key={v.id}
                style={[
                  styles.vehicleRow,
                  selectedVehicle === v.id && styles.vehicleRowSelected,
                ]}
                onPress={() => handleVehicleSelect(v.id)}
              >
                <View style={[styles.vehicleIcon, { backgroundColor: getStatusColor(v.status) + '20' }]}>
                  <Truck size={18} color={getStatusColor(v.status)} />
                </View>
                <View style={styles.vehicleInfo}>
                  <View style={styles.vehicleNameRow}>
                    <Text style={styles.vehicleName}>{v.id}</Text>
                    <View style={[styles.statusPill, { backgroundColor: getStatusColor(v.status) + '20' }]}>
                      {getStatusIcon(v.status)}
                      <Text style={[styles.statusPillText, { color: getStatusColor(v.status) }]}>
                        {v.status.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.vehicleLocation}>{v.location}</Text>
                  <View style={styles.vehicleDetailRow}>
                    <Text style={styles.vehicleDetail}>ID: {v.unitId}</Text>
                    <Text style={styles.vehicleDetail}>
                      {v.speed} {v.heading !== '--' ? `• ${v.heading}` : ''}
                    </Text>
                    <Text style={styles.vehicleDetail}>{v.lastUpdate}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFF8F6',
  },

  // ---- Map ----
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  markerOuter: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },

  // ---- Map Controls ----
  mapControls: {
    position: 'absolute',
    right: 12,
    top: 12,
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
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  mapControlBtnActive: {
    backgroundColor: ASAS_RED,
  },

  // ---- Selected Overlay ----
  selectedOverlay: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 68,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  selectedDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  selectedInfo: {
    flex: 1,
  },
  selectedTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#261816',
  },
  selectedSub: {
    fontSize: 12,
    fontWeight: '500',
    color: '#59413D',
    marginTop: 1,
  },
  selectedClose: {
    fontSize: 18,
    color: '#8D706C',
    paddingLeft: 8,
  },

  // ---- Bottom Panel ----
  bottomPanel: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 16,
    paddingBottom: 80,
    maxHeight: 180,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  bottomPanelExpanded: {
    maxHeight: SCREEN_HEIGHT * 0.55,
  },
  panelHandle: {
    paddingTop: 8,
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E1BFB9',
    alignSelf: 'center',
    marginBottom: 10,
  },
  panelHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  panelTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#261816',
  },

  // ---- Filters ----
  filterRow: {
    gap: 8,
    paddingBottom: 12,
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

  // ---- Vehicle List ----
  vehicleList: {
    flex: 1,
  },
  vehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F7DDD9',
  },
  vehicleRowSelected: {
    backgroundColor: '#FFF0EE',
    marginHorizontal: -16,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderBottomWidth: 0,
  },
  vehicleIcon: {
    width: 44,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  vehicleName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#261816',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 100,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  vehicleLocation: {
    fontSize: 13,
    fontWeight: '500',
    color: '#59413D',
    marginTop: 2,
  },
  vehicleDetailRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  vehicleDetail: {
    fontSize: 11,
    fontWeight: '500',
    color: '#8D706C',
  },
});
