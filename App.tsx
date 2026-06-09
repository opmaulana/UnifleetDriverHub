import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { AppNavigator } from './src/navigation/AppNavigator';
import { WebPhoneWrapper } from './src/components/WebPhoneWrapper';

export default function App() {
  return (
    <SafeAreaProvider>
      <WebPhoneWrapper>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <StatusBar style="light" />
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </GestureHandlerRootView>
      </WebPhoneWrapper>
    </SafeAreaProvider>
  );
}

