import React, { useRef, useEffect, useCallback } from 'react';
import { Easing } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Map, Truck, FileText, Bell, Settings } from 'lucide-react-native';
import { useOperationsStore } from '../store/useOperationsStore';

import { MapScreen } from '../screens/operations/MapScreen';
import { FleetScreen } from '../screens/operations/FleetScreen';
import { ReportsScreen } from '../screens/operations/ReportsScreen';
import { AlertsScreen } from '../screens/operations/AlertsScreen';
import { SettingsScreen } from '../screens/operations/SettingsScreen';
import { ReportDetailScreen } from '../screens/reports/ReportDetailScreen';
import { DashboardScreen } from '../screens/operations/DashboardScreen';
import { GeofenceAnalyticsScreen } from '../screens/operations/GeofenceAnalyticsScreen';
import { VehicleListScreen } from '../screens/operations/VehicleListScreen';
import { VehicleDetailsScreen } from '../screens/operations/VehicleDetailsScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const fadeTransition = {
  gestureEnabled: false,
  transitionSpec: {
    open: {
      animation: 'timing' as const,
      config: { 
        duration: 400,
        easing: Easing.out(Easing.ease),
      },
    },
    close: {
      animation: 'timing' as const,
      config: { 
        duration: 400,
        easing: Easing.out(Easing.ease),
      },
    },
  },
  cardStyleInterpolator: ({ current }: any) => ({
    cardStyle: {
      opacity: current.progress,
    },
  }),
};

const ASAS_RED = '#C0392B';

// ============================================================
// Bottom Tab Navigator (LIVE MAP / LIVE FLEET / LIVE ALERTS / SETTINGS)
// ============================================================
const OperationsTabNavigator = () => {
  const tabNavRef = useRef<any>(null);
  const { bootstrapFleet, updateTelemetry } = useOperationsStore();
  const hasBootstrapped = useRef(false);

  // Single centralized bootstrap — runs once for the entire tab navigator
  useEffect(() => {
    if (!hasBootstrapped.current) {
      hasBootstrapped.current = true;
      bootstrapFleet();
    }
  }, []);

  // Single centralized telemetry poller — runs once, shared across all tabs
  useEffect(() => {
    updateTelemetry();
    const interval = setInterval(() => {
      updateTelemetry();
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  // Callback to programmatically switch to Settings tab
  const navigateToSettings = useCallback((navigation: any) => {
    navigation.navigate('Settings');
  }, []);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: ASAS_RED,
        tabBarInactiveTintColor: '#8D706C',
        lazy: true,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0,
          height: 64,
          paddingBottom: 10,
          paddingTop: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          letterSpacing: 0.5,
        },
      }}
    >
      <Tab.Screen
        name="LiveMap"
        options={{
          tabBarLabel: 'LIVE MAP',
          tabBarIcon: ({ color }) => <Map color={color} size={20} />,
        }}
      >
        {(props) => (
          <MapScreen
            {...props}
            onNavigateToSettings={() => navigateToSettings(props.navigation)}
          />
        )}
      </Tab.Screen>
      <Tab.Screen
        name="LiveFleet"
        options={{
          tabBarLabel: 'LIVE FLEET',
          tabBarIcon: ({ color }) => <Truck color={color} size={20} />,
        }}
      >
        {(props) => (
          <FleetScreen
            {...props}
            onNavigateToSettings={() => navigateToSettings(props.navigation)}
          />
        )}
      </Tab.Screen>
      <Tab.Screen
        name="LiveReports"
        options={{
          tabBarLabel: 'LIVE REPORTS',
          tabBarIcon: ({ color }) => <FileText color={color} size={20} />,
        }}
      >
        {(props) => (
          <ReportsScreen
            {...props}
            onNavigateToSettings={() => navigateToSettings(props.navigation)}
          />
        )}
      </Tab.Screen>
      <Tab.Screen
        name="LiveAlerts"
        options={{
          tabBarLabel: 'LIVE ALERTS',
          tabBarIcon: ({ color }) => <Bell color={color} size={20} />,
          tabBarBadge: 3,
          tabBarBadgeStyle: {
            backgroundColor: ASAS_RED,
            color: '#FFFFFF',
            fontSize: 10,
            fontWeight: '700',
            minWidth: 18,
            height: 18,
            lineHeight: 18,
          },
        }}
      >
        {(props) => (
          <AlertsScreen
            {...props}
            onNavigateToSettings={() => navigateToSettings(props.navigation)}
          />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

// ============================================================
// Operations Stack Navigator (Login → Main Tabs)
// ============================================================
export const OperationsNavigator = () => {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        ...fadeTransition,
      }}
    >
      <Stack.Screen name="OperationsMain" component={OperationsTabNavigator} />
      <Stack.Screen name="ReportDetail" component={ReportDetailScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="GeofenceAnalytics" component={GeofenceAnalyticsScreen} />
      <Stack.Screen name="VehicleList" component={VehicleListScreen} />
      <Stack.Screen name="VehicleDetails" component={VehicleDetailsScreen} />
    </Stack.Navigator>
  );
};

