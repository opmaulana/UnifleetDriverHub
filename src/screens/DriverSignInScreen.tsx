import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  KeyboardAvoidingView, 
  Platform, 
  Alert, 
  ActivityIndicator, 
  TouchableOpacity, 
  ScrollView, 
  Animated,
  TextInput,
  Keyboard
} from 'react-native';
import { theme } from '../theme/theme';
import { X, Cpu } from 'lucide-react-native';
import { supabase } from '../lib/supabase';
import { useStore } from '../store/useStore';

export const DriverSignInScreen = ({ navigation }: any) => {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [trackerName, setTrackerName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const login = useStore((state) => state.login);

  // Focus states
  const [isPhoneFocused, setIsPhoneFocused] = useState(false);
  const [isTrackerFocused, setIsTrackerFocused] = useState(false);

  // Animated values
  const step2Opacity = useRef(new Animated.Value(0)).current;
  const step2Height = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  const handleDevBypass = () => {
    login({
      id: 'dev-bypass-driver',
      full_name: 'Dev Bypass Driver',
      phone_number: '+255111111111',
      tracker_name: 'CAG 1653 ZM FOTON',
      role: 'DRIVER',
      approval_status: 'APPROVED',
    });
    navigation.replace('Main');
  };

  const handleBackPress = () => {
    if (step === 2) {
      setStep(1);
      Animated.parallel([
        Animated.timing(step2Height, {
          toValue: 0,
          duration: 350,
          useNativeDriver: false,
        }),
        Animated.timing(step2Opacity, {
          toValue: 0,
          duration: 350,
          useNativeDriver: false,
        })
      ]).start();
    } else {
      if (navigation.canGoBack?.()) {
        navigation.goBack();
      } else {
        navigation.replace('IntentSelection');
      }
    }
  };

  const goToStep2 = () => {
    if (!phone.trim()) return;
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

  const handleSignIn = async () => {
    if (!phone.trim() || !trackerName.trim()) {
      Alert.alert('Missing Fields', 'Please enter both your phone number and vehicle.');
      return;
    }

    Keyboard.dismiss();
    setIsLoading(true);

    const formattedPhone = phone.trim().startsWith('+') ? phone.trim() : `+${phone.trim()}`;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('phone_number', formattedPhone)
        .eq('tracker_name', trackerName.trim().toUpperCase())
        .single();

      if (error || !data) {
        throw new Error('No driver found with this phone number and vehicle combination.');
      }

      // Save to store
      login(data);

      // Navigate based on approval status
      if (data.approval_status === 'APPROVED') {
        navigation.replace('Main');
      } else {
        navigation.replace('ApprovalPending');
      }

    } catch (error: any) {
      console.error(error);
      Alert.alert('Sign In Failed', error.message || 'Could not find your profile.');
    } finally {
      setIsLoading(false);
    }
  };

  const isStep1Active = phone.trim().length > 0;
  const isStep2Active = trackerName.trim().length > 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.topBrand}>ASAS Mobile</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <TouchableOpacity
              onPress={handleDevBypass}
              style={styles.devBypassButton}
              activeOpacity={0.8}
            >
              <Cpu size={18} color={theme.colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={handleBackPress}
              activeOpacity={0.7}
              style={styles.closeButton}
            >
              <X color="#000000" size={28} strokeWidth={2} />
            </TouchableOpacity>
          </View>
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
                Access your trips, update task status, and stay informed — all in one place. Let’s get you signed in.
              </Text>
              <Text style={styles.extraLabel}>
                Enter your details to sign in to the{"\n"}ASAS Drivers Hub.
              </Text>
            </View>

            <View style={styles.formContainer}>
              {/* Step 1: Phone Number */}
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

              {/* Step 2: Vehicle Type */}
              <Animated.View style={[
                styles.animatedFieldContainer,
                {
                  opacity: step2Opacity,
                  maxHeight: step2Height,
                  overflow: 'hidden',
                }
              ]}>
                <View style={styles.fieldContainer}>
                  <Text style={styles.inputLabel}>What vehicle are you driving?</Text>
                  <TextInput
                    style={[
                      styles.textInput,
                      isTrackerFocused && styles.textInputActive
                    ]}
                    placeholder="Enter your vehicle type"
                    placeholderTextColor="#A9A9A9"
                    autoCapitalize="characters"
                    value={trackerName}
                    onChangeText={setTrackerName}
                    onFocus={() => setIsTrackerFocused(true)}
                    onBlur={() => setIsTrackerFocused(false)}
                  />
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
                    onPress={step === 1 ? goToStep2 : handleSignIn}
                    disabled={step === 1 ? !isStep1Active : !isStep2Active}
                    activeOpacity={0.8}
                    style={[
                      styles.proceedButton,
                      step === 1 
                        ? (isStep1Active ? styles.buttonColorlessActive : styles.proceedButtonDisabled)
                        : (isStep2Active ? styles.buttonRedActive : styles.proceedButtonDisabled)
                    ]}
                  >
                    <Text style={[
                      styles.proceedButtonText,
                      step === 1
                        ? (isStep1Active ? styles.buttonColorlessActiveText : styles.proceedButtonTextDisabled)
                        : (isStep2Active ? styles.buttonRedActiveText : styles.proceedButtonTextDisabled)
                    ]}>
                      {step === 1 ? 'Proceed' : 'Sign In'}
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
  devBypassButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF0F0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
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
    borderRadius: 28,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  proceedButtonText: {
    fontSize: 18,
    fontWeight: '700',
  },
  proceedButtonDisabled: {
    backgroundColor: '#EAEAEA',
  },
  proceedButtonTextDisabled: {
    color: '#A8A8A8',
  },
  buttonColorlessActive: {
    backgroundColor: '#1A1A1A',
  },
  buttonColorlessActiveText: {
    color: '#FFFFFF',
  },
  buttonRedActive: {
    backgroundColor: theme.colors.primary,
  },
  buttonRedActiveText: {
    color: '#FFFFFF',
  },
});
