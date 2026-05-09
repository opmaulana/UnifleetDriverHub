import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {
  AlertTriangle,
  Gauge,
  Moon,
  Clock,
  Radio,
  MapPin,
  Filter,
  ChevronDown,
  ChevronRight,
  Bell,
  BellOff,
  Shield,
  TrendingUp,
} from 'lucide-react-native';
import { OperationsHeader } from '../../components/operations/OperationsHeader';

const ASAS_RED = '#C0392B';
const CRITICAL = '#BA1A1A';
const WARNING = '#E67E22';
const INFO = '#005875';
const GREY = '#7F8C8D';

type AlertSeverity = 'critical' | 'high' | 'medium' | 'low';

interface AlertItem {
  id: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  icon: React.ReactNode;
  location: string;
  timestamp: string;
  duration?: string;
  vehicle?: string;
  threshold?: string;
}

const alerts: AlertItem[] = [
  {
    id: '1',
    title: 'Night Driving Violation',
    description: 'Vehicle detected in motion during restricted hours.',
    severity: 'critical',
    icon: <Moon size={18} color="#FFFFFF" />,
    location: 'Sector 4 North',
    timestamp: '02:45 AM',
    vehicle: 'TRK-114',
  },
  {
    id: '2',
    title: 'Speed Violation: 88 km/h',
    description: 'Threshold exceeded: 88 km/h in 60 km/h zone',
    severity: 'critical',
    icon: <Gauge size={18} color="#FFFFFF" />,
    location: 'Dar Es Salaam Corridor',
    timestamp: '03:12 AM',
    vehicle: 'TRK-227',
    threshold: '60 km/h zone',
  },
  {
    id: '3',
    title: 'Prolonged Idling',
    description: 'Engine running without movement detected.',
    severity: 'high',
    icon: <Clock size={18} color="#FFFFFF" />,
    location: 'Gate 04',
    timestamp: '04:30 AM',
    duration: '1h 20m',
    vehicle: 'TRK-089',
  },
  {
    id: '4',
    title: 'Long Inactivity',
    description: 'No telemetry signal received from unit.',
    severity: 'medium',
    icon: <Radio size={18} color="#FFFFFF" />,
    location: 'Unknown / Out of range',
    timestamp: '00:15 AM',
    duration: '4h 00m',
    vehicle: 'TRK-301',
  },
  {
    id: '5',
    title: 'Geofence Breach',
    description: 'Vehicle exited designated operational corridor.',
    severity: 'high',
    icon: <MapPin size={18} color="#FFFFFF" />,
    location: 'TANZAM Hwy, Km 310',
    timestamp: '05:02 AM',
    vehicle: 'TRK-492',
  },
  {
    id: '6',
    title: 'Harsh Braking Event',
    description: 'Sudden deceleration exceeding safety threshold.',
    severity: 'medium',
    icon: <AlertTriangle size={18} color="#FFFFFF" />,
    location: 'Great North Road, Km 45',
    timestamp: '03:55 AM',
    vehicle: 'TRK-227',
  },
];

const getSeverityColor = (severity: AlertSeverity) => {
  switch (severity) {
    case 'critical': return CRITICAL;
    case 'high': return WARNING;
    case 'medium': return INFO;
    case 'low': return GREY;
  }
};

const getSeverityLabel = (severity: AlertSeverity) => {
  switch (severity) {
    case 'critical': return 'CRITICAL';
    case 'high': return 'HIGH';
    case 'medium': return 'MEDIUM';
    case 'low': return 'LOW';
  }
};

