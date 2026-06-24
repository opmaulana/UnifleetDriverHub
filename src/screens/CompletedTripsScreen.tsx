import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { GlobalHeader } from '../components/GlobalHeader';
import { theme } from '../theme/theme';
import { CheckCircle, ChevronRight, Calendar, ChevronDown, Route, Truck, Clock } from 'lucide-react-native';
import { supabase } from '../lib/supabase';
import { useStore } from '../store/useStore';

const MOCK_COMPLETED_TRIPS = [
  {
    id: '123',
    tripNumber: '123',
    origin: 'Dar es Salaam',
    destination: 'Ndola',
    distance: '1,324 km',
    duration: '18h 45m',
    convoySize: 4,
    status: 'Completed',
    date: '12 May 2025',
    time: '08:15 PM',
  },
  {
    id: '122',
    tripNumber: '122',
    origin: 'Lusaka',
    destination: 'Dar es Salaam',
    distance: '1,860 km',
    duration: '22h 10m',
    convoySize: 4,
    status: 'Completed',
    date: '09 May 2025',
    time: '07:30 PM',
  },
  {
    id: '121',
    tripNumber: '121',
    origin: 'Ndola',
    destination: 'Lusaka',
    distance: '327 km',
    duration: '5h 20m',
    convoySize: 4,
    status: 'Completed',
    date: '06 May 2025',
    time: '05:45 PM',
  },
  {
    id: '120',
    tripNumber: '120',
    origin: 'Dar es Salaam',
    destination: 'Mbeya',
    distance: '1,045 km',
    duration: '15h 30m',
    convoySize: 4,
    status: 'Completed',
    date: '02 May 2025',
    time: '09:10 PM',
  },
  {
    id: '119',
    tripNumber: '119',
    origin: 'Mbeya',
    destination: 'Ndola',
    distance: '1,692 km',
    duration: '20h 5m',
    convoySize: 4,
    status: 'Completed',
    date: '28 Apr 2025',
    time: '06:20 PM',
  },
];

