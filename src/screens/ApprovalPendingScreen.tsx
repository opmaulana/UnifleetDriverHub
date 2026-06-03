import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Animated, ActivityIndicator } from 'react-native';
import { theme } from '../theme/theme';
import { Button } from '../components/Button';
import { supabase } from '../lib/supabase';
import { useStore } from '../store/useStore';

export const ApprovalPendingScreen = ({ navigation }: any) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { user, logout } = useStore();
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Poll Supabase every 5 seconds to check if approval status changed
    if (user?.driver_id) {
      pollingRef.current = setInterval(async () => {
        try {
          const { data } = await supabase
            .from('profiles')
            .select('approval_status')
            .eq('id', user.driver_id)
            .single();

          if (data?.approval_status === 'APPROVED') {
            // Update local state
            useStore.getState().setUser({ ...user, approval_status: 'APPROVED' });
            // Navigate to Main
            navigation.replace('Main');
          }
        } catch (e) {
          console.log('Polling error:', e);
        }
      }, 5000);
    }

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  const handleBackToHome = () => {
    // Log out and go back to intent selection
    logout();
    navigation.replace('IntentSelection');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.inner, { opacity: fadeAnim }]}>
        <View style={styles.logoContainer}>
          <Text style={styles.splashLogo}>ASAS</Text>
        </View>

        <View style={styles.messageContainer}>
          <Text style={styles.title}>Access Pending</Text>
          <Text style={styles.subtitle}>
            Please ask your manager to allow you to access the ASAS Drivers Hub.
          </Text>
          <ActivityIndicator color="rgba(255,255,255,0.7)" style={{ marginTop: 24 }} />
          <Text style={styles.pollingHint}>Checking automatically...</Text>
        </View>

        <Button 
          title="Logout & Go Back" 
          variant="outline"
          onPress={handleBackToHome}
          style={styles.btn}
        />
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.primary,
  },
  inner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  logoContainer: {
    marginBottom: 60,
  },
  splashLogo: {
    fontSize: 56,
    fontWeight: '900',
    color: theme.colors.white,
    letterSpacing: 2,
  },
  messageContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.white,
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    ...theme.typography.bodyLg,
    color: theme.colors.white,
    opacity: 0.9,
    textAlign: 'center',
    lineHeight: 24,
  },
  pollingHint: {
    ...theme.typography.bodyMd,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 8,
    fontSize: 12,
  },
  btn: {
    width: '100%',
    borderColor: 'rgba(255,255,255,0.3)',
  }
});

