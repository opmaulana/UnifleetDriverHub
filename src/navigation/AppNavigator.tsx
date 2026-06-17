import React from 'react';
import { Easing } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { theme } from '../theme/theme';
import { Home, CheckCircle, Wallet, User } from 'lucide-react-native';

// Import Screens
import { SplashScreen } from '../screens/SplashScreen';
import { OnboardingIntroScreen } from '../screens/OnboardingIntroScreen';
import { IntentSelectionScreen } from '../screens/IntentSelectionScreen';
import { DriverSignupScreen } from '../screens/DriverSignupScreen';
import { DriverSignInScreen } from '../screens/DriverSignInScreen';
import { DriversIntroScreen } from '../screens/DriversIntroScreen';
import { OpsIntroScreen } from '../screens/OpsIntroScreen';
import { ManagementIntroScreen } from '../screens/ManagementIntroScreen';
import { OpsSignupScreen } from '../screens/OpsSignupScreen';
import { ApprovalPendingScreen } from '../screens/ApprovalPendingScreen';
import { HomeDashboard } from '../screens/HomeDashboard';

import { CompletedTripsScreen } from '../screens/CompletedTripsScreen';
import { EarningsScreen } from '../screens/EarningsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { TripDetailsScreen } from '../screens/TripDetailsScreen';
import { ProofOfDeliveryScreen } from '../screens/ProofOfDeliveryScreen';
import { TripSummaryScreen } from '../screens/TripSummaryScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { ManagementNavigator } from './ManagementNavigator';
import { OperationsNavigator } from './OperationsNavigator';

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
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        ...fadeTransition,
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="OnboardingIntro" component={OnboardingIntroScreen} />
      <Stack.Screen name="IntentSelection" component={IntentSelectionScreen} />
      <Stack.Screen name="DriversIntro" component={DriversIntroScreen} />
      <Stack.Screen name="OpsIntro" component={OpsIntroScreen} />
      <Stack.Screen name="ManagementIntro" component={ManagementIntroScreen} />
      <Stack.Screen name="DriverSignup" component={DriverSignupScreen} />
      <Stack.Screen name="OpsSignup" component={OpsSignupScreen} />
      <Stack.Screen name="DriverSignIn" component={DriverSignInScreen} />
      <Stack.Screen name="ApprovalPending" component={ApprovalPendingScreen} />
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
