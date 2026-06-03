import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { GlobalHeader } from '../components/GlobalHeader';
import { theme } from '../theme/theme';
import { Card } from '../components/Card';
import { CheckCircle, MapPin, ChevronRight, Calendar } from 'lucide-react-native';
import { supabase } from '../lib/supabase';
import { useStore } from '../store/useStore';

export const CompletedTripsScreen = () => {
  const { user } = useStore();
  const [tripsData, setTripsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.tracker_name) {
      setLoading(false);
      return;
    }

    const fetchCompletedTrips = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('live_trips')
          .select('*')
          .ilike('tracker_name', `%${user.tracker_name}%`)
          .order('start_time', { ascending: false })
          .limit(30);

        if (error) {
          console.warn('Error fetching completed trips:', error);
          return;
        }

        if (data) {
          const mapped = data.map((t: any) => {
            // Format date nicely
            let formattedDate = t.trip_date || 'Recent';
            if (t.start_time) {
              const d = new Date(t.start_time);
              if (!isNaN(d.getTime())) {
                formattedDate = d.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' });
              }
            }

            const dist = Number(t.distance_km) || 0;
            // KSh 120 per km + 1000 KSh base pay
            const simulatedEarnings = Math.round(dist * 120 + 1000);

            // Pickup & Dropoff names
            const pickup = t.start_lat && t.start_lng
              ? `Origin (lat: ${Number(t.start_lat).toFixed(4)}, lng: ${Number(t.start_lng).toFixed(4)})`
              : 'Active Corridor';
            const dropoff = t.end_lat && t.end_lng
              ? `Destination (lat: ${Number(t.end_lat).toFixed(4)}, lng: ${Number(t.end_lng).toFixed(4)})`
              : 'Endpoint Corridor';

            return {
              id: String(t.id),
              date: formattedDate,
              pickup,
              dropoff,
              earnings: `KSh ${simulatedEarnings.toLocaleString()}`,
              distance: `${dist.toFixed(1)} km`,
              duration: t.duration_seconds ? `${Math.round(t.duration_seconds / 60)} min` : '-- min',
              status: 'Delivered',
            };
          });
          setTripsData(mapped);
        }
      } catch (err) {
        console.warn('Exception fetching completed trips:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompletedTrips();
  }, [user?.tracker_name]);

  const renderItem = ({ item }: any) => (
    <TouchableOpacity style={styles.cardWrapper}>
      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.dateContainer}>
            <Calendar size={14} color={theme.colors.textSecondary} />
            <Text style={styles.dateText}>{item.date}</Text>
          </View>
          <View style={styles.statusBadge}>
            <CheckCircle size={12} color={theme.colors.success} />
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>

        <View style={styles.routeContainer}>
          <View style={styles.routeItem}>
            <View style={[styles.dot, { backgroundColor: theme.colors.border }]} />
            <Text style={styles.address} numberOfLines={1}>{item.pickup}</Text>
          </View>
          <View style={styles.line} />
          <View style={styles.routeItem}>
            <MapPin size={16} color={theme.colors.textSecondary} />
            <Text style={styles.address} numberOfLines={1}>{item.dropoff}</Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.metaContainer}>
            <Text style={styles.metaText}>{item.distance} • {item.duration}</Text>
          </View>
          <Text style={styles.earningsValue}>{item.earnings}</Text>
          <ChevronRight size={18} color={theme.colors.border} />
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <GlobalHeader />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Completed Trips ({tripsData.length})</Text>
        {user?.tracker_name && (
          <Text style={styles.headerSubtitle}>Vehicle: {user.tracker_name}</Text>
        )}
      </View>
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Fetching database trip records...</Text>
        </View>
      ) : tripsData.length === 0 ? (
        <View style={styles.centerContainer}>
          <CheckCircle size={48} color={theme.colors.border} />
          <Text style={styles.emptyText}>No completed trips found for this vehicle.</Text>
        </View>
      ) : (
        <FlatList
          data={tripsData}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
  },
  headerSubtitle: {
    ...theme.typography.labelSm,
    color: theme.colors.primary,
    marginTop: 4,
    fontWeight: '600',
  },
  listContent: {
    padding: theme.spacing.lg,
  },
  cardWrapper: {
    marginBottom: theme.spacing.sm,
  },
  card: {
    padding: theme.spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    ...theme.typography.labelSm,
    color: theme.colors.textSecondary,
    marginLeft: 6,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.success + '10',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.success,
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  routeContainer: {
    marginBottom: theme.spacing.sm,
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  line: {
    width: 1,
    height: 10,
    backgroundColor: theme.colors.border,
    marginLeft: 3,
    marginVertical: 1,
  },
  address: {
    ...theme.typography.bodyMd,
    color: theme.colors.textSecondary,
    fontSize: 13,
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.sm,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    ...theme.typography.labelSm,
    color: theme.colors.textSecondary,
    fontSize: 12,
  },
  earningsValue: {
    ...theme.typography.bodyMd,
    fontWeight: '700',
    color: theme.colors.text,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    ...theme.typography.bodyMd,
    color: theme.colors.textSecondary,
    marginTop: 12,
  },
  emptyText: {
    ...theme.typography.bodyMd,
    color: theme.colors.textSecondary,
    marginTop: 12,
    textAlign: 'center',
  },
});
