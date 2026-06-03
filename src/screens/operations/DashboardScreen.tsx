import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
  StatusBar,
} from 'react-native';
import {
  ArrowLeft,
  RotateCw,
  Download,
  Calendar,
  ChevronRight,
  TrendingUp,
  Clock,
  Fuel,
  Moon,
  AlertTriangle,
  Zap,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Line, Rect } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// -------------------------------------------------------------
// STATIC HIGH-FIDELITY TELEMETRY MOCK DATA
// -------------------------------------------------------------
const DATA_TZ = {
  tripStats: [
    { label: 'Total Trips Distance (km)', value: '4,045,890' },
    { label: 'Number of Trips', value: '101,795' },
    { label: 'Avg Distance / Trip (km)', value: '40' },
    { label: 'Avg Speed in Motion (km/h)', value: '35' },
    { label: 'Total Driving Hours', value: '113,983' },
    { label: 'Avg Driving Hours / Day', value: '3.93' },
    { label: 'Vehicles >5km', value: '962' },
    { label: 'Night Driving Hours', value: '2,683.13' },
  ],
  fleetStats: [
    { label: 'Total Engine Hours', value: '184,383' },
    { label: 'In Movement Hours', value: '108,781' },
    { label: 'Total Idling Hours', value: '75,607' },
    { label: 'Fuel (Motion) Litres', value: '1,618,357' },
    { label: 'Fuel (Idle) Litres', value: '113,410' },
    { label: 'Total Fuel Litres', value: '1,731,767' },
    { label: 'Fuel Cost (USD)', value: '$1,998,193' },
    { label: 'Mileage (km/L)', value: '2.34' },
    { label: 'CO₂ Equivalent (MT)', value: '4,641' },
  ],
  dailyAssets: {
    chartData: [437, 466, 535, 425, 444, 490, 460],
    recentRows: [
      { date: '2026-05-24', assets: 437 },
      { date: '2026-05-25', assets: 466 },
      { date: '2026-05-26', assets: 535 },
      { date: '2026-05-27', assets: 425 },
      { date: '2026-05-28', assets: 444 },
    ]
  },
  nightDrivers: [
    { rank: '#1', vehicle: 'T 597 EKN TIPER TR (NEW)', hours: '58.67 hrs' },
    { rank: '#2', vehicle: 'T 620 EKN TIPER TR (NEW)', hours: '58 hrs' },
    { rank: '#3', vehicle: 'T 714 ECY HOW TR', hours: '51.53 hrs' },
    { rank: '#4', vehicle: 'T 916 DUC HOWO TR', hours: '48.5 hrs' },
    { rank: '#5', vehicle: 'T 391 DVR-SCANIA P360 TR', hours: '46.75 hrs' },
  ],
  speedViolators: [
    { vehicle: 'AIF 6220 ZM RAGHUL', total: 189, major: 155, severe: 34, maxSpeed: 151 },
    { vehicle: 'CAC 3155 ZM SCANIA', total: 198, major: 197, severe: 1, maxSpeed: 107 },
    { vehicle: 'BBD 2952 ZM SCANIA', total: 155, major: 148, severe: 7, maxSpeed: 110 },
    { vehicle: 'CAF 8638 ZM VISHA', total: 133, major: 116, severe: 17, maxSpeed: 121 },
    { vehicle: 'CAS 9253 ZM SHACMAN', total: 162, major: 161, severe: 1, maxSpeed: 101 },
  ]
};

