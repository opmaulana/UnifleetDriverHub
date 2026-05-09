import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ManagementLogin } from '../screens/management/ManagementLogin';
import { ManagementDashboard } from '../screens/management/ManagementDashboard';
import { NominationForm } from '../screens/management/NominationForm';
import { ActiveNominations } from '../screens/management/ActiveNominations';
import { VehicleDetail } from '../screens/management/VehicleDetail';
import { UnloadingConfirmation } from '../screens/management/UnloadingConfirmation';

const Stack = createNativeStackNavigator();

export const ManagementNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ManagementLogin" component={ManagementLogin} />
      <Stack.Screen name="ManagementDashboard" component={ManagementDashboard} />
      <Stack.Screen name="NominationForm" component={NominationForm} />
      <Stack.Screen name="ActiveNominations" component={ActiveNominations} />
      <Stack.Screen name="VehicleDetail" component={VehicleDetail} />
      <Stack.Screen name="UnloadingConfirmation" component={UnloadingConfirmation} />
    </Stack.Navigator>
  );
};
