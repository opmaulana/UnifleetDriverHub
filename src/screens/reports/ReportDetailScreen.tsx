import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as LucideIcons from 'lucide-react-native';
import { reportDefinitions, ReportFormat } from '../../config/reportDefinitions';
import { FilterCard } from '../../components/reports/FilterCard';
import { FormatSelector } from '../../components/reports/FormatSelector';
import { downloadAndShareReport } from '../../services/reports';
import { theme } from '../../theme/theme';

export const ReportDetailScreen = ({ route, navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { reportId } = route.params || {};

  // Fetch report definition
  const report = useMemo(() => {
    return reportDefinitions.find((r) => r.id === reportId);
  }, [reportId]);

  if (!report) {
    return (
      <View style={[styles.screen, styles.center]}>
        <LucideIcons.AlertTriangle size={48} color="#dc2626" />
        <Text style={styles.errorText}>Report structure not found.</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Local state for dynamically generated filters
  const [filterValues, setFilterValues] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {};
    report.filters.forEach((f) => {
      initial[f.id] = f.defaultValue;
    });
    return initial;
  });

  const [selectedFormat, setSelectedFormat] = useState<ReportFormat>(() => {
    return report.supportedFormats[0] || 'CSV';
  });

  // UX Interaction states
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [aboutExpanded, setAboutExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'filters' | 'about'>('filters');

  // Animated scroll values for sticky header effects
  const scrollY = React.useRef(new Animated.Value(0)).current;

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [60, 48],
    extrapolate: 'clamp',
  });

  const headerTitleSize = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [18, 15],
    extrapolate: 'clamp',
  });

  const handleFilterChange = (filterId: string, value: any) => {
    setFilterValues((prev) => ({
      ...prev,
      [filterId]: value,
    }));
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    setDownloadSuccess(false);
    try {
      await downloadAndShareReport(
        report.id,
        report.title,
        report.description,
        filterValues,
        selectedFormat
      );
      setDownloadSuccess(true);
      setTimeout(() => {
        setDownloadSuccess(false);
      }, 3000);
    } catch (err: any) {
      console.warn('Report Generation Exception:', err);
      alert(err.message || 'Telemetry export failed. Please verify API connections.');
    } finally {
      setIsDownloading(false);
    }
  };

  // Check if required filters are filled
  const isCtaDisabled = useMemo(() => {
    // If scope type is specific_vehicle, check that at least one vehicle is selected
    if (filterValues['scope']?.type === 'specific_vehicle') {
      const selected = filterValues['scope']?.selectedVehicles || [];
      if (selected.length === 0) return true;
    }
    // Check other custom picker filters
    const requiredFilters = report.filters.filter((f) => f.required);
    for (const rf of requiredFilters) {
      const val = filterValues[rf.id];
      if (rf.type === 'entity_picker' && (!val || val.length === 0)) {
        return true;
      }
    }
    return false;
  }, [filterValues, report]);

  const getDynamicCtaText = () => {
    if (isDownloading) {
      return selectedFormat === 'PDF' ? 'Generating PDF Document...' : 'Downloading CSV Spreadsheet...';
    }
    if (downloadSuccess) return 'Downloaded successfully!';
    if (isCtaDisabled) return 'Select Required Filters';
    return selectedFormat === 'PDF' ? 'Generate PDF Document' : 'Download CSV Spreadsheet';
  };

  const getReportIcon = () => {
    const IconComponent = (LucideIcons as any)[report.icon] || LucideIcons.FileText;
    return <IconComponent size={24} color="#C0392B" />;
  };

  return (
    <View style={[styles.screen, { paddingBottom: insets.bottom }]}>
      {/* Red Brand Header */}
      <View style={[styles.brandHeader, { paddingTop: insets.top }]}>
        <Animated.View style={[styles.headerContainer, { height: headerHeight }]}>
          <TouchableOpacity
            style={styles.headerBackBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <LucideIcons.ArrowLeft size={22} color="#ffffff" />
          </TouchableOpacity>

          <View style={styles.headerTextWrapper}>
            <Animated.Text
              style={[styles.headerTitle, { fontSize: headerTitleSize }]}
              numberOfLines={1}
            >
              {report.title}
            </Animated.Text>
            <Text style={styles.headerSubtitle}>Reports</Text>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerIconBtn} onPress={handleDownload} disabled={isCtaDisabled}>
              <LucideIcons.Download size={18} color="#ffffff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerIconBtn}>
              <LucideIcons.SlidersHorizontal size={18} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'filters' && styles.tabBtnActive]}
          onPress={() => setActiveTab('filters')}
        >
          <Text style={[styles.tabBtnText, activeTab === 'filters' && styles.tabBtnTextActive]}>
            Filters
          </Text>
          {activeTab === 'filters' && <View style={styles.activeTabIndicator} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'about' && styles.tabBtnActive]}
          onPress={() => setActiveTab('about')}
        >
          <Text style={[styles.tabBtnText, activeTab === 'about' && styles.tabBtnTextActive]}>
            About
          </Text>
          {activeTab === 'about' && <View style={styles.activeTabIndicator} />}
        </TouchableOpacity>
      </View>

      {/* Main Content Area */}
      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {activeTab === 'filters' ? (
          <View style={styles.filtersWrapper}>
            {/* About collapsing card */}
            <View style={styles.aboutCard}>
              <View style={styles.aboutCardHeader}>
                <View style={styles.aboutIconBox}>
                  <LucideIcons.Info size={16} color="#0284c7" />
                </View>
                <Text style={styles.aboutCardTitle}>About this report</Text>
              </View>
              <Text
                style={styles.aboutCardText}
                numberOfLines={aboutExpanded ? undefined : 2}
              >
                {report.description}
              </Text>
              {report.description.length > 100 && (
                <TouchableOpacity
                  style={styles.expandBtn}
                  onPress={() => setAboutExpanded(!aboutExpanded)}
                >
                  <Text style={styles.expandBtnText}>
                    {aboutExpanded ? 'Read Less' : 'Read Full Description'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Dynamic filter lists */}
            {report.filters.map((filter) => (
              <FilterCard
                key={filter.id}
                definition={filter}
                value={filterValues[filter.id]}
                onChange={(val) => handleFilterChange(filter.id, val)}
              />
            ))}

            {/* Report Export Format Section */}
            <View style={styles.formatSectionCard}>
              <View style={styles.formatSectionHeader}>
                <LucideIcons.FileText size={18} color="#4b5563" style={{ marginRight: 8 }} />
                <Text style={styles.formatSectionTitle}>Report Format</Text>
              </View>
              <FormatSelector
                supportedFormats={report.supportedFormats}
                selectedFormat={selectedFormat}
                onChange={setSelectedFormat}
              />
            </View>
          </View>
        ) : (
          /* About technical documentation tab */
          <View style={styles.aboutTabContent}>
            <View style={styles.docSection}>
              <View style={styles.docHeaderRow}>
                {getReportIcon()}
                <Text style={styles.docTitle}>{report.title}</Text>
              </View>
              <Text style={styles.docDescription}>
                The {report.title} gathers high-frequency telemetry events transmitted directly from live-connected cellular and satellite trackers, compiled securely into transactional spreadsheets and print-ready files.
              </Text>
            </View>

            <View style={styles.docSection}>
              <Text style={styles.sectionHeading}>Data Sourcing</Text>
              <Text style={styles.docText}>
                Tracker telemetry feeds are processed every 12 seconds with localized geo-fencing lookup, ignition-on idling audits, and multi-sensor correlation to verify uptime metrics and avoid packet drops.
              </Text>
            </View>

            <View style={styles.docSection}>
              <Text style={styles.sectionHeading}>Standard Fields Included</Text>
              <View style={styles.bulletList}>
                {[
                  'Standard Vehicle Label & Unit ID',
                  'Operational active hours & idle intervals',
                  'Accumulated trip distances (KM)',
                  'Ignition diagnostics & battery reports',
                  'Triggered geofence overlaps & dwell counters',
                  'Telemetry synchronization timestamps',
                ].map((item, idx) => (
                  <View key={idx} style={styles.bulletRow}>
                    <View style={styles.bulletDot} />
                    <Text style={styles.bulletText}>{item}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}
      </Animated.ScrollView>

      {/* Sticky Bottom Actions */}
      <View style={styles.bottomStickyCta}>
        {downloadSuccess ? (
          <View style={styles.successWrapper}>
            <View style={styles.successCircle}>
              <LucideIcons.Check size={16} color="#ffffff" strokeWidth={3} />
            </View>
            <Text style={styles.successMessage}>{getDynamicCtaText()}</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={[
              styles.downloadBtn,
              (isCtaDisabled || isDownloading) && styles.downloadBtnDisabled,
            ]}
            disabled={isCtaDisabled || isDownloading}
            onPress={handleDownload}
            activeOpacity={0.8}
          >
            {isDownloading ? (
              <ActivityIndicator size="small" color="#ffffff" style={{ marginRight: 8 }} />
            ) : (
              <LucideIcons.Download size={18} color="#ffffff" style={{ marginRight: 8 }} />
            )}
            <Text style={styles.downloadBtnText}>{getDynamicCtaText()}</Text>
          </TouchableOpacity>
        )}
        <View style={styles.securityIndicator}>
          <LucideIcons.Lock size={11} color="#9ca3af" style={{ marginRight: 4 }} />
          <Text style={styles.securityText}>Your report will be downloaded to your device</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
  },
  backBtn: {
    backgroundColor: '#C0392B',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  backBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  brandHeader: {
    backgroundColor: '#C0392B',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  headerBackBtn: {
    width: 38,
    height: 38,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextWrapper: {
    flex: 1,
    marginLeft: 8,
  },
  headerTitle: {
    color: '#ffffff',
    fontWeight: '800',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#fca5a5',
    fontWeight: '700',
    marginTop: 1,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 6,
  },
  headerIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Tab styles
  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    height: 48,
  },
  tabBtn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  tabBtnActive: {
    backgroundColor: '#ffffff',
  },
  tabBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
  },
  tabBtnTextActive: {
    color: '#C0392B',
    fontWeight: '800',
  },
  activeTabIndicator: {
    position: 'absolute',
    bottom: 0,
    width: '40%',
    height: 3,
    backgroundColor: '#C0392B',
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 160,
  },
  filtersWrapper: {
    gap: 2,
  },
  // Collapsible about card
  aboutCard: {
    backgroundColor: '#eff6ff',
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  aboutCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  aboutIconBox: {
    marginRight: 6,
  },
  aboutCardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1e40af',
  },
  aboutCardText: {
    fontSize: 12,
    color: '#1e3a8a',
    lineHeight: 18,
    fontWeight: '500',
  },
  expandBtn: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  expandBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1d4ed8',
  },
  // Format Card wrapper
  formatSectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  formatSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  formatSectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },
  // Technical tab layout
  aboutTabContent: {
    gap: 20,
    paddingVertical: 10,
  },
  docSection: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  docHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  docTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  docDescription: {
    fontSize: 13,
    color: '#4b5563',
    lineHeight: 20,
    fontWeight: '500',
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
  },
  docText: {
    fontSize: 13,
    color: '#4b5563',
    lineHeight: 20,
    fontWeight: '500',
  },
  bulletList: {
    gap: 10,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#C0392B',
  },
  bulletText: {
    fontSize: 12,
    color: '#4b5563',
    fontWeight: '600',
  },
  // Sticky footer
  bottomStickyCta: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
  },
  downloadBtn: {
    backgroundColor: '#C0392B',
    height: 48,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#C0392B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  downloadBtnDisabled: {
    backgroundColor: '#e5e7eb',
    shadowOpacity: 0,
    elevation: 0,
  },
  downloadBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  successWrapper: {
    backgroundColor: '#22c55e',
    height: 48,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  successMessage: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  securityIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  securityText: {
    fontSize: 10,
    color: '#9ca3af',
    fontWeight: '600',
  },
});
