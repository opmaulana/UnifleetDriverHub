import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { theme } from '../theme/theme';

export const SplashScreen = ({ navigation }: any) => {
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(() => {
      navigation.replace('OnboardingIntro');
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={{ opacity: fadeAnim, alignItems: 'center' }}>
        <Text style={styles.logo}>ASAS</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    fontFamily: Platform.select({
      web: 'Playfair Display',
      default: 'PlayfairDisplay-Bold',
    }),
    color: theme.colors.primary,
    fontSize: 64,
    letterSpacing: -2,
    ...Platform.select({
      web: { fontWeight: '900' as const },
      default: {},
    }),
  },
  subtitle: {
    ...theme.typography.bodyMd,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
    letterSpacing: 4,
    textTransform: 'uppercase',
  },
});
