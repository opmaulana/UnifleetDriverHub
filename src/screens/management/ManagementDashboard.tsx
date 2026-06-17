import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { theme } from '../../theme/theme';
import { Card } from '../../components/Card';
import { MapPin, Navigation, Truck, Menu, ChevronRight } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ManagementSideMenu } from '../../components/management/ManagementSideMenu';

export const ManagementDashboard = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  return (
    <View style={styles.container}>
      {/* Custom Header for Management with Hamburger */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerContent}>
          <Text style={styles.brandText}>ASAS</Text>
          <TouchableOpacity 
            style={styles.menuBtn}
            onPress={() => setIsMenuVisible(true)}
          >
            <Menu color={theme.colors.white} size={24} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.pageTitle}>Dashboard</Text>

        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <View style={[styles.iconContainer, { backgroundColor: '#E3F2FD' }]}>
              <MapPin color={theme.colors.info} size={20} />
            </View>
            <Text style={styles.statValue}>14</Text>
            <Text style={styles.statLabel}>Vehicles in Geofence</Text>
          </Card>
          
          <Card style={styles.statCard}>
            <View style={[styles.iconContainer, { backgroundColor: '#FFF3E0' }]}>
              <Navigation color={theme.colors.warning} size={20} />
            </View>
            <Text style={styles.statValue}>8</Text>
            <Text style={styles.statLabel}>Approaching</Text>
          </Card>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Active Nominations</Text>
          <TouchableOpacity onPress={() => navigation.navigate('ActiveNominations')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        {/* Mock Nominations List */}
        {[1, 2, 3].map((item) => (
          <TouchableOpacity 
            key={item} 
            activeOpacity={0.7}
            onPress={() => navigation.navigate('NominationForm')}
          >
            <Card style={styles.nominationCard}>
              <View style={styles.nominationHeader}>
                <View style={styles.truckBadge}>
                  <Truck color={theme.colors.primary} size={16} />
                  <Text style={styles.truckPlate}>KDJ 4{item}2L</Text>
                </View>
                <Text style={styles.statusText}>In Transit</Text>
              </View>
              <View style={styles.nominationBody}>
                <Text style={styles.locationText}>Mombasa Port</Text>
                <Navigation color={theme.colors.border} size={16} style={{ marginHorizontal: 8 }} />
                <Text style={styles.locationText}>Nairobi HQ</Text>
              </View>
            </Card>
          </TouchableOpacity>
        ))}

        <TouchableOpacity 
          style={styles.quickActionBtn}
          onPress={() => navigation.navigate('NominationForm')}
          activeOpacity={0.8}
        >
          <Text style={styles.quickActionText}>Create New Nomination</Text>
          <ChevronRight color={theme.colors.white} size={20} />
        </TouchableOpacity>

      </ScrollView>

      <ManagementSideMenu 
        visible={isMenuVisible}
        onClose={() => setIsMenuVisible(false)}
        navigation={navigation}
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
    backgroundColor: theme.colors.primary,
  },
  headerContent: {
    height: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  brandText: {
    ...theme.typography.h3,
    fontFamily: Platform.select({
      web: 'Playfair Display',
      default: 'PlayfairDisplay-Bold',
    }),
    color: theme.colors.white,
    fontWeight: '900',
    letterSpacing: 1,
  },
  menuBtn: {
    padding: 4,
  },
  content: {
    padding: theme.spacing.lg,
    paddingBottom: 40,
  },
  pageTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
    marginBottom: theme.spacing.xl,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xl,
  },
  statCard: {
    flex: 0.48,
    padding: theme.spacing.lg,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  statValue: {
    ...theme.typography.h1,
    color: theme.colors.text,
    marginBottom: 4,
  },
  statLabel: {
    ...theme.typography.labelSm,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
  },
  seeAllText: {
    ...theme.typography.labelSm,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  nominationCard: {
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  nominationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  truckBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  truckPlate: {
    ...theme.typography.labelSm,
    color: theme.colors.primary,
    marginLeft: 6,
    fontWeight: '700',
  },
  statusText: {
    ...theme.typography.labelSm,
    color: theme.colors.info,
    fontWeight: '600',
  },
  nominationBody: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    ...theme.typography.bodyMd,
    color: theme.colors.text,
    flex: 1,
  },
  quickActionBtn: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.xl,
  },
  quickActionText: {
    ...theme.typography.labelLg,
    color: theme.colors.white,
    marginRight: 8,
  },
});
