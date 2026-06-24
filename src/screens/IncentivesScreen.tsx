import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { GlobalHeader } from '../components/GlobalHeader';
import { theme } from '../theme/theme';
import Svg, { Circle } from 'react-native-svg';
import { 
  Calendar, 
  ChevronDown, 
  ChevronUp, 
  ChevronRight, 
  CheckCircle, 
  X, 
  AlertTriangle, 
  Gauge, 
  Shield, 
  Fuel, 
  Route, 
  Sun, 
  Truck, 
  Clock, 
  MapPinned
} from 'lucide-react-native';

interface DetailItem {
  label: string;
  value: string;
}

interface IncentiveItem {
  id: string;
  category: string;
  description: string;
  status: 'achieved' | 'failed' | 'pending';
  icon: React.ComponentType<any>;
  details?: DetailItem[];
}

const INCENTIVES_DATA: IncentiveItem[] = [
  {
    id: '1',
    category: 'Safety',
    description: 'No speed violation > 80 km/h',
    status: 'achieved',
    icon: Shield,
  },
  {
    id: '2',
    category: 'Fuel Efficiency',
    description: 'Idle time < 20 mins',
    status: 'achieved',
    icon: Fuel,
  },
  {
    id: '3',
    category: 'Route Discipline',
    description: 'No unauthorized deviation',
    status: 'failed',
    icon: Route,
    details: [
      { label: 'Failed at', value: 'Near Mpika' },
      { label: 'Time', value: '12:43 PM' },
      { label: 'Deviation', value: '4.2 km' },
    ],
  },
  {
    id: '4',
    category: 'Daylight Driving',
    description: 'No driving during restricted night hours',
    status: 'achieved',
    icon: Sun,
  },
  {
    id: '5',
    category: 'Convoy Discipline',
    description: 'Stayed within convoy range',
    status: 'failed',
    icon: Truck,
    details: [
      { label: 'Issue', value: 'Vehicle separated from convoy' },
      { label: 'Distance', value: '4.8 km' },
      { label: 'Maximum Allowed', value: '3.0 km' },
      { label: 'Location', value: 'Serenje' },
    ],
  },
  {
    id: '6',
    category: 'On-Time Delivery',
    description: 'Reached destination on time',
    status: 'pending',
    icon: Clock,
  },
  {
    id: '7',
    category: 'Compliance With Assigned Driving Window',
    description: 'Followed assigned driving schedule',
    status: 'achieved',
    icon: Calendar,
  },
];

const ComplianceRing = ({ percentage }: { percentage: number }) => {
  const radius = 22;
  const strokeWidth = 5;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <View style={styles.ringContainer}>
      <Svg width={56} height={56} viewBox="0 0 56 56">
        <Circle
          cx="28"
          cy="28"
          r={radius}
          stroke="#F2F2F7"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx="28"
          cy="28"
          r={radius}
          stroke="#E53935"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform="rotate(-90 28 28)"
        />
      </Svg>
      <View style={styles.ringTextContainer}>
        <Text style={styles.ringText}>{percentage}%</Text>
      </View>
    </View>
  );
};

