import React, { useRef } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Map, Truck, Bell, Settings } from 'lucide-react-native';

// Screens
import { OperationsSignup } from '../screens/operations/OperationsSignup';
import { OperationsLogin } from '../screens/operations/OperationsLogin';
import { MapScreen } from '../screens/operations/MapScreen';
import { FleetScreen } from '../screens/operations/FleetScreen';
import { AlertsScreen } from '../screens/operations/AlertsScreen';
import { SettingsScreen } from '../screens/operations/SettingsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const ASAS_RED = '#C0392B';

// ============================================================
// Bottom Tab Navigator (LIVE MAP / LIVE FLEET / LIVE ALERTS / SETTINGS)
// ============================================================
const OperationsTabNavigator = () => {
  const tabNavRef = useRef<any>(null);

  // Callback to programmatically switch to Settings tab
  const navigateToSettings = (navigation: any) => {
    navigation.navigate('Settings');
  };

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: ASAS_RED,
        tabBarInactiveTintColor: '#8D706C',
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
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'SETTINGS',
          tabBarIcon: ({ color }) => <Settings color={color} size={20} />,
        }}
      />
    </Tab.Navigator>
  );
};

// ============================================================
// Operations Stack Navigator (Signup → Login → Main Tabs)
// ============================================================
export const OperationsNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="OperationsSignup" component={OperationsSignup} />
      <Stack.Screen name="OperationsLogin" component={OperationsLogin} />
      <Stack.Screen name="OperationsMain" component={OperationsTabNavigator} />
    </Stack.Navigator>
  );
};
