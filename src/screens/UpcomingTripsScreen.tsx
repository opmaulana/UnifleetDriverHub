import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity } from 'react-native';
import { theme } from '../theme/theme';
import { Card } from '../components/Card';
import { Calendar, Clock, MapPin, ChevronRight } from 'lucide-react-native';

const UPCOMING_DATA = [
  {
    id: '1',
    date: 'Today, 2:00 PM',
    pickup: 'Westlands, Nairobi',
    dropoff: 'Kilimani, Nairobi',
    earnings: 'KSh 450',
    type: 'Scheduled',
  },
  {
    id: '2',
    date: 'Tomorrow, 9:00 AM',
    pickup: 'JKIA Airport',
    dropoff: 'CBD, City Center',
    earnings: 'KSh 1,200',
    type: 'Express',
  },
];

export const UpcomingTripsScreen = () => {
  const renderItem = ({ item }: any) => (
    <TouchableOpacity style={styles.cardWrapper}>
      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.dateContainer}>
            <Calendar size={16} color={theme.colors.primary} />
            <Text style={styles.dateText}>{item.date}</Text>
          </View>
          <View style={styles.typeTag}>
            <Text style={styles.typeText}>{item.type}</Text>
          </View>
        </View>

        <View style={styles.routeContainer}>
          <View style={styles.routeItem}>
            <View style={[styles.dot, { backgroundColor: theme.colors.primary }]} />
            <Text style={styles.address} numberOfLines={1}>{item.pickup}</Text>
          </View>
          <View style={styles.line} />
          <View style={styles.routeItem}>
            <MapPin size={16} color={theme.colors.textSecondary} />
            <Text style={styles.address} numberOfLines={1}>{item.dropoff}</Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View>
            <Text style={styles.earningsLabel}>Est. Earnings</Text>
            <Text style={styles.earningsValue}>{item.earnings}</Text>
          </View>
          <TouchableOpacity style={styles.detailsBtn}>
            <Text style={styles.detailsBtnText}>Details</Text>
            <ChevronRight size={16} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Upcoming Trips</Text>
      </View>
      <FlatList
        data={UPCOMING_DATA}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Calendar size={48} color={theme.colors.border} />
            <Text style={styles.emptyText}>No upcoming trips scheduled</Text>
          </View>
        }
      />
    </SafeAreaView>
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
  listContent: {
    padding: theme.spacing.lg,
  },
  cardWrapper: {
    marginBottom: theme.spacing.md,
  },
  card: {
    padding: theme.spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    ...theme.typography.labelSm,
    color: theme.colors.text,
    marginLeft: 6,
    fontWeight: '600',
  },
  typeTag: {
    backgroundColor: theme.colors.primary + '10',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeText: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.primary,
    textTransform: 'uppercase',
  },
  routeContainer: {
    marginBottom: theme.spacing.md,
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  line: {
    width: 1,
    height: 15,
    backgroundColor: theme.colors.border,
    marginLeft: 4,
    marginVertical: 2,
  },
  address: {
    ...theme.typography.bodyMd,
    color: theme.colors.text,
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.md,
  },
  earningsLabel: {
    ...theme.typography.labelSm,
    color: theme.colors.textSecondary,
  },
  earningsValue: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginTop: 2,
  },
  detailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  detailsBtnText: {
    ...theme.typography.labelSm,
    color: theme.colors.primary,
    marginRight: 4,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    ...theme.typography.bodyMd,
    color: theme.colors.textSecondary,
    marginTop: 16,
  },
});