export const IncentivesScreen = () => {
  const [expandedIds, setExpandedIds] = useState<string[]>(['3', '5']); // Start with failed items expanded

  const toggleExpand = (id: string, status: string) => {
    if (status !== 'failed') return;
    setExpandedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  return (
    <View style={styles.container}>
      <GlobalHeader />
      
      {/* Title Header with dropdown */}
      <View style={styles.header}>
        <View style={{ flex: 1, paddingRight: 8 }}>
          <Text style={styles.headerTitle}>Incentives</Text>
          <Text style={styles.headerSubtitle}>
            Complete all incentives to maximize your trip performance.
          </Text>
        </View>
        <TouchableOpacity style={styles.tripSelector} activeOpacity={0.8}>
          <Calendar size={14} color="#1D1D1F" style={{ marginRight: 6 }} />
          <Text style={styles.tripSelectorText}>Trip #123</Text>
          <ChevronDown size={14} color="#1D1D1F" style={{ marginLeft: 6 }} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Overview Card */}
        <View style={styles.overviewCard}>
          <View style={styles.overviewLeft}>
            <Text style={styles.overviewTitle}>Trip Incentives Overview</Text>
            <View style={styles.statsRow}>
              {/* Achieved */}
              <View style={styles.statCol}>
                <View style={styles.statRowValue}>
                  <View style={styles.checkCircleSmall}>
                    <CheckCircle size={14} color={theme.colors.white} fill="#E53935" />
                  </View>
                  <Text style={styles.statNumber}>4</Text>
                </View>
                <Text style={styles.statLabel}>Achieved</Text>
              </View>

              <View style={styles.statDivider} />

              {/* Failed */}
              <View style={styles.statCol}>
                <View style={styles.statRowValue}>
                  <View style={styles.crossCircleSmall}>
                    <X size={10} color={theme.colors.white} />
                  </View>
                  <Text style={styles.statNumber}>2</Text>
                </View>
                <Text style={styles.statLabel}>Failed</Text>
              </View>

              <View style={styles.statDivider} />

              {/* Pending */}
              <View style={styles.statCol}>
                <View style={styles.statRowValue}>
                  <View style={styles.pendingCircleSmall} />
                  <Text style={styles.statNumber}>1</Text>
                </View>
                <Text style={styles.statLabel}>Pending</Text>
              </View>
            </View>
          </View>

          <View style={styles.overviewRight}>
            <ComplianceRing percentage={67} />
            <Text style={styles.complianceLabel}>Incentive Compliance</Text>
          </View>
        </View>

        {/* Warning Card */}
        <View style={styles.warningCard}>
          <View style={styles.warningIconCircle}>
            <AlertTriangle size={18} color="#E53935" />
          </View>
          <View style={styles.warningTextContainer}>
            <Text style={styles.warningTitle}>Drive Safe!</Text>
            <Text style={styles.warningMessage}>
              You are approaching 80 km/h. Exceeding this speed will fail "No Speed Violation".
            </Text>
          </View>
          <Gauge size={22} color="#E53935" style={{ opacity: 0.8 }} />
        </View>

        {/* Checklist Section */}
        <View style={styles.checklistSection}>
          <Text style={styles.sectionHeading}>Incentive Checklist</Text>
          
          {INCENTIVES_DATA.map((item) => {
            const isFailed = item.status === 'failed';
            const isAchieved = item.status === 'achieved';
            const isPending = item.status === 'pending';
            const isExpanded = expandedIds.includes(item.id);
            const IconComponent = item.icon;

            return (
              <View key={item.id} style={styles.checklistCard}>
                <TouchableOpacity
                  style={[
                    styles.checklistHeader,
                    isFailed && isExpanded && { borderBottomWidth: 1, borderBottomColor: '#FFD1D4' }
                  ]}
                  onPress={() => toggleExpand(item.id, item.status)}
                  activeOpacity={isFailed ? 0.7 : 1}
                >
                  {/* Status Circle Badge on left */}
                  <View style={styles.statusBadgeCol}>
                    {isAchieved && (
                      <View style={styles.achievedCircle}>
                        <CheckCircle size={16} color={theme.colors.white} fill="#E53935" />
                      </View>
                    )}
                    {isFailed && (
                      <View style={styles.failedCircle}>
                        <X size={12} color={theme.colors.white} />
                      </View>
                    )}
                    {isPending && (
                      <View style={styles.pendingCircle} />
                    )}
                  </View>

                  {/* Category Icon */}
                  <View style={styles.categoryIconWrap}>
                    <IconComponent size={20} color={isFailed ? '#E53935' : '#8E8E93'} />
                  </View>

                  {/* Info details */}
                  <View style={styles.checklistInfo}>
                    <Text style={[styles.itemCategory, isFailed && { color: '#E53935' }]}>
                      {item.category}
                    </Text>
                    <Text style={styles.itemDescription}>
                      {item.description}
                    </Text>
                  </View>

                  {/* Expand Chevron on right */}
                  <View style={styles.chevronCol}>
                    {isFailed ? (
                      isExpanded ? (
                        <ChevronUp size={18} color="#E53935" />
                      ) : (
                        <ChevronDown size={18} color="#8E8E93" />
                      )
                    ) : (
                      <ChevronDown size={18} color="#E5E5EA" />
                    )}
                  </View>
                </TouchableOpacity>

                {/* Expanded Details */}
                {isFailed && isExpanded && item.details && (
                  <View style={styles.detailsContainer}>
                    <View style={styles.detailsContent}>
                      {item.details.map((detail, idx) => (
                        <View key={idx} style={styles.detailRow}>
                          <View style={styles.detailLabelRow}>
                            <View style={styles.redDetailDot} />
                            <Text style={styles.detailLabel}>{detail.label}</Text>
                          </View>
                          <Text style={styles.detailValue}>{detail.value}</Text>
                        </View>
                      ))}
                    </View>

                    <View style={styles.dividerLine} />

                    {/* View on Map Row */}
                    <TouchableOpacity
                      style={styles.viewMapActionRow}
                      onPress={() => console.log("View Incentive Location")}
                      activeOpacity={0.7}
                    >
                      <MapPinned size={15} color="#E53935" style={{ marginRight: 8 }} />
                      <Text style={styles.viewMapActionText}>View on Map</Text>
                      <ChevronRight size={15} color="#E53935" style={{ marginLeft: 'auto' }} />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>
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
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1D1D1F',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
    lineHeight: 16,
  },
  tripSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 18,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginTop: 2,
  },
  tripSelectorText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1D1D1F',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  overviewCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  overviewLeft: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: '#F2F2F7',
    paddingRight: 10,
  },
  overviewTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1D1D1F',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statCol: {
    alignItems: 'center',
    flex: 1,
  },
  statRowValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkCircleSmall: {
    marginRight: 4,
  },
  crossCircleSmall: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#E53935',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  pendingCircleSmall: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#8E8E93',
    marginRight: 4,
  },
  statNumber: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1D1D1F',
  },
  statLabel: {
    fontSize: 8.5,
    color: '#8E8E93',
    marginTop: 4,
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#F2F2F7',
  },
  overviewRight: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 12,
    flex: 1.15,
  },
  ringContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    width: 56,
    height: 56,
  },
  ringTextContainer: {
    position: 'absolute',
  },
  ringText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1D1D1F',
  },
  complianceLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#1D1D1F',
    marginLeft: 8,
    flex: 1,
    lineHeight: 14,
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEEEF',
    borderWidth: 1,
    borderColor: '#FFD1D4',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  warningIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E53935',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  warningTextContainer: {
    flex: 1,
    paddingRight: 8,
  },
  warningTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#E53935',
  },
  warningMessage: {
    fontSize: 10,
    color: '#6E6E73',
    marginTop: 2,
    lineHeight: 14,
  },
  checklistSection: {
    marginTop: 4,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1D1D1F',
    marginBottom: 12,
  },
  checklistCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    marginBottom: 10,
    overflow: 'hidden',
  },
  checklistHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFFFFF',
  },
  statusBadgeCol: {
    marginRight: 10,
    justifyContent: 'center',
  },
  achievedCircle: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  failedCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#E53935',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pendingCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#C7C7CC',
  },
  categoryIconWrap: {
    marginRight: 12,
    justifyContent: 'center',
  },
  checklistInfo: {
    flex: 1,
    paddingRight: 8,
  },
  itemCategory: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1D1D1F',
  },
  itemDescription: {
    fontSize: 10,
    color: '#8E8E93',
    marginTop: 2,
  },
  chevronCol: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsContainer: {
    backgroundColor: '#FFEEEF',
    paddingTop: 10,
    paddingBottom: 10,
    paddingHorizontal: 12,
  },
  detailsContent: {
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  detailLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  redDetailDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E53935',
    marginRight: 8,
  },
  detailLabel: {
    fontSize: 11,
    color: '#6E6E73',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 11,
    color: '#1D1D1F',
    fontWeight: '700',
  },
  dividerLine: {
    height: 1,
    backgroundColor: '#FFD1D4',
    marginVertical: 8,
  },
  viewMapActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  viewMapActionText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#E53935',
  },
});
