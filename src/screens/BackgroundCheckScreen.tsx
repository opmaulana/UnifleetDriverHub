import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { theme } from '../theme/theme';
import { Button } from '../components/Button';
import { MapPin, Bell, ShieldCheck, CheckSquare, Square } from 'lucide-react-native';
import { useStore } from '../store/useStore';
import * as Location from 'expo-location';
// Notifications removed temporarily to prevent Expo Go SDK 53+ crash
// import * as Notifications from 'expo-notifications';

export const BackgroundCheckScreen = ({ navigation, route }: any) => {
  const login = useStore(state => state.login);
  const { name, vehicle, phone } = route.params || { name: 'Driver', vehicle: 'Unknown', phone: '0700000000' };

  const [locationConsent, setLocationConsent] = useState(false);
  const [policyConsent, setPolicyConsent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRequestPermissions = async () => {
    if (!locationConsent || !policyConsent) {
      Alert.alert('Consent Required', 'Please agree to both policies to continue.');
      return;
    }

    setIsLoading(true);
    
    try {
      // 1. Foreground Location
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      if (foregroundStatus !== 'granted') {
        Alert.alert('Permission Denied', 'Foreground location permission is required for dispatch.');
        setIsLoading(false);
        return;
      }

      // 2. Background Location
      const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
      if (backgroundStatus !== 'granted') {
        // Just a warning for now, as background might require deeper OS settings
        console.warn('Background location permission denied');
      }

      // 3. Notifications (Mocked for Expo Go compatibility)
      // The actual library crashes Expo Go on SDK 53+, requires Dev Build
      await new Promise(resolve => setTimeout(resolve, 300));

      // Mock completion - login and persist auth state
      login(phone);
      
      // Navigate to main driver hub
      navigation.replace('Main');
      
    } catch (error) {
      console.error('Error requesting permissions', error);
      Alert.alert('Error', 'An error occurred while requesting permissions.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.iconContainer}>
          <ShieldCheck size={48} color={theme.colors.primary} />
        </View>
        <Text style={styles.title}>Operational Permissions</Text>
        <Text style={styles.subtitle}>
          ASAS Fleet requires certain permissions to assign trips and ensure operational compliance.
        </Text>

        <View style={styles.list}>
          <View style={styles.listItem}>
            <View style={styles.itemIcon}>
              <MapPin color={theme.colors.primary} size={24} />
            </View>
            <View style={styles.itemTextContainer}>
              <Text style={styles.listTitle}>Live Location Tracking</Text>
              <Text style={styles.listText}>
                Required to determine your position for trip assignments and calculate accurate ETAs.
              </Text>
            </View>
          </View>
          
          <View style={styles.listItem}>
            <View style={styles.itemIcon}>
              <MapPin color={theme.colors.warning} size={24} />
            </View>
            <View style={styles.itemTextContainer}>
              <Text style={styles.listTitle}>Background Tracking</Text>
              <Text style={styles.listText}>
                Required during active trips so management can monitor fleet safety even when the app is minimized.
              </Text>
            </View>
          </View>

          <View style={styles.listItem}>
            <View style={styles.itemIcon}>
              <Bell color={theme.colors.primary} size={24} />
            </View>
            <View style={styles.itemTextContainer}>
              <Text style={styles.listTitle}>Push Notifications</Text>
              <Text style={styles.listText}>
                Required to instantly receive new dispatch requests and route updates.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.consentSection}>
          <TouchableOpacity 
            style={styles.checkboxRow} 
            onPress={() => setLocationConsent(!locationConsent)}
            activeOpacity={0.7}
          >
            {locationConsent ? (
              <CheckSquare color={theme.colors.primary} size={24} />
            ) : (
              <Square color={theme.colors.textSecondary} size={24} />
            )}
            <Text style={styles.checkboxText}>
              I consent to location tracking for operational fleet purposes.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.checkboxRow} 
            onPress={() => setPolicyConsent(!policyConsent)}
            activeOpacity={0.7}
          >
            {policyConsent ? (
              <CheckSquare color={theme.colors.primary} size={24} />
            ) : (
              <Square color={theme.colors.textSecondary} size={24} />
            )}
            <Text style={styles.checkboxText}>
              I agree to the ASAS Telemetry & Operations Policy.
            </Text>
          </TouchableOpacity>
        </View>

        <Button
          title={isLoading ? "Configuring..." : "Enable Permissions"}
          onPress={handleRequestPermissions}
          style={styles.button}
          disabled={!locationConsent || !policyConsent || isLoading}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  content: {
    padding: theme.spacing.xl,
    paddingBottom: 40,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    marginTop: theme.spacing.lg,
  },
  title: {
    ...theme.typography.h2,
    color: theme.colors.text,
    textAlign: 'center',
  },
  subtitle: {
    ...theme.typography.bodyMd,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.md,
    lineHeight: 22,
  },
  list: {
    marginTop: theme.spacing.xl,
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    padding: theme.spacing.md,
  },
  listItem: {
    flexDirection: 'row',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  itemIcon: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 2,
  },
  itemTextContainer: {
    flex: 1,
  },
  listTitle: {
    ...theme.typography.bodyLg,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
  },
  listText: {
    ...theme.typography.bodyMd,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  consentSection: {
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.lg,
  },
  checkboxText: {
    ...theme.typography.bodyMd,
    color: theme.colors.text,
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  button: {
    marginTop: theme.spacing.md,
  }
});
