import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableWithoutFeedback, 
  Keyboard, 
  KeyboardAvoidingView, 
  Platform, 
  Alert, 
  ActivityIndicator, 
  TouchableOpacity, 
  ScrollView, 
  Animated,
  TextInput
} from 'react-native';
import { theme } from '../theme/theme';
import { X } from 'lucide-react-native';
import { supabase } from '../lib/supabase';
import { useStore } from '../store/useStore';
import { fetchAllTrackerLabels } from '../lib/navixyApi';
import { getDeviceModel, getAppVersion, getTimezone, getLocale, getGPSLocation } from '../utils/deviceInfo';

export const DriverSignupScreen = ({ navigation }: any) => {
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [trackerName, setTrackerName] = useState('');
  const [trackerOptions, setTrackerOptions] = useState<string[]>([]);
  const [filteredOptions, setFilteredOptions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const login = useStore(state => state.login);

  // Focus states for text inputs
  const [isNameFocused, setIsNameFocused] = useState(false);
  const [isPhoneFocused, setIsPhoneFocused] = useState(false);
  const [isVehicleFocused, setIsVehicleFocused] = useState(false);

  // Animation values for progressive steps
  const step2Opacity = useRef(new Animated.Value(0)).current;
  const step2Height = useRef(new Animated.Value(0)).current;
  const step3Opacity = useRef(new Animated.Value(0)).current;
  const step3Height = useRef(new Animated.Value(0)).current;

  const scrollViewRef = useRef<ScrollView>(null);

  const handleBackPress = () => {
    if (navigation.canGoBack?.()) {
      navigation.goBack();
      return;
    }
    navigation.replace('IntentSelection');
  };

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

  const goToStep2 = () => {
    if (!fullName.trim()) return;
    setStep(2);
    Animated.parallel([
      Animated.timing(step2Height, {
        toValue: 120,
        duration: 350,
        useNativeDriver: false,
      }),
      Animated.timing(step2Opacity, {
        toValue: 1,
        duration: 350,
        useNativeDriver: false,
      })
    ]).start();

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const goToStep3 = () => {
    if (!phone.trim()) return;
    setStep(3);
    Animated.parallel([
      Animated.timing(step3Height, {
        toValue: 120,
        duration: 350,
        useNativeDriver: false,
      }),
      Animated.timing(step3Opacity, {
        toValue: 1,
        duration: 350,
        useNativeDriver: false,
      })
    ]).start();

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleSignup = async () => {
    if (!fullName.trim() || !phone.trim() || !trackerName.trim()) {
      Alert.alert('Missing Fields', 'Please fill in all details.');
      return;
    }

    setIsLoading(true);
    const formattedPhone = phone.trim().startsWith('+') ? phone.trim() : `+${phone.trim()}`;

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
        .eq('tracker_name', trackerName.trim())
        .maybeSingle();

      if (existing) {
        setIsLoading(false);
        Alert.alert(
          'Vehicle Already Registered',
          `A driver account for "${trackerName.trim()}" is already registered. Would you like to sign in instead?`,
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
          full_name: fullName.trim(),
          phone_number: formattedPhone,
          tracker_name: trackerName.trim(),
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

      // 3. Save to local state
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

  const isButtonActive = 
    step === 1 ? fullName.trim().length > 0 :
    step === 2 ? phone.trim().length > 0 :
    trackerName.trim().length > 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.topBrand}>ASAS Mobile</Text>
          <TouchableOpacity 
            onPress={handleBackPress}
            activeOpacity={0.7}
            style={styles.closeButton}
          >
            <X color="#000000" size={28} strokeWidth={2} />
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
          enabled={Platform.OS === 'ios'}
        >
          <ScrollView 
            ref={scrollViewRef}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.heroContent}>
              <Text style={styles.heroTitle}>Drivers Hub</Text>
              <Text style={styles.heroTagline}>
                For drivers to manage{"\n"}trips, tasks and updates.
              </Text>
              <Text style={styles.heroDesc}>
                Access your trips, update task status, and stay informed — all in one place. Let’s get you started.
              </Text>
              <Text style={styles.extraLabel}>
                Enter your details to request access{"\n"}to the ASAS Drivers Hub.
              </Text>
            </View>

            <View style={styles.formContainer}>
              {/* Step 1: Full Name */}
              <View style={styles.fieldContainer}>
                <Text style={styles.inputLabel}>Can we have your Full Name ?</Text>
                <TextInput
                  style={[
                    styles.textInput,
                    isNameFocused && styles.textInputActive
                  ]}
                  placeholder="Enter your full name"
                  placeholderTextColor="#A9A9A9"
                  value={fullName}
                  onChangeText={setFullName}
                  onFocus={() => setIsNameFocused(true)}
                  onBlur={() => setIsNameFocused(false)}
                />
              </View>

              {/* Step 2: Phone Number */}
              <Animated.View style={[
                styles.animatedFieldContainer,
                {
                  opacity: step2Opacity,
                  maxHeight: step2Height,
                  overflow: 'hidden',
                }
              ]}>
                <View style={styles.fieldContainer}>
                  <Text style={styles.inputLabel}>Please enter your phone number -</Text>
                  <TextInput
                    style={[
                      styles.textInput,
                      isPhoneFocused && styles.textInputActive
                    ]}
                    placeholder="Enter your phone number"
                    placeholderTextColor="#A9A9A9"
                    keyboardType="phone-pad"
                    value={phone}
                    onChangeText={setPhone}
                    onFocus={() => setIsPhoneFocused(true)}
                    onBlur={() => setIsPhoneFocused(false)}
                  />
                </View>
              </Animated.View>

              {/* Step 3: Vehicle Type */}
              <Animated.View style={[
                styles.animatedFieldContainer,
                {
                  opacity: step3Opacity,
                  maxHeight: step3Height,
                  overflow: 'hidden',
                }
              ]}>
                <View style={styles.fieldContainer}>
                  <Text style={styles.inputLabel}>What vehicle are you driving?</Text>
                  <View style={{ zIndex: 10 }}>
                    <TextInput
                      style={[
                        styles.textInput,
                        isVehicleFocused && styles.textInputActive
                      ]}
                      placeholder="Enter your vehicle type"
                      placeholderTextColor="#A9A9A9"
                      autoCapitalize="characters"
                      value={trackerName}
                      onChangeText={handleTrackerChange}
                      onFocus={() => {
                        setIsVehicleFocused(true);
                        if (trackerName) setShowSuggestions(true);
                      }}
                      onBlur={() => setIsVehicleFocused(false)}
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
                </View>
              </Animated.View>

              {/* Button Container */}
              <View style={styles.buttonContainer}>
                {isLoading ? (
                  <View style={styles.proceedButton}>
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  </View>
                ) : (
                  <TouchableOpacity
                    onPress={
                      step === 1 ? goToStep2 :
                      step === 2 ? goToStep3 :
                      handleSignup
                    }
                    disabled={!isButtonActive}
                    activeOpacity={0.8}
                    style={[
                      styles.proceedButton,
                      !isButtonActive && styles.proceedButtonDisabled
                    ]}
                  >
                    <Text style={[
                      styles.proceedButtonText,
                      !isButtonActive && styles.proceedButtonTextDisabled
                    ]}>
                      {step === 3 ? 'Request Access' : 'Proceed'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
};

const playfairBold = Platform.select({
  web: 'Playfair Display',
  default: 'PlayfairDisplay-Bold',
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: Platform.OS === 'ios' ? 24 : 48,
    paddingBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  topBrand: {
    fontFamily: playfairBold,
    color: theme.colors.primary,
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: -1,
  },
  closeButton: {
    padding: 4,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    paddingBottom: 16,
  },
  heroContent: {
    marginBottom: 32,
  },
  heroTitle: {
    fontFamily: playfairBold,
    color: theme.colors.primary,
    fontSize: 62,
    fontWeight: '900',
    lineHeight: 70,
    letterSpacing: -2,
    marginBottom: 24,
  },
  heroTagline: {
    fontFamily: playfairBold,
    color: theme.colors.text,
    fontSize: 38,
    fontWeight: '900',
    lineHeight: 48,
    letterSpacing: -1.2,
    marginBottom: 28,
  },
  heroDesc: {
    fontSize: 18,
    color: '#4A4A4A',
    lineHeight: 26,
    fontWeight: '400',
    marginBottom: 28,
  },
  extraLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    lineHeight: 24,
  },
  formContainer: {
    width: '100%',
    gap: 16,
  },
  animatedFieldContainer: {
    width: '100%',
  },
  fieldContainer: {
    width: '100%',
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 17,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 12,
    paddingLeft: 4,
  },
  textInput: {
    height: 56,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: '#D6D6D6',
    paddingHorizontal: 24,
    fontSize: 16,
    color: '#000000',
  },
  textInputActive: {
    borderColor: theme.colors.primary,
  },
  buttonContainer: {
    marginTop: 12,
    width: '100%',
  },
  proceedButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 28,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  proceedButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  proceedButtonDisabled: {
    backgroundColor: '#EAEAEA',
  },
  proceedButtonTextDisabled: {
    color: '#A8A8A8',
  },
  suggestionsContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#D6D6D6',
    borderRadius: 18,
    maxHeight: 150,
    marginTop: 8,
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  suggestionItem: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  suggestionText: {
    fontSize: 15,
    color: '#000000',
    fontWeight: '500',
  },
});
