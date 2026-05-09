import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { theme } from '../theme/theme';
import { Home, Calendar, CheckCircle, Wallet, User } from 'lucide-react-native';

// Import Screens
import { SplashScreen } from '../screens/SplashScreen';
import { IntentSelectionScreen } from '../screens/IntentSelectionScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { OTPScreen } from '../screens/OTPScreen';
import { BackgroundCheckScreen } from '../screens/BackgroundCheckScreen';
import { ProfileSetupScreen } from '../screens/ProfileSetupScreen';
import { HomeDashboard } from '../screens/HomeDashboard';
import { UpcomingTripsScreen } from '../screens/UpcomingTripsScreen';
import { CompletedTripsScreen } from '../screens/CompletedTripsScreen';
import { EarningsScreen } from '../screens/EarningsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { TripDetailsScreen } from '../screens/TripDetailsScreen';
import { ProofOfDeliveryScreen } from '../screens/ProofOfDeliveryScreen';
import { TripSummaryScreen } from '../screens/TripSummaryScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { ManagementNavigator } from './ManagementNavigator';
import { OperationsNavigator } from './OperationsNavigator';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          ...theme.typography.labelSm,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeDashboard} 
        options={{
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tab.Screen 
        name="Upcoming" 
        component={UpcomingTripsScreen} 
        options={{
          tabBarIcon: ({ color, size }) => <Calendar color={color} size={size} />,
        }}
      />
      <Tab.Screen 
        name="Completed" 
        component={CompletedTripsScreen} 
        options={{
          tabBarIcon: ({ color, size }) => <CheckCircle color={color} size={size} />,
        }}
      />
      <Tab.Screen 
        name="Earnings" 
        component={EarningsScreen} 
        options={{
          tabBarIcon: ({ color, size }) => <Wallet color={color} size={size} />,
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
};

export const AppNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="IntentSelection" component={IntentSelectionScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="OTP" component={OTPScreen} />
      <Stack.Screen name="BackgroundCheck" component={BackgroundCheckScreen} />
      <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
      <Stack.Screen name="Main" component={TabNavigator} />
      <Stack.Screen name="TripDetails" component={TripDetailsScreen} />
      <Stack.Screen name="ProofOfDelivery" component={ProofOfDeliveryScreen} />
      <Stack.Screen name="TripSummary" component={TripSummaryScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="ManagementFlow" component={ManagementNavigator} />
      <Stack.Screen name="OperationsFlow" component={OperationsNavigator} />
    </Stack.Navigator>
  );
};
