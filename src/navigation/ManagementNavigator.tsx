import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, CheckSquare, Settings } from 'lucide-react-native';
import { theme } from '../theme/theme';
import { ManagementLogin } from '../screens/management/ManagementLogin';
import { ManagementDashboard } from '../screens/management/ManagementDashboard';
import { NominationForm } from '../screens/management/NominationForm';
import { ActiveNominations } from '../screens/management/ActiveNominations';
import { VehicleDetail } from '../screens/management/VehicleDetail';
import { UnloadingConfirmation } from '../screens/management/UnloadingConfirmation';
import { ApprovalsScreen } from '../screens/management/ApprovalsScreen';
import { ManagementSettingsScreen } from '../screens/management/ManagementSettingsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const ManagementTabs = () => {
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
        component={ManagementDashboard} 
        options={{
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tab.Screen 
        name="Approvals" 
        component={ApprovalsScreen} 
        options={{
          tabBarIcon: ({ color, size }) => <CheckSquare color={color} size={size} />,
        }}
      />
      <Tab.Screen 
        name="Settings" 
        component={ManagementSettingsScreen} 
        options={{
          tabBarIcon: ({ color, size }) => <Settings color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
};

export const ManagementNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ManagementLogin" component={ManagementLogin} />
      <Stack.Screen name="ManagementDashboard" component={ManagementTabs} />
      <Stack.Screen name="NominationForm" component={NominationForm} />
      <Stack.Screen name="ActiveNominations" component={ActiveNominations} />
      <Stack.Screen name="VehicleDetail" component={VehicleDetail} />
      <Stack.Screen name="UnloadingConfirmation" component={UnloadingConfirmation} />
    </Stack.Navigator>
  );
};
