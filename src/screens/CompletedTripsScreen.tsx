import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { GlobalHeader } from '../components/GlobalHeader';
import { theme } from '../theme/theme';
import { Card } from '../components/Card';
import { CheckCircle, MapPin, ChevronRight, Calendar } from 'lucide-react-native';

const COMPLETED_DATA = [
  {
    id: '1',
    date: '22 April, 2024',
    pickup: 'Nairobi West',
    dropoff: 'Parklands',
    earnings: 'KSh 600',
    status: 'Delivered',
  },
  {
    id: '2',
    date: '21 April, 2024',
    pickup: 'Kileleshwa',
    dropoff: 'Lavington',
    earnings: 'KSh 400',
    status: 'Delivered',
  },
  {
    id: '3',
    date: '21 April, 2024',
    pickup: 'CBD',
    dropoff: 'Upperhill',
    earnings: 'KSh 350',
    status: 'Delivered',
  },
];

export const CompletedTripsScreen = () => {
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
        <Text style={styles.headerTitle}>Completed Trips</Text>
      </View>
      <FlatList
        data={COMPLETED_DATA}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
      />
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
  earningsValue: {
    ...theme.typography.bodyMd,
    fontWeight: '700',
    color: theme.colors.text,
  },
});