const DATA_ZM = {
  tripStats: [
    { label: 'Total Trips Distance (km)', value: '2,845,910' },
    { label: 'Number of Trips', value: '61,240' },
    { label: 'Avg Distance / Trip (km)', value: '46' },
    { label: 'Avg Speed in Motion (km/h)', value: '38' },
    { label: 'Total Driving Hours', value: '74,890' },
    { label: 'Avg Driving Hours / Day', value: '4.10' },
    { label: 'Vehicles >5km', value: '455' },
    { label: 'Night Driving Hours', value: '1,142.50' },
  ],
  fleetStats: [
    { label: 'Total Engine Hours', value: '112,490' },
    { label: 'In Movement Hours', value: '68,230' },
    { label: 'Total Idling Hours', value: '44,260' },
    { label: 'Fuel (Motion) Litres', value: '984,320' },
    { label: 'Fuel (Idle) Litres', value: '65,490' },
    { label: 'Total Fuel Litres', value: '1,049,810' },
    { label: 'Fuel Cost (USD)', value: '$1,212,480' },
    { label: 'Mileage (km/L)', value: '2.71' },
    { label: 'CO₂ Equivalent (MT)', value: '2,810' },
  ],
  dailyAssets: {
    chartData: [210, 245, 235, 260, 244, 275, 290],
    recentRows: [
      { date: '2026-05-24', assets: 210 },
      { date: '2026-05-25', assets: 245 },
      { date: '2026-05-26', assets: 235 },
      { date: '2026-05-27', assets: 260 },
      { date: '2026-05-28', assets: 244 },
    ]
  },
  nightDrivers: [
    { rank: '#1', vehicle: 'Z 442 ABM HOWO TR', hours: '38.45 hrs' },
    { rank: '#2', vehicle: 'Z 819 BND SCANIA P410', hours: '35.12 hrs' },
    { rank: '#3', vehicle: 'Z 102 DFY FAW TRACTOR', hours: '31.90 hrs' },
    { rank: '#4', vehicle: 'Z 339 CXZ HOWO TR', hours: '29.40 hrs' },
    { rank: '#5', vehicle: 'Z 509 EKN TIPER TR', hours: '27.15 hrs' },
  ],
  speedViolators: [
    { vehicle: 'ZMB 8841 ZM LUSAKA', total: 145, major: 120, severe: 25, maxSpeed: 142 },
    { vehicle: 'ZMB 1102 ZM CHOMA', total: 95, major: 92, severe: 3, maxSpeed: 112 },
    { vehicle: 'ZMB 7349 ZM KITWE', total: 110, major: 104, severe: 6, maxSpeed: 119 },
    { vehicle: 'ZMB 5090 ZM NDOLA', total: 84, major: 70, severe: 14, maxSpeed: 124 },
    { vehicle: 'ZMB 3119 ZM KABWE', total: 121, major: 120, severe: 1, maxSpeed: 104 },
  ]
};

const ASAS_RED = '#C0392B';

