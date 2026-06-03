import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView, Platform, Alert, ActivityIndicator, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import { theme } from '../theme/theme';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Shield } from 'lucide-react-native';
import { supabase } from '../lib/supabase';
import { useStore } from '../store/useStore';
import { fetchAllTrackerLabels } from '../lib/navixyApi';
import { getDeviceModel, getAppVersion, getTimezone, getLocale, getGPSLocation } from '../utils/deviceInfo';


export const DriverSignupScreen = ({ navigation }: any) => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [trackerName, setTrackerName] = useState('');
  const [trackerOptions, setTrackerOptions] = useState<string[]>([]);
  const [filteredOptions, setFilteredOptions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const login = useStore(state => state.login);

  useEffect(() => {
    const fetchTrackers = async () => {
      try {
        const labels = await fetchAllTrackerLabels();
        setTrackerOptions(labels);
      } catch (err) {
        console.log('Error fetching trackers from Navixy', err);
      }
    };
    fetchTrackers();
  }, []);

  const handleTrackerChange = (text: string) => {
    setTrackerName(text);
    if (text.length > 0) {
      const filtered = trackerOptions.filter(t => t.toLowerCase().includes(text.toLowerCase()));
      setFilteredOptions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSignup = async () => {
    if (!fullName || !phone || !trackerName) {
      Alert.alert('Missing Fields', 'Please fill in all details.');
      return;
    }

    setIsLoading(true);
    const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;

    try {
      // 0a. Check if this phone number already has a driver account
      const { data: phoneExists } = await supabase
        .from('profiles')
        .select('*')
        .eq('phone_number', formattedPhone)
        .maybeSingle();

      if (phoneExists) {
        setIsLoading(false);
        Alert.alert(
          'Phone Number Already Registered',
          `An account with this phone number already exists (Vehicle: ${phoneExists.tracker_name}). Please sign in instead.`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Sign In',
              onPress: () => {
                login(phoneExists);
                if (phoneExists.approval_status === 'APPROVED') {
                  navigation.replace('Main');
                } else {
                  navigation.replace('ApprovalPending');
                }
              },
            },
          ]
        );
        return;
      }

      // 0b. Check if this tracker_name already has a driver assigned
      const { data: existing } = await supabase
        .from('profiles')
        .select('*')
        .eq('tracker_name', trackerName)
        .maybeSingle();

      if (existing) {
        setIsLoading(false);
        Alert.alert(
          'Vehicle Already Registered',
          `A driver account for "${trackerName}" is already registered. Would you like to sign in instead?`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Sign In',
              onPress: () => {
                login(existing);
                if (existing.approval_status === 'APPROVED') {
                  navigation.replace('Main');
                } else {
                  navigation.replace('ApprovalPending');
                }
              },
            },
          ]
        );
        return;
      }

      // 1. Gather Telemetry Data
      let current_latitude = null;
      let current_longitude = null;
      
      try {
        const coords = await getGPSLocation();
        if (coords) {
          current_latitude = coords.latitude;
          current_longitude = coords.longitude;
        }
      } catch (locErr) {
        console.log('Location error:', locErr);
      }

      const telemetryData = {
        device_platform: Platform.OS,
        device_model: getDeviceModel(),
        app_version: getAppVersion(),
        timezone: getTimezone(),
        locale: getLocale(),
      };

      // 2. Push to Supabase 'profiles' table
      const { data, error } = await supabase
        .from('profiles')
        .insert([{
          full_name: fullName,
          phone_number: formattedPhone,
          tracker_name: trackerName,
          role: 'DRIVER',
          approval_status: 'PENDING',
          ...telemetryData,
          current_latitude,
          current_longitude,
          registration_timestamp: new Date().toISOString(),
        }])
        .select()
        .single();

      if (error) {
        throw error;
      }

      // 3. Save to local state so they don't have to sign up again
      login(data);

      // 4. Navigate to Pending Approval Screen
      navigation.replace('ApprovalPending');

    } catch (error: any) {
      console.error(error);
      Alert.alert('Signup Error', error.message || 'Could not register profile.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Shield color={theme.colors.primary} size={48} />
              </View>
              <Text style={styles.title}>Driver Registration</Text>
              <Text style={styles.subtitle}>Enter your details to request access to the ASAS Drivers Hub.</Text>
            </View>

            <View style={styles.form}>
              <Input
                label="Full Name"
                placeholder="John Doe"
                value={fullName}
                onChangeText={setFullName}
              />
              <Input
                label="Phone Number"
                placeholder="+254 700 000 000"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />
              <View style={{ zIndex: 1 }}>
                <Input
                  label="Tracker Name (Vehicle)"
                  placeholder="e.g. CAG 1653 ZM FOTON"
                  autoCapitalize="characters"
                  value={trackerName}
                  onChangeText={handleTrackerChange}
                  onFocus={() => { if (trackerName) setShowSuggestions(true); }}
                />
                {showSuggestions && filteredOptions.length > 0 && (
                  <View style={styles.suggestionsContainer}>
                    <ScrollView nestedScrollEnabled keyboardShouldPersistTaps="always">
                      {filteredOptions.map((item, index) => (
                        <TouchableOpacity
                          key={index}
                          style={styles.suggestionItem}
                          onPress={() => {
                            setTrackerName(item);
                            setShowSuggestions(false);
                            Keyboard.dismiss();
                          }}
                        >
                          <Text style={styles.suggestionText}>{item}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>

              {isLoading ? (
                <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 24 }} />
              ) : (
                <Button
                  title="Request Access"
                  onPress={handleSignup}
                  style={styles.button}
                />
              )}
              
              <TouchableOpacity 
                style={styles.linkContainer} 
                onPress={() => navigation.replace('DriverSignIn')}
              >
                <Text style={styles.linkText}>
                  Already registered a truck? <Text style={styles.linkTextBold}>Sign In</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  inner: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    width: 80,
    height: 80,
    backgroundColor: theme.colors.primary + '15',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    ...theme.typography.bodyMd,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  form: {
    gap: 16,
    zIndex: 1,
  },
  button: {
    marginTop: 8,
  },
  linkContainer: {
    marginTop: 16,
    alignItems: 'center',
    padding: 8,
  },
  linkText: {
    ...theme.typography.bodyMd,
    color: theme.colors.textSecondary,
  },
  linkTextBold: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  suggestionsContainer: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    maxHeight: 200,
    marginTop: -8,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  suggestionItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border + '50',
  },
  suggestionText: {
    ...theme.typography.bodyMd,
    color: theme.colors.text,
  },
});
