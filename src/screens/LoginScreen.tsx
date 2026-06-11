import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { theme } from '../theme/theme';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useTranslation } from '../hooks/useTranslation';
import { AuthService } from '../services/auth/authService';
import { Alert } from 'react-native';

export const LoginScreen = ({ navigation }: any) => {
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();

  const handleSendOTP = async () => {
    if (!phone || phone.length < 8) return;
    
    setIsLoading(true);
    const response = await AuthService.sendOTP(phone);
    setIsLoading(false);

    if (response.success) {
      navigation.navigate('OTP', { phone });
    } else {
      Alert.alert('Error', response.error || 'Failed to send OTP. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
        enabled={Platform.OS !== 'web'}
      >
        <TouchableWithoutFeedback onPress={Platform.OS === 'web' ? undefined : Keyboard.dismiss}>
          <View style={styles.inner}>
            <View style={styles.header}>
              <Text style={styles.title}>{t('welcome_back')}</Text>
              <Text style={styles.subtitle}>{t('enter_phone')}</Text>
            </View>

            <View style={styles.form}>
              <Input
                label={t('phone_number')}
                placeholder="+254 700 000 000"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />

              <Button
                title={isLoading ? "Sending..." : t('get_otp')}
                onPress={handleSendOTP}
                style={styles.button}
                disabled={isLoading || phone.length < 8}
              />
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                {t('terms_agree')}
              </Text>
            </View>
          </View>
        </TouchableWithoutFeedback>
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
  button: {
    marginTop: theme.spacing.lg,
  },
  footer: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  footerText: {
    ...theme.typography.labelSm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});