export const DashboardScreen: React.FC = () => {
  const navigation = useNavigation();

  // State triggers for dynamic interactions
  const [activeRegion, setActiveRegion] = useState<'TZ' | 'ZM'>('TZ');
  const [activeDateRange, setActiveDateRange] = useState<'1D' | '7D' | 'MTD' | '30D'>('7D');
  const [dailyAssetsRange, setDailyAssetsRange] = useState<'7D' | 'MTD' | '30D'>('7D');
  const [movementRange, setMovementRange] = useState<'7D' | 'MTD' | '30D'>('7D');
  const [fuelRange, setFuelRange] = useState<'7D' | 'MTD' | '30D'>('7D');
  const [nightDriversRange, setNightDriversRange] = useState<'1D' | '7D' | 'MTD' | '30D'>('7D');
  const [speedRange, setSpeedRange] = useState<'1D' | '7D' | 'MTD' | '30D'>('7D');

  const currentData = activeRegion === 'TZ' ? DATA_TZ : DATA_ZM;

  // Header height logic
  const STATUS_BAR_HEIGHT = Platform.OS === 'android' ? (StatusBar.currentHeight || 40) : 44;

  const handleRefresh = () => {
    alert('Simulating operations data synchronization... Telemetry successfully updated!');
  };

  const handleDownloadPDF = () => {
    alert('Preparing custom enterprise report document... Fleet Performance PDF exported successfully.');
  };

  // -------------------------------------------------------------
  // CUSTOM RESPONSIVE SVG CHART RENDERING ENGINE
  // -------------------------------------------------------------
  const renderSingleLineChart = (
    data: number[],
    lineColor: string,
    width: number,
    height: number,
    yScaleMax = 600,
    yScaleMin = 0
  ) => {
    const paddingLeft = 30;
    const paddingRight = 10;
    const paddingTop = 15;
    const paddingBottom = 20;

    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    // Generate path points
    const stepX = chartWidth / (data.length - 1);
    const scaleY = chartHeight / (yScaleMax - yScaleMin);

    const points = data.map((val, idx) => {
      const x = paddingLeft + idx * stepX;
      const y = paddingTop + chartHeight - (val - yScaleMin) * scaleY;
      return { x, y, value: val };
    });

    let pathD = '';
    points.forEach((pt, idx) => {
      if (idx === 0) {
        pathD += `M ${pt.x} ${pt.y}`;
      } else {
        pathD += ` L ${pt.x} ${pt.y}`;
      }
    });

    // Helper gridlines
    const gridLines = [];
    const steps = 4;
    for (let i = 0; i <= steps; i++) {
      const ratio = i / steps;
      const y = paddingTop + chartHeight * ratio;
      const labelVal = Math.round(yScaleMax - (yScaleMax - yScaleMin) * ratio);
      gridLines.push({ y, label: labelVal.toString() });
    }

    return (
      <Svg width={width} height={height}>
        {gridLines.map((line, idx) => (
          <React.Fragment key={idx}>
            <Line
              x1={paddingLeft}
              y1={line.y}
              x2={width - paddingRight}
              y2={line.y}
              stroke="#ECE0DF"
              strokeWidth={1}
              strokeDasharray="4 4"
            />
            <Line
              x1={paddingLeft - 4}
              y1={line.y}
              x2={paddingLeft}
              y2={line.y}
              stroke="#8D706C"
              strokeWidth={1}
            />
          </React.Fragment>
        ))}

        <Path d={pathD} fill="none" stroke={lineColor} strokeWidth={2.5} />

        {points.map((pt, idx) => (
          <Circle
            key={idx}
            cx={pt.x}
            cy={pt.y}
            r={4}
            fill="#FFFFFF"
            stroke={lineColor}
            strokeWidth={2.5}
          />
        ))}
      </Svg>
    );
  };

  const renderDoubleLineChart = (
    data1: number[],
    data2: number[],
    color1: string,
    color2: string,
    width: number,
    height: number,
    yScaleMax = 100,
    yScaleMin = 0
  ) => {
    const paddingLeft = 30;
    const paddingRight = 10;
    const paddingTop = 15;
    const paddingBottom = 20;

    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    const stepX = chartWidth / (data1.length - 1);
    const scaleY = chartHeight / (yScaleMax - yScaleMin);

    const points1 = data1.map((val, idx) => {
      const x = paddingLeft + idx * stepX;
      const y = paddingTop + chartHeight - (val - yScaleMin) * scaleY;
      return { x, y };
    });

    const points2 = data2.map((val, idx) => {
      const x = paddingLeft + idx * stepX;
      const y = paddingTop + chartHeight - (val - yScaleMin) * scaleY;
      return { x, y };
    });

    let pathD1 = '';
    points1.forEach((pt, idx) => {
      if (idx === 0) pathD1 += `M ${pt.x} ${pt.y}`;
      else pathD1 += ` L ${pt.x} ${pt.y}`;
    });

    let pathD2 = '';
    points2.forEach((pt, idx) => {
      if (idx === 0) pathD2 += `M ${pt.x} ${pt.y}`;
      else pathD2 += ` L ${pt.x} ${pt.y}`;
    });

    // Horizontal helper grid lines
    const gridLines = [];
    const steps = 4;
    for (let i = 0; i <= steps; i++) {
      const ratio = i / steps;
      const y = paddingTop + chartHeight * ratio;
      const labelVal = Math.round(yScaleMax - (yScaleMax - yScaleMin) * ratio);
      gridLines.push({ y, label: labelVal.toString() });
    }

    return (
      <Svg width={width} height={height}>
        {gridLines.map((line, idx) => (
          <React.Fragment key={idx}>
            <Line
              x1={paddingLeft}
              y1={line.y}
              x2={width - paddingRight}
              y2={line.y}
              stroke="#ECE0DF"
              strokeWidth={1}
              strokeDasharray="4 4"
            />
          </React.Fragment>
        ))}

        <Path d={pathD1} fill="none" stroke={color1} strokeWidth={2} />
        <Path d={pathD2} fill="none" stroke={color2} strokeWidth={2} />

        {points1.map((pt, idx) => (
          <Circle
            key={`c1-${idx}`}
            cx={pt.x}
            cy={pt.y}
            r={3.5}
            fill="#FFFFFF"
            stroke={color1}
            strokeWidth={2}
          />
        ))}

        {points2.map((pt, idx) => (
          <Circle
            key={`c2-${idx}`}
            cx={pt.x}
            cy={pt.y}
            r={3.5}
            fill="#FFFFFF"
            stroke={color2}
            strokeWidth={2}
          />
        ))}
      </Svg>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      {/* -------------------------------------------------------------
          STICKY BRAND RED HEADER
          ------------------------------------------------------------- */}
      <View style={[styles.header, { height: 56 + STATUS_BAR_HEIGHT, paddingTop: STATUS_BAR_HEIGHT }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <ArrowLeft color="#FFFFFF" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dashboards</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* -------------------------------------------------------------
            OPERATIONS OVERVIEW SECTION
            ------------------------------------------------------------- */}
        <View style={styles.overviewSection}>
          <View style={styles.overviewHeaderRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.overviewTitle}>Operations Overview</Text>
              <Text style={styles.overviewSubtitle}>
                {activeRegion === 'TZ' ? 'Tanzanian Ops' : 'Zambian Ops'}
              </Text>
              <Text style={styles.overviewDesc}>Real-time fleet monitoring and analytics</Text>
            </View>
            <View style={styles.overviewActionContainer}>
              <TouchableOpacity
                style={styles.outlinedCompactBtn}
                onPress={handleRefresh}
                activeOpacity={0.7}
              >
                <RotateCw size={14} color="#C0392B" style={{ marginRight: 4 }} />
                <Text style={styles.outlinedCompactBtnText}>Refresh All</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.outlinedCompactBtn}
                onPress={handleDownloadPDF}
                activeOpacity={0.7}
              >
                <Download size={14} color="#C0392B" style={{ marginRight: 4 }} />
                <Text style={styles.outlinedCompactBtnText}>Download PDF</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Region Tabs (TZ vs ZM) */}
          <View style={styles.regionSelectorRow}>
            <TouchableOpacity
              style={[
                styles.regionTab,
                activeRegion === 'TZ' ? styles.regionTabActive : styles.regionTabInactive,
              ]}
              onPress={() => setActiveRegion('TZ')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.regionTabText,
                  activeRegion === 'TZ' ? styles.regionTabTextActive : styles.regionTabTextInactive,
                ]}
              >
                TZ Ops
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.regionTab,
                activeRegion === 'ZM' ? styles.regionTabActive : styles.regionTabInactive,
              ]}
              onPress={() => setActiveRegion('ZM')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.regionTabText,
                  activeRegion === 'ZM' ? styles.regionTabTextActive : styles.regionTabTextInactive,
                ]}
              >
                ZM Ops
              </Text>
            </TouchableOpacity>
          </View>

          {/* Date Selector Segmented Grid */}
          <View style={styles.dateSelectorRow}>
            {(['1D', '7D', 'MTD', '30D'] as const).map((range) => (
              <TouchableOpacity
                key={range}
                style={[
                  styles.datePill,
                  activeDateRange === range ? styles.datePillActive : styles.datePillInactive,
                ]}
                onPress={() => setActiveDateRange(range)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.datePillText,
                    activeDateRange === range ? styles.datePillTextActive : styles.datePillTextInactive,
                  ]}
                >
                  {range === '1D' ? '1 Day' : range === '7D' ? '7 Days' : range === 'MTD' ? 'MTD' : '30 Days'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* -------------------------------------------------------------
            SUMMARY METRICS SECTION
            ------------------------------------------------------------- */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeadingTitle}>SUMMARY METRICS</Text>
        </View>

        {/* Trip Statistics Card */}
        <View style={styles.dashboardCard}>
          <View style={styles.cardHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={[styles.cardIconBox, { backgroundColor: '#FDEDEC' }]}>
                <TrendingUp size={18} color="#C0392B" />
              </View>
              <Text style={styles.cardTitle}>Trip Statistics</Text>
            </View>
          </View>
          <View style={styles.metricsGrid}>
            {currentData.tripStats.map((item, idx) => (
              <View key={idx} style={styles.metricGridItem}>
                <Text style={styles.metricItemLabel}>{item.label}</Text>
                <Text style={styles.metricItemValue}>{item.value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Fleet Statistics Card */}
        <View style={styles.dashboardCard}>
          <View style={styles.cardHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={[styles.cardIconBox, { backgroundColor: '#EAFAF1' }]}>
                <Fuel size={18} color="#27AE60" />
              </View>
              <Text style={styles.cardTitle}>Fleet Statistics</Text>
            </View>
          </View>
          <View style={styles.metricsGrid}>
            {currentData.fleetStats.map((item, idx) => (
              <View key={idx} style={styles.metricGridItem}>
                <Text style={styles.metricItemLabel}>{item.label}</Text>
                <Text style={styles.metricItemValue}>{item.value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* -------------------------------------------------------------
            DAILY ASSETS ACTIVE CARD
            ------------------------------------------------------------- */}
        <View style={styles.dashboardCard}>
          <View style={styles.cardHeaderWithFilter}>
            <View>
              <Text style={styles.cardTitle}>Daily Assets Active</Text>
              <Text style={styles.cardSubtitle}>Data through May 28, 2026</Text>
            </View>
            <View style={styles.cardFilterPillsRow}>
              {(['7D', 'MTD', '30D'] as const).map((pill) => (
                <TouchableOpacity
                  key={pill}
                  style={[
                    styles.miniFilterPill,
                    dailyAssetsRange === pill ? styles.miniFilterPillActive : styles.miniFilterPillInactive,
                  ]}
                  onPress={() => setDailyAssetsRange(pill)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.miniFilterPillText,
                      dailyAssetsRange === pill ? styles.miniFilterPillTextActive : null,
                    ]}
                  >
                    {pill === '7D' ? '7 Days' : pill === 'MTD' ? 'MTD' : '30 Days'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* SVG Line Chart */}
          <View style={styles.chartWrapper}>
            {renderSingleLineChart(
              currentData.dailyAssets.chartData,
              '#C0392B',
              SCREEN_WIDTH - 64, // Card padding is 16 on each side
              150,
              600,
              0
            )}
          </View>

          {/* Recent Data Table Panel */}
          <View style={styles.tablePanel}>
            <Text style={styles.tablePanelHeader}>Recent Data</Text>
            <View style={styles.tableRowHeader}>
              <Text style={styles.tableColHeaderLeft}>Date</Text>
              <Text style={styles.tableColHeaderRight}>Assets</Text>
            </View>
            {currentData.dailyAssets.recentRows.map((row, idx) => (
              <View key={idx} style={styles.tableRowBody}>
                <Text style={styles.tableCellLeft}>{row.date}</Text>
                <Text style={styles.tableCellRight}>{row.assets}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* -------------------------------------------------------------
            IN MOVEMENT VS IDLING CARD
            ------------------------------------------------------------- */}
        <View style={styles.dashboardCard}>
          <View style={styles.cardHeaderWithFilter}>
            <View>
              <Text style={styles.cardTitle}>In Movement vs Idling</Text>
            </View>
            <View style={styles.cardFilterPillsRow}>
              {(['7D', 'MTD', '30D'] as const).map((pill) => (
                <TouchableOpacity
                  key={pill}
                  style={[
                    styles.miniFilterPill,
                    movementRange === pill ? styles.miniFilterPillActive : styles.miniFilterPillInactive,
                  ]}
                  onPress={() => setMovementRange(pill)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.miniFilterPillText,
                      movementRange === pill ? styles.miniFilterPillTextActive : null,
                    ]}
                  >
                    {pill === '7D' ? '7 Days' : pill === 'MTD' ? 'MTD' : '30 Days'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Legend */}
          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#27AE60' }]} />
              <Text style={styles.legendText}>Total Idling Hours</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#3498DB' }]} />
              <Text style={styles.legendText}>Total Movement Hours</Text>
            </View>
          </View>

          {/* Dual Line SVG Chart */}
          <View style={styles.chartWrapper}>
            {renderDoubleLineChart(
              [1400, 1600, 1380, 1550, 1420, 1580, 1440], // Movement hours
              [600, 500, 680, 480, 520, 580, 450], // Idling hours
              '#3498DB',
              '#27AE60',
              SCREEN_WIDTH - 64,
              150,
              2600,
              0
            )}
          </View>
        </View>

        {/* -------------------------------------------------------------
            FUEL EXPENSE OVER TIME CARD
            ------------------------------------------------------------- */}
        <View style={styles.dashboardCard}>
          <View style={styles.cardHeaderWithFilter}>
            <View>
              <Text style={styles.cardTitle}>Fuel Expense Over Time</Text>
            </View>
            <View style={styles.cardFilterPillsRow}>
              {(['7D', 'MTD', '30D'] as const).map((pill) => (
                <TouchableOpacity
                  key={pill}
                  style={[
                    styles.miniFilterPill,
                    fuelRange === pill ? styles.miniFilterPillActive : styles.miniFilterPillInactive,
                  ]}
                  onPress={() => setFuelRange(pill)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.miniFilterPillText,
                      fuelRange === pill ? styles.miniFilterPillTextActive : null,
                    ]}
                  >
                    {pill === '7D' ? '7 Days' : pill === 'MTD' ? 'MTD' : '30 Days'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Legend */}
          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#2980B9' }]} />
              <Text style={styles.legendText}>Fuel (Motion)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#E67E22' }]} />
              <Text style={styles.legendText}>Fuel (Idling)</Text>
            </View>
          </View>

          {/* Dual Line SVG Chart */}
          <View style={styles.chartWrapper}>
            {renderDoubleLineChart(
              [45000, 52000, 40000, 48000, 42000, 49000, 41000], // Fuel motion
              [8000, 9500, 7500, 8800, 8200, 9100, 7800], // Fuel idling
              '#2980B9',
              '#E67E22',
              SCREEN_WIDTH - 64,
              150,
              80000,
              0
            )}
          </View>
        </View>

        {/* -------------------------------------------------------------
            NIGHT DRIVERS ANALYSIS
            ------------------------------------------------------------- */}
        <View style={styles.dashboardCard}>
          <View style={styles.cardHeaderWithFilter}>
            <View>
              <Text style={styles.cardTitle}>Night Drivers Analysis</Text>
            </View>
            <View style={styles.cardFilterPillsRow}>
              {(['1D', '7D', 'MTD', '30D'] as const).map((pill) => (
                <TouchableOpacity
                  key={pill}
                  style={[
                    styles.miniFilterPill,
                    nightDriversRange === pill ? styles.miniFilterPillActive : styles.miniFilterPillInactive,
                  ]}
                  onPress={() => setNightDriversRange(pill)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.miniFilterPillText,
                      nightDriversRange === pill ? styles.miniFilterPillTextActive : null,
                    ]}
                  >
                    {pill === '1D' ? '1 Day' : pill === '7D' ? '7 Days' : pill === 'MTD' ? 'MTD' : '30 Days'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* SVG Graph for Night Driving Hours */}
          <View style={styles.chartWrapper}>
            <Text style={styles.chartTitleTag}>Night Driving Hours Over Time</Text>
            {renderSingleLineChart(
              [72, 85, 68, 74, 80, 65, 78],
              '#C0392B',
              SCREEN_WIDTH - 64,
              120,
              120,
              0
            )}
            <View style={styles.legendContainerCenter}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#C0392B' }]} />
                <Text style={styles.legendText}>Night Driving Hours</Text>
              </View>
            </View>
          </View>

          {/* Mobile Ranked List (Replacer for Desktop Tables) */}
          <View style={styles.rankedListContainer}>
            <Text style={styles.rankedListHeader}>Top Night Drivers</Text>
            {currentData.nightDrivers.map((item, idx) => (
              <View key={idx} style={styles.rankedItemRow}>
                <View style={styles.rankedItemLeft}>
                  <View style={[
                    styles.rankBadge,
                    idx === 0 ? styles.rankBadgeGold : idx === 1 ? styles.rankBadgeSilver : styles.rankBadgeBronze
                  ]}>
                    <Text style={styles.rankBadgeText}>{item.rank}</Text>
                  </View>
                  <Text style={styles.rankedVehicleName} numberOfLines={1} ellipsizeMode="tail">
                    {item.vehicle}
                  </Text>
                </View>
                <View style={styles.rankedItemRight}>
                  <Moon size={12} color="#8D706C" style={{ marginRight: 4 }} />
                  <Text style={styles.rankedValueText}>{item.hours}</Text>
                </View>
              </View>
            ))}

            <TouchableOpacity
              style={styles.cardViewAllBtn}
              onPress={() => alert('Launching Top Night Drivers complete list sheet...')}
              activeOpacity={0.7}
            >
              <Text style={styles.cardViewAllBtnText}>View All Night Drivers</Text>
              <ChevronRight size={14} color="#C0392B" />
            </TouchableOpacity>
          </View>
        </View>

        {/* -------------------------------------------------------------
            SPEED VIOLATIONS CARD
            ------------------------------------------------------------- */}
        <View style={styles.dashboardCard}>
          <View style={styles.cardHeaderWithFilter}>
            <View>
              <Text style={styles.cardTitle}>Speed Violations</Text>
            </View>
            <View style={styles.cardFilterPillsRow}>
              {(['1D', '7D', 'MTD', '30D'] as const).map((pill) => (
                <TouchableOpacity
                  key={pill}
                  style={[
                    styles.miniFilterPill,
                    speedRange === pill ? styles.miniFilterPillActive : styles.miniFilterPillInactive,
                  ]}
                  onPress={() => setSpeedRange(pill)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.miniFilterPillText,
                      speedRange === pill ? styles.miniFilterPillTextActive : null,
                    ]}
                  >
                    {pill === '1D' ? '1 Day' : pill === '7D' ? '7 Days' : pill === 'MTD' ? 'MTD' : '30 Days'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* SVG Graph for Speeding */}
          <View style={styles.chartWrapper}>
            <Text style={styles.chartTitleTag}>Speeding Violations by Day</Text>
            {renderDoubleLineChart(
              [700, 650, 580, 620, 520, 680, 600], // Major violations
              [250, 200, 180, 220, 160, 240, 210], // Severe violations
              '#E67E22',
              '#C0392B',
              SCREEN_WIDTH - 64,
              120,
              1000,
              0
            )}
            <View style={styles.legendContainer}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#E67E22' }]} />
                <Text style={styles.legendText}>Major Violations</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#C0392B' }]} />
                <Text style={styles.legendText}>Severe Violations</Text>
              </View>
            </View>
          </View>

          {/* Mobile Stacked Infraction Cards (Replacer for Desktop Tables) */}
          <View style={styles.rankedListContainer}>
            <Text style={styles.rankedListHeader}>Top Violators</Text>
            {currentData.speedViolators.map((item, idx) => (
              <View key={idx} style={styles.violatorCard}>
                <View style={styles.violatorCardHeader}>
                  <Text style={styles.violatorCardVehicle}>{item.vehicle}</Text>
                  <View style={styles.violatorCardMaxSpeedContainer}>
                    <Zap size={10} color="#BA1A1A" style={{ marginRight: 2 }} />
                    <Text style={styles.violatorCardMaxSpeedText}>{item.maxSpeed} km/h Max</Text>
                  </View>
                </View>
                <View style={styles.violatorStatsRow}>
                  <View style={styles.violatorStatBadge}>
                    <Text style={styles.violatorStatValue}>{item.total}</Text>
                    <Text style={styles.violatorStatLabel}>Total</Text>
                  </View>
                  <View style={[styles.violatorStatBadge, { backgroundColor: '#FFF5E6' }]}>
                    <Text style={[styles.violatorStatValue, { color: '#E67E22' }]}>{item.major}</Text>
                    <Text style={[styles.violatorStatLabel, { color: '#E67E22' }]}>Major</Text>
                  </View>
                  <View style={[styles.violatorStatBadge, { backgroundColor: '#FDEDEC' }]}>
                    <Text style={[styles.violatorStatValue, { color: '#C0392B' }]}>{item.severe}</Text>
                    <Text style={[styles.violatorStatLabel, { color: '#C0392B' }]}>Severe</Text>
                  </View>
                </View>
              </View>
            ))}

            <TouchableOpacity
              style={styles.cardViewAllBtn}
              onPress={() => alert('Launching Top Speed Violators details sheet...')}
              activeOpacity={0.7}
            >
              <Text style={styles.cardViewAllBtnText}>View All Speed Violators</Text>
              <ChevronRight size={14} color="#C0392B" />
            </TouchableOpacity>
          </View>
        </View>

        {/* -------------------------------------------------------------
            FOOTER SIGNATURE
            ------------------------------------------------------------- */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Powered by Uni Fleet Intelligence</Text>
          <Text style={styles.footerVersion}>v4.2.1-stable</Text>
        </View>
      </ScrollView>
    </View>
  );
};

// -------------------------------------------------------------
// PREMIUM STYLING DESIGN SYSTEM (VANILLA STYLESHEET)
// -------------------------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: ASAS_RED,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: '#FAF6F5',
  },
  scrollContent: {
    paddingBottom: 40,
  },

  // ---- Overview Section ----
  overviewSection: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2ECEB',
  },
  overviewHeaderRow: {
    flexDirection: 'column',
    gap: 8,
  },
  overviewTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#261816',
    letterSpacing: 0.5,
  },
  overviewSubtitle: {
    fontSize: 16,
    fontWeight: '700',
    color: ASAS_RED,
    marginTop: 2,
  },
  overviewDesc: {
    fontSize: 13,
    color: '#59413D',
    marginTop: 2,
  },
  overviewActionContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  outlinedCompactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ECE0DF',
    backgroundColor: '#FFFFFF',
  },
  outlinedCompactBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#BA1A1A',
  },
  regionSelectorRow: {
    flexDirection: 'row',
    backgroundColor: '#F5ECEB',
    borderRadius: 8,
    padding: 3,
    marginTop: 16,
  },
  regionTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  regionTabActive: {
    backgroundColor: ASAS_RED,
  },
  regionTabInactive: {
    backgroundColor: 'transparent',
  },
  regionTabText: {
    fontSize: 13,
    fontWeight: '700',
  },
  regionTabTextActive: {
    color: '#FFFFFF',
  },
  regionTabTextInactive: {
    color: '#59413D',
  },
  dateSelectorRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 12,
  },
  datePill: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
    borderWidth: 1,
  },
  datePillActive: {
    backgroundColor: ASAS_RED,
    borderColor: ASAS_RED,
  },
  datePillInactive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#ECE0DF',
  },
  datePillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  datePillTextActive: {
    color: '#FFFFFF',
  },
  datePillTextInactive: {
    color: '#59413D',
  },

  // ---- Summary Metrics ----
  sectionHeaderRow: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 8,
  },
  sectionHeadingTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#8D706C',
    letterSpacing: 1.5,
  },

  // ---- Card Layouts ----
  dashboardCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F2ECEB',
    shadowColor: '#261816',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardHeaderWithFilter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#261816',
  },
  cardSubtitle: {
    fontSize: 11,
    color: '#8D706C',
    marginTop: 2,
  },
  cardIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  cardFilterPillsRow: {
    flexDirection: 'row',
    backgroundColor: '#F5ECEB',
    borderRadius: 6,
    padding: 2,
  },
  miniFilterPill: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  miniFilterPillActive: {
    backgroundColor: ASAS_RED,
  },
  miniFilterPillInactive: {
    backgroundColor: 'transparent',
  },
  miniFilterPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#59413D',
  },
  miniFilterPillTextActive: {
    color: '#FFFFFF',
  },

  // ---- KPI Metric Grid ----
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  metricGridItem: {
    width: '50%',
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
  metricItemLabel: {
    fontSize: 11,
    color: '#8D706C',
    lineHeight: 14,
    marginBottom: 4,
  },
  metricItemValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#261816',
  },

  // ---- Charts ----
  chartWrapper: {
    marginTop: 8,
    alignItems: 'center',
  },
  chartTitleTag: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8D706C',
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginVertical: 10,
    flexWrap: 'wrap',
  },
  legendContainerCenter: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    fontSize: 11,
    color: '#59413D',
    fontWeight: '600',
  },

  // ---- Recent Data Panel (Table Replacement) ----
  tablePanel: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#ECE0DF',
    paddingTop: 14,
  },
  tablePanelHeader: {
    fontSize: 13,
    fontWeight: '800',
    color: '#261816',
    marginBottom: 8,
  },
  tableRowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#ECE0DF',
  },
  tableColHeaderLeft: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8D706C',
  },
  tableColHeaderRight: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8D706C',
    textAlign: 'right',
  },
  tableRowBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#FAF6F5',
  },
  tableCellLeft: {
    fontSize: 12,
    color: '#261816',
    fontWeight: '500',
  },
  tableCellRight: {
    fontSize: 12,
    color: '#261816',
    fontWeight: '700',
    textAlign: 'right',
  },

  // ---- Mobile Ranked Lists ----
  rankedListContainer: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#ECE0DF',
    paddingTop: 14,
  },
  rankedListHeader: {
    fontSize: 13,
    fontWeight: '800',
    color: '#261816',
    marginBottom: 10,
  },
  rankedItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#FAF6F5',
  },
  rankedItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  rankBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  rankBadgeGold: {
    backgroundColor: '#FEF9E7',
    borderWidth: 1,
    borderColor: '#F1C40F',
  },
  rankBadgeSilver: {
    backgroundColor: '#F8F9F9',
    borderWidth: 1,
    borderColor: '#BDC3C7',
  },
  rankBadgeBronze: {
    backgroundColor: '#F5EEF8',
    borderWidth: 1,
    borderColor: '#AF7AC5',
  },
  rankBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#59413D',
  },
  rankedVehicleName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#261816',
    flex: 1,
  },
  rankedItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rankedValueText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#BA1A1A',
  },
  cardViewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    marginTop: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ECE0DF',
  },
  cardViewAllBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#BA1A1A',
    marginRight: 4,
  },

  // ---- Stacked Infraction Cards (Speeding) ----
  violatorCard: {
    backgroundColor: '#FFFBFB',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ECE0DF',
    padding: 10,
    marginBottom: 8,
  },
  violatorCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  violatorCardVehicle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#261816',
  },
  violatorCardMaxSpeedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDEDEC',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  violatorCardMaxSpeedText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#C0392B',
  },
  violatorStatsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  violatorStatBadge: {
    flex: 1,
    backgroundColor: '#F5ECEB',
    borderRadius: 6,
    paddingVertical: 4,
    alignItems: 'center',
  },
  violatorStatValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#59413D',
  },
  violatorStatLabel: {
    fontSize: 9,
    color: '#8D706C',
    fontWeight: '600',
    marginTop: 1,
  },

  // ---- Footer ----
  footer: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 16,
  },
  footerText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#8D706C',
  },
  footerVersion: {
    fontSize: 10,
    color: '#ECE0DF',
    marginTop: 4,
  },
});