export const CompletedTripsScreen = () => {
  const { user } = useStore();
  const [tripsData, setTripsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompletedTrips = async () => {
      try {
        setLoading(true);
        let trackerName = user?.tracker_name;
        
        if (!trackerName) {
          setTripsData(MOCK_COMPLETED_TRIPS);
          return;
        }

        const { data, error } = await supabase
          .from('live_trips')
          .select('*')
          .ilike('tracker_name', `%${trackerName}%`)
          .order('start_time', { ascending: false })
          .limit(30);

        if (error) {
          console.warn('Error fetching completed trips:', error);
          setTripsData(MOCK_COMPLETED_TRIPS);
          return;
        }

        if (data && data.length > 0) {
          const mapped = data.map((t: any) => {
            let formattedDate = 'Recent';
            let formattedTime = '';
            if (t.start_time) {
              const d = new Date(t.start_time);
              if (!isNaN(d.getTime())) {
                formattedDate = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
                formattedTime = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              }
            }

            const dist = Number(t.distance_km) || 0;
            const durationMin = t.duration_seconds ? Math.round(t.duration_seconds / 60) : 0;
            const durationHrs = Math.floor(durationMin / 60);
            const durationMinsLeft = durationMin % 60;
            const durationText = durationHrs > 0 ? `${durationHrs}h ${durationMinsLeft}m` : `${durationMin}m`;

            const tripNum = t.trip_number || String(t.id).slice(-3);

            return {
              id: String(t.id),
              tripNumber: tripNum,
              origin: t.start_location || 'Dar es Salaam',
              destination: t.end_location || 'Ndola',
              distance: `${dist.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")} km`,
              duration: durationText || '-- min',
              convoySize: t.convoy_size || 4,
              status: 'Completed',
              date: formattedDate,
              time: formattedTime,
            };
          });
          setTripsData(mapped);
        } else {
          setTripsData(MOCK_COMPLETED_TRIPS);
        }
      } catch (err) {
        console.warn('Exception fetching completed trips:', err);
        setTripsData(MOCK_COMPLETED_TRIPS);
      } finally {
        setLoading(false);
      }
    };

    fetchCompletedTrips();
  }, [user?.tracker_name]);

  const renderItem = ({ item }: any) => (
    <TouchableOpacity 
      style={styles.tripCard}
      onPress={() => console.log("Open Trip Details")}
      activeOpacity={0.7}
    >
      {/* Left Icon Wrap */}
      <View style={styles.tripIconWrap}>
        <Route size={24} color={theme.colors.primary} />
      </View>
      
      {/* Middle Content Area */}
      <View style={styles.tripMainContent}>
        {/* Title & Route */}
        <Text style={styles.tripTitle}>Trip #{item.tripNumber}</Text>
        <Text style={styles.tripRoute}>
          {item.origin} <Text style={{ color: theme.colors.primary, fontWeight: '900' }}>→</Text> {item.destination}
        </Text>
        
        {/* Stats Row */}
        <View style={styles.tripStatsRow}>
          {/* Distance */}
          <View style={styles.tripStatItem}>
            <Text style={styles.tripStatLabel}>Distance</Text>
            <Text style={styles.tripStatValue}>{item.distance}</Text>
          </View>
          
          <View style={styles.tripStatsDivider} />
          
          {/* Duration */}
          <View style={styles.tripStatItem}>
            <Text style={styles.tripStatLabel}>Duration</Text>
            <Text style={styles.tripStatValue}>{item.duration}</Text>
          </View>
          
          <View style={styles.tripStatsDivider} />
          
          {/* Convoy Size */}
          <View style={styles.tripStatItem}>
            <Text style={styles.tripStatLabel}>Convoy Size</Text>
            <View style={styles.convoySizeRow}>
              <Truck size={14} color="#1D1D1F" style={{ marginRight: 4 }} />
              <Text style={styles.tripStatValue}>{item.convoySize}</Text>
            </View>
          </View>
        </View>
      </View>
      
      {/* Right Content Area */}
      <View style={styles.tripRightContent}>
        {/* Status Badge */}
        <View style={styles.completedBadge}>
          <CheckCircle size={10} color="#34C759" style={{ marginRight: 4 }} />
          <Text style={styles.completedBadgeText}>Completed</Text>
        </View>
        
        {/* Date and Time Stack */}
        <View style={styles.dateTimeRow}>
          <Calendar size={14} color="#8E8E93" style={{ marginRight: 6 }} />
          <View>
            <Text style={styles.dateText}>{item.date}</Text>
            <Text style={styles.timeText}>{item.time}</Text>
          </View>
        </View>
      </View>

      {/* Centered Red Navigation Chevron */}
      <ChevronRight size={18} color={theme.colors.primary} style={{ marginLeft: 8 }} />
    </TouchableOpacity>
  );

  const ListHeader = () => (
    <View>
      {/* Overview Card */}
      <View style={styles.overviewCard}>
        <Text style={styles.overviewTitle}>Trips Overview</Text>
        <View style={styles.overviewRow}>
          {/* Total Trips */}
          <View style={styles.overviewCol}>
            <View style={styles.overviewIconWrapSolid}>
              <Route size={18} color={theme.colors.white} />
            </View>
            <Text style={styles.overviewValue}>18</Text>
            <Text style={styles.overviewLabel}>Total Trips</Text>
          </View>

          <View style={styles.overviewDivider} />

          {/* Completed */}
          <View style={styles.overviewCol}>
            <View style={styles.overviewIconWrapOutline}>
              <CheckCircle size={20} color={theme.colors.primary} />
            </View>
            <Text style={styles.overviewValue}>16</Text>
            <Text style={styles.overviewLabel}>Completed</Text>
          </View>

          <View style={styles.overviewDivider} />

          {/* In Progress */}
          <View style={styles.overviewCol}>
            <View style={styles.overviewIconWrapOutline}>
              <Clock size={20} color={theme.colors.primary} />
            </View>
            <Text style={styles.overviewValue}>2</Text>
            <Text style={styles.overviewLabel}>In Progress</Text>
          </View>

          <View style={styles.overviewDivider} />

          {/* This Month */}
          <View style={styles.overviewCol}>
            <View style={styles.overviewIconWrapOutline}>
              <Calendar size={20} color={theme.colors.primary} />
            </View>
            <Text style={styles.overviewValue}>12</Text>
            <Text style={styles.overviewLabel}>This Month</Text>
          </View>
        </View>
      </View>

      <Text style={styles.sectionHeading}>Completed Trips</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <GlobalHeader />
      
      {/* Title Header with Filter */}
      <View style={styles.header}>
        <View style={{ flex: 1, paddingRight: 8 }}>
          <Text style={styles.headerTitle}>Trips</Text>
          <Text style={styles.headerSubtitle}>
            View your completed trips and performance.
          </Text>
        </View>
        <TouchableOpacity style={styles.filterButton} activeOpacity={0.8}>
          <Calendar size={14} color="#1D1D1F" style={{ marginRight: 6 }} />
          <Text style={styles.filterButtonText}>Filter</Text>
          <ChevronDown size={14} color="#1D1D1F" style={{ marginLeft: 6 }} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Fetching database trip records...</Text>
        </View>
      ) : (
        <FlatList
          data={tripsData}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={ListHeader}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1D1D1F',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#6E6E73',
    marginTop: 4,
    lineHeight: 18,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1D1D1F',
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  overviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  overviewTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1D1D1F',
    marginBottom: 16,
  },
  overviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  overviewCol: {
    alignItems: 'center',
    flex: 1,
  },
  overviewIconWrapSolid: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E53935',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  overviewIconWrapOutline: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  overviewValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1D1D1F',
  },
  overviewLabel: {
    fontSize: 10,
    color: '#6E6E73',
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },
  overviewDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E5E5EA',
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1D1D1F',
    marginBottom: 16,
    marginTop: 8,
  },
  tripCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  tripIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFEEEF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tripMainContent: {
    flex: 1,
    paddingRight: 8,
  },
  tripTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1D1D1F',
  },
  tripRoute: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1D1D1F',
    marginTop: 3,
    marginBottom: 10,
  },
  tripStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tripStatItem: {
    flexDirection: 'column',
  },
  tripStatLabel: {
    fontSize: 9,
    color: '#8E8E93',
    fontWeight: '600',
  },
  tripStatValue: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1D1D1F',
    marginTop: 2,
  },
  convoySizeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tripStatsDivider: {
    width: 1,
    height: 18,
    backgroundColor: '#E5E5EA',
    marginHorizontal: 12,
  },
  tripRightContent: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#34C759',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: '#F2F9F3',
    marginBottom: 8,
  },
  completedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#34C759',
  },
  dateTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 10,
    color: '#8E8E93',
    fontWeight: '600',
    textAlign: 'right',
  },
  timeText: {
    fontSize: 9.5,
    color: '#8E8E93',
    marginTop: 1,
    fontWeight: '500',
    textAlign: 'right',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 12,
  },
});
