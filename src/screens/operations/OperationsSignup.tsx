import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  TextInput,
  TouchableOpacity,
  Animated,
  StatusBar,
} from 'react-native';
import { theme } from '../../theme/theme';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Radio, ChevronLeft, ShieldCheck } from 'lucide-react-native';
import { useTranslation } from '../../hooks/useTranslation';

export const OperationsSignup = ({ navigation }: any) => {
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(0);
  const otpRefs = useRef<(TextInput | null)[]>([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { t } = useTranslation();

  const handleSendOTP = () => {
    if (phone.length < 8) return;
    setOtpSent(true);
    setResendTimer(30);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
    // Start countdown
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleOTPChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    // Auto-focus next field
    if (text && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOTPKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const isOTPComplete = otp.every((digit) => digit !== '');

  const handleVerify = () => {
    if (isOTPComplete) {
      navigation.navigate('OperationsLogin', { phone });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* ASAS COMMAND Header Bar */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <ChevronLeft color="#FFFFFF" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerBrand}>ASAS COMMAND</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.inner}>
            {/* Icon + Title */}
            <View style={styles.hero}>
              <View style={styles.iconRing}>
                <Radio color="#C0392B" size={36} />
              </View>
              <Text style={styles.title}>
                {otpSent ? t('verification') : t('operators_hub')}
              </Text>
              <Text style={styles.subtitle}>
                {otpSent
                  ? `${t('enter_code')} ${phone}`
                  : t('signup_subtitle')}
              </Text>
            </View>

            {/* Form Section */}
            <View style={styles.form}>
              {!otpSent ? (
                <>
                  <Input
                    label={t('mobile_number')}
                    placeholder="+255 700 000 000"
                    keyboardType="phone-pad"
                    value={phone}
                    onChangeText={setPhone}
                  />
                  <Button
                    title={t('send_otp')}
                    onPress={handleSendOTP}
                    style={styles.actionButton}
                    disabled={phone.length < 8}
                  />
                </>
              ) : (
                <Animated.View style={{ opacity: fadeAnim }}>
                  {/* OTP Input Grid */}
                  <View style={styles.otpContainer}>
                    {otp.map((digit, index) => (
                      <TextInput
                        key={index}
                        ref={(ref) => (otpRefs.current[index] = ref)}
                        style={[
                          styles.otpBox,
                          digit ? styles.otpBoxFilled : null,
                        ]}
                        value={digit}
                        onChangeText={(text) => handleOTPChange(text, index)}
                        onKeyPress={(e) => handleOTPKeyPress(e, index)}
                        keyboardType="number-pad"
                        maxLength={1}
                        selectTextOnFocus
                      />
                    ))}
                  </View>

                  <Button
                    title={t('verify_continue')}
                    onPress={handleVerify}
                    style={styles.actionButton}
                    disabled={!isOTPComplete}
                  />

                  <TouchableOpacity
                    style={styles.resendRow}
                    disabled={resendTimer > 0}
                    onPress={handleSendOTP}
                  >
                    <Text style={styles.resendText}>
                      {resendTimer > 0
                        ? `${t('resend_code')} ${resendTimer}s`
                        : t('resend_code') + ' '}
                    </Text>
                    {resendTimer === 0 && (
                      <Text style={styles.resendLink}>{t('resend')}</Text>
                    )}
                  </TouchableOpacity>
                </Animated.View>
              )}
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <View style={styles.securityBadge}>
                <ShieldCheck color="#7F8C8D" size={14} />
                <Text style={styles.footerText}>
                  Secured by Uni Fleet Intelligence
                </Text>
              </View>
              <Text style={styles.versionText}>v4.2.1-stable</Text>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const ASAS_RED = '#C0392B';
const STATUS_BAR_HEIGHT = Platform.OS === 'android' ? (StatusBar.currentHeight || 40) : 44;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F6',
  },
  headerBar: {
    height: 56 + STATUS_BAR_HEIGHT,
    paddingTop: STATUS_BAR_HEIGHT,
    backgroundColor: ASAS_RED,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerBrand: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1.5,
  },
  flex: {
    flex: 1,
  },
  inner: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  hero: {
    alignItems: 'center',
    marginTop: 32,
  },
  iconRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFE5E1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#261816',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#59413D',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  form: {
    marginTop: 32,
  },
  actionButton: {
    marginTop: 24,
    backgroundColor: ASAS_RED,
    borderRadius: 8,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 8,
  },
  otpBox: {
    flex: 1,
    height: 56,
    borderRadius: 8,
    backgroundColor: '#FFF0EE',
    borderWidth: 2,
    borderColor: '#E1BFB9',
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '700',
    color: '#261816',
  },
  otpBoxFilled: {
    borderColor: ASAS_RED,
    backgroundColor: '#FFFFFF',
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  resendText: {
    fontSize: 14,
    color: '#59413D',
  },
  resendLink: {
    fontSize: 14,
    color: ASAS_RED,
    fontWeight: '700',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 12,
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#7F8C8D',
  },
  versionText: {
    fontSize: 10,
    color: '#8D706C',
    marginTop: 4,
  },
});