export const AlertsScreen = ({ onNavigateToSettings }: { onNavigateToSettings?: () => void }) => {
  const [activeFilter, setActiveFilter] = useState<'all' | AlertSeverity>('all');
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null);

  const filteredAlerts = activeFilter === 'all'
    ? alerts
    : alerts.filter((a) => a.severity === activeFilter);

  const criticalCount = alerts.filter(a => a.severity === 'critical').length;

  return (
    <View style={styles.screen}>
      <OperationsHeader onNavigateToSettings={onNavigateToSettings} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <View style={styles.titleSection}>
          <View>
            <Text style={styles.pageTitle}>Operational Alerts</Text>
            <Text style={styles.pageSubtitle}>
              Live exception monitoring across all operational sectors.
            </Text>
          </View>
          <TouchableOpacity style={styles.muteButton}>
            <Bell size={18} color="#8D706C" />
          </TouchableOpacity>
        </View>

        {/* Activity Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Critical alerts today</Text>
              <Text style={[styles.summaryNumber, { color: CRITICAL }]}>{criticalCount}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total alerts</Text>
              <Text style={styles.summaryNumber}>{alerts.length}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Resolved</Text>
              <Text style={[styles.summaryNumber, { color: '#27AE60' }]}>8</Text>
            </View>
          </View>
        </View>

        {/* Area Hotspot Notice */}
        <View style={styles.hotspotBanner}>
          <Shield size={16} color={WARNING} />
          <Text style={styles.hotspotText}>
            Attention: Night driving restrictions are currently in effect for Sectors 1-5.
          </Text>
        </View>

        {/* Filter Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {[
            { id: 'all' as const, label: 'All', count: alerts.length },
            { id: 'critical' as const, label: 'Critical', count: alerts.filter(a => a.severity === 'critical').length },
            { id: 'high' as const, label: 'High', count: alerts.filter(a => a.severity === 'high').length },
            { id: 'medium' as const, label: 'Medium', count: alerts.filter(a => a.severity === 'medium').length },
          ].map((f) => (
            <TouchableOpacity
              key={f.id}
              style={[styles.filterPill, activeFilter === f.id && styles.filterPillActive]}
              onPress={() => setActiveFilter(f.id)}
            >
              {f.id !== 'all' && (
                <View style={[styles.filterDot, { backgroundColor: getSeverityColor(f.id as AlertSeverity) }]} />
              )}
              <Text style={[styles.filterPillText, activeFilter === f.id && styles.filterPillTextActive]}>
                {f.label} ({f.count})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Alert Cards */}
        {filteredAlerts.map((alert) => (
          <TouchableOpacity
            key={alert.id}
            style={styles.alertCard}
            onPress={() => setExpandedAlert(expandedAlert === alert.id ? null : alert.id)}
            activeOpacity={0.7}
          >
            {/* Severity bar */}
            <View style={[styles.alertSeverityBar, { backgroundColor: getSeverityColor(alert.severity) }]} />

            <View style={styles.alertBody}>
              {/* Top row */}
              <View style={styles.alertTopRow}>
                <View style={[styles.alertIconCircle, { backgroundColor: getSeverityColor(alert.severity) }]}>
                  {alert.icon}
                </View>
                <View style={styles.alertMainInfo}>
                  <Text style={styles.alertTitle}>{alert.title}</Text>
                  {alert.vehicle && (
                    <Text style={styles.alertVehicle}>{alert.vehicle}</Text>
                  )}
                </View>
                <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(alert.severity) + '20' }]}>
                  <Text style={[styles.severityBadgeText, { color: getSeverityColor(alert.severity) }]}>
                    {getSeverityLabel(alert.severity)}
                  </Text>
                </View>
              </View>

              {/* Description */}
              {alert.description && (
                <Text style={styles.alertDescription}>{alert.description}</Text>
              )}

              {/* Metadata row */}
              <View style={styles.alertMeta}>
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>LOCATION</Text>
                  <Text style={styles.metaValue}>{alert.location}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>
                    {alert.duration ? 'DURATION' : 'TIMESTAMP'}
                  </Text>
                  <Text style={styles.metaValue}>
                    {alert.duration || alert.timestamp}
                  </Text>
                </View>
              </View>

              {/* Expanded details */}
              {expandedAlert === alert.id && (
                <View style={styles.expandedSection}>
                  <View style={styles.expandedDivider} />
                  {alert.threshold && (
                    <View style={styles.expandedRow}>
                      <Text style={styles.expandedLabel}>ZONE LIMIT</Text>
                      <Text style={styles.expandedValue}>{alert.threshold}</Text>
                    </View>
                  )}
                  <View style={styles.expandedActions}>
                    <TouchableOpacity style={styles.actionBtn}>
                      <Text style={styles.actionBtnText}>Acknowledge</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionBtn, styles.actionBtnOutline]}>
                      <Text style={[styles.actionBtnText, styles.actionBtnOutlineText]}>
                        View on Map
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
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
    padding: 16,
    paddingBottom: 100,
  },

  // ---- Title ----
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#261816',
  },
  pageSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#59413D',
    marginTop: 4,
    maxWidth: 280,
  },
  muteButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  // ---- Summary Card ----
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: 'row',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#8D706C',
    marginBottom: 4,
    textAlign: 'center',
  },
  summaryNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: '#261816',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: '#E1BFB9',
    marginVertical: 4,
  },

  // ---- Hotspot ----
  hotspotBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFF0EE',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: WARNING,
    marginBottom: 16,
  },
  hotspotText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#261816',
    lineHeight: 18,
  },

  // ---- Filter ----
  filterRow: {
    gap: 8,
    paddingBottom: 16,
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

  // ---- Alert Cards ----
  alertCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  alertSeverityBar: {
    width: 4,
  },
  alertBody: {
    flex: 1,
    padding: 14,
  },
  alertTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  alertMainInfo: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#261816',
  },
  alertVehicle: {
    fontSize: 12,
    fontWeight: '600',
    color: ASAS_RED,
    marginTop: 1,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 100,
  },
  severityBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  alertDescription: {
    fontSize: 13,
    fontWeight: '500',
    color: '#59413D',
    marginTop: 8,
    lineHeight: 18,
  },
  alertMeta: {
    flexDirection: 'row',
    gap: 24,
    marginTop: 10,
  },
  metaItem: {},
  metaLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#8D706C',
    letterSpacing: 1,
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#261816',
  },

  // ---- Expanded ----
  expandedSection: {
    marginTop: 10,
  },
  expandedDivider: {
    height: 1,
    backgroundColor: '#F7DDD9',
    marginBottom: 10,
  },
  expandedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  expandedLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8D706C',
    letterSpacing: 0.5,
  },
  expandedValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#261816',
  },
  expandedActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    height: 40,
    backgroundColor: ASAS_RED,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  actionBtnOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: ASAS_RED,
  },
  actionBtnOutlineText: {
    color: ASAS_RED,
  },
});
