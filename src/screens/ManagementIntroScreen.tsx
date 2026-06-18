import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Platform,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Animated,
  Alert
} from 'react-native';
import { theme } from '../theme/theme';
import { X } from 'lucide-react-native';

export const ManagementIntroScreen = ({ navigation }: any) => {
  const [isLoginActive, setIsLoginActive] = useState(false);
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState('');
  const [passcode, setPasscode] = useState('');

  const [isUsernameFocused, setIsUsernameFocused] = useState(false);
  const [isPasscodeFocused, setIsPasscodeFocused] = useState(false);

  const step2Opacity = useRef(new Animated.Value(0)).current;
  const step2Height = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  const handleBackPress = () => {
    if (isLoginActive) {
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
        setIsLoginActive(false);
        setUsername('');
        setPasscode('');
      }
    } else {
      navigation.goBack();
    }
  };

  const goToStep2 = () => {
    if (!username.trim()) return;
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

  const handleLoginSubmit = () => {
    if (!username.trim() || !passcode.trim()) {
      Alert.alert('Missing Fields', 'Please enter your username and passcode.');
      return;
    }

    if (username.trim() === 'asas.team' && passcode === 'admin@1901') {
      navigation.replace('ManagementFlow');
    } else {
      Alert.alert('Login Failed', 'Invalid username or passcode.');
    }
  };

  const isStep1Active = username.trim().length > 0;
  const isStep2Active = passcode.trim().length > 0;

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
            <View style={[styles.heroContent, isLoginActive && styles.heroContentActive]}>
              <View style={styles.managementTitleBlock}>
                <Text
                  style={[styles.managementHeroTitle, styles.managementTitleTopLine]}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.86}
                >
                  Management
                </Text>
                <Text
                  style={styles.managementHeroTitle}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.86}
                >
                  Console
                </Text>
              </View>
              {!isLoginActive && (
                <Text style={styles.heroDesc}>
                  Access insights, monitor performance, and make data-driven decisions — all in one place. Let’s get you started.
                </Text>
              )}
            </View>

            {!isLoginActive ? (
              <View style={styles.optionsContainer}>
                <TouchableOpacity
                  onPress={() => setIsLoginActive(true)}
                  activeOpacity={0.8}
                  style={styles.optionCard}
                >
                  <Text style={styles.cardText}>Sign in to Management Console</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.formContainer}>
                {/* Step 1: Username */}
                <View style={styles.fieldContainer}>
                  <Text style={styles.inputLabel}>Enter your designated username</Text>
                  <TextInput
                    style={[
                      styles.textInput,
                      isUsernameFocused && styles.textInputActive
                    ]}
                    placeholder="Enter username"
                    placeholderTextColor="#A9A9A9"
                    autoCapitalize="none"
                    value={username}
                    onChangeText={setUsername}
                    onFocus={() => setIsUsernameFocused(true)}
                    onBlur={() => setIsUsernameFocused(false)}
                  />
                </View>

                {/* Step 2: Passcode */}
                <Animated.View style={[
                  styles.animatedFieldContainer,
                  {
                    opacity: step2Opacity,
                    maxHeight: step2Height,
                    overflow: 'hidden',
                  }
                ]}>
                  <View style={styles.fieldContainer}>
                    <Text style={styles.inputLabel}>Enter passcode -</Text>
                    <TextInput
                      style={[
                        styles.textInput,
                        isPasscodeFocused && styles.textInputActive
                      ]}
                      placeholder="Enter passcode"
                      placeholderTextColor="#A9A9A9"
                      secureTextEntry
                      value={passcode}
                      onChangeText={setPasscode}
                      onFocus={() => setIsPasscodeFocused(true)}
                      onBlur={() => setIsPasscodeFocused(false)}
                    />
                  </View>
                </Animated.View>

                {/* Button Container */}
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    onPress={step === 1 ? goToStep2 : handleLoginSubmit}
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
                      {step === 1 ? 'Proceed' : 'Sign in to Management Console'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
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
    marginBottom: 40,
  },
  heroContentActive: {
    marginBottom: 20,
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
  managementTitleBlock: {
    marginBottom: 24,
  },
  managementHeroTitle: {
    fontFamily: playfairBold,
    color: theme.colors.primary,
    fontSize: 54,
    fontWeight: '900',
    lineHeight: 62,
  },
  managementTitleTopLine: {
    transform: [{ translateY: -8 }],
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
  },
  optionsContainer: {
    gap: 16,
    width: '100%',
  },
  optionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#D6D6D6',
    paddingVertical: 22,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  cardText: {
    fontFamily: playfairBold,
    fontSize: 18,
    fontWeight: '900',
    color: '#000000',
    textAlign: 'center',
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
