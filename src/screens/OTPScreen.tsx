import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  KeyboardAvoidingView, 
  Platform,
  TouchableOpacity
} from 'react-native';
import { theme } from '../theme/theme';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useTranslation } from '../hooks/useTranslation';
import { AuthService } from '../services/auth/authService';
import { useStore } from '../store/useStore';
import { Alert } from 'react-native';

export const OTPScreen = ({ navigation, route }: any) => {
  const { phone } = route.params || {};
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();

  const login = useStore(state => state.login);

  const handleVerify = async () => {
    if (otp.length < 6) return;
    
    setIsLoading(true);
    const response = await AuthService.verifyOTP(phone, otp);
    setIsLoading(false);
    
    if (response.success) {
      if (response.isFirstTime) {
        navigation.navigate('ProfileSetup', { phone });
      } else {
        // Driver is fully setup, log them in
        login(phone);
        navigation.navigate('Main');
      }
    } else {
      Alert.alert('Verification Failed', response.error || 'Invalid code. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <View style={styles.inner}>
          <View style={styles.header}>
            <Text style={styles.title}>{t('verification')}</Text>
            <Text style={styles.subtitle}>
              {t('enter_code')} {phone || 'your phone'}
            </Text>
          </View>

          <View style={styles.form}>
            <Input
              placeholder="0 0 0 0 0 0"
              keyboardType="number-pad"
              maxLength={6}
              value={otp}
              onChangeText={setOtp}
              style={styles.otpInput}
            />
            
            <Button
              title={isLoading ? "Verifying..." : t('verify_continue')}
              onPress={handleVerify}
              style={styles.button}
              disabled={isLoading || otp.length < 6}
            />

            <TouchableOpacity style={styles.resend}>
              <Text style={styles.resendText}>{t('resend_code')} </Text>
              <Text style={styles.resendLink}>{t('resend')}</Text>
            </TouchableOpacity>
          </View>

          <View />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  flex: {
    flex: 1,
  },
  inner: {
    flex: 1,
    padding: theme.spacing.lg,
    justifyContent: 'space-between',
  },
  header: {
    marginTop: theme.spacing.xxl,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.text,
  },
  subtitle: {
    ...theme.typography.bodyMd,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  form: {
    marginTop: theme.spacing.xxl,
  },
  otpInput: {
    textAlign: 'center',
    fontSize: 32,
    letterSpacing: 8,
    fontWeight: '700',
  },
  button: {
    marginTop: theme.spacing.xl,
  },
  resend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: theme.spacing.lg,
  },
  resendText: {
    ...theme.typography.bodyMd,
    color: theme.colors.textSecondary,
  },
  resendLink: {
    ...theme.typography.bodyMd,
    color: theme.colors.primary,
    fontWeight: '600',
  },
});
