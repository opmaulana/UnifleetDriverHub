import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { AppNavigator } from './src/navigation/AppNavigator';
import { WebPhoneWrapper } from './src/components/WebPhoneWrapper';
import { useFonts } from 'expo-font';
import { ActivityIndicator, View, Text, TextInput, StyleSheet } from 'react-native';

// ============================================================================
// GLOBAL FONT INTERCEPTOR (Tinos Google Font Integration)
// ============================================================================
const patchTextComponent = (Component: any) => {
  if (!Component) return;
  const target = Component.render 
    ? Component 
    : (Component.type && Component.type.render ? Component.type : null);
  
  if (!target || !target.render) return;

  const oldRender = target.render;
  target.render = function (props: any, ref: any) {
    const origin = oldRender.call(this, props, ref);
    if (!origin) return origin;

    const style = origin.props.style;
    const flatStyle = StyleSheet.flatten(style) || {};

    let family = 'Tinos-Regular';
    const isBold = flatStyle.fontWeight === 'bold' || 
                   flatStyle.fontWeight === '700' || 
                   flatStyle.fontWeight === '800' || 
                   flatStyle.fontWeight === '900' || 
                   flatStyle.fontWeight === '600';
    const isItalic = flatStyle.fontStyle === 'italic';

    if (isBold && isItalic) {
      family = 'Tinos-BoldItalic';
    } else if (isBold) {
      family = 'Tinos-Bold';
    } else if (isItalic) {
      family = 'Tinos-Italic';
    }

    const resolvedFontFamily = flatStyle.fontFamily || family;

    // Apply the custom font family by merging it into the flattened style object to prevent array-style crashes on web
    return React.cloneElement(origin, {
      style: {
        ...flatStyle,
        fontFamily: resolvedFontFamily,
      },
    });
  };
};

// Patch both Text and TextInput to apply Tinos globally
patchTextComponent(Text);
patchTextComponent(TextInput);

export default function App() {
  const [fontsLoaded] = useFonts({
    'Tinos-Regular': require('./Tinos/Tinos-Regular.ttf'),
    'Tinos-Bold': require('./Tinos/Tinos-Bold.ttf'),
    'Tinos-Italic': require('./Tinos/Tinos-Italic.ttf'),
    'Tinos-BoldItalic': require('./Tinos/Tinos-BoldItalic.ttf'),
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: '#FFF8F6', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#C0392B" />
      </View>
    );
  }

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
