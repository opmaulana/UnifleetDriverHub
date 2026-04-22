import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity } from 'react-native';
import { theme } from '../theme/theme';
import { Bell, AlertTriangle, Info, Clock, ChevronLeft } from 'lucide-react-native';

const notifications = [
  {
    id: '1',
    type: 'alert',
    title: 'Speed Warning',
    message: 'You exceeded the speed limit on Mombasa Road. Please drive safely.',
    time: '10 mins ago',
    icon: <AlertTriangle color={theme.colors.error} size={20} />,
    color: theme.colors.error,
  },
  {
    id: '2',
    type: 'system',
    title: 'System Update',
    message: 'A new version of Driver Hub is available. Update now for new features.',
    time: '1 hour ago',
    icon: <Info color={theme.colors.info} size={20} />,
    color: theme.colors.info,
  },
  {
    id: '3',
    type: 'trip',
    title: 'Trip Delayed',
    message: 'Heavy traffic reported on your current route. Expected delay: 15 mins.',
    time: '2 hours ago',
    icon: <Clock color={theme.colors.warning} size={20} />,
    color: theme.colors.warning,
  },
];

export const NotificationsScreen = ({ navigation }: any) => {
  const renderItem = ({ item }: any) => (
    <TouchableOpacity style={styles.notificationItem}>
      <View style={[styles.iconContainer, { backgroundColor: item.color + '10' }]}>
        {item.icon}
      </View>
      <View style={styles.content}>
        <View style={styles.itemHeader}>
          <Text style={styles.itemTitle}>{item.title}</Text>
          <Text style={styles.itemTime}>{item.time}</Text>
        </View>
        <Text style={styles.itemMessage}>{item.message}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color={theme.colors.text} size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Bell size={64} color={theme.colors.border} />
            <Text style={styles.emptyText}>No notifications yet</Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.white,
  },
  backBtn: {
    padding: 8,
  },
  headerTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
  },
  listContent: {
    padding: theme.spacing.lg,
  },
  notificationItem: {
    flexDirection: 'row',
    backgroundColor: theme.colors.white,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  content: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemTitle: {
    ...theme.typography.labelLg,
    fontWeight: '700',
    color: theme.colors.text,
  },
  itemTime: {
    ...theme.typography.labelSm,
    color: theme.colors.textSecondary,
  },
  itemMessage: {
    ...theme.typography.bodyMd,
    color: theme.colors.textSecondary,
    lineHeight: 22,
  },
  empty: {
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    ...theme.typography.bodyMd,
    color: theme.colors.textSecondary,
    marginTop: 16,
  },
});
