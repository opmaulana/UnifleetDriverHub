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

export const OTPScreen = ({ navigation, route }: any) => {
  const { phone } = route.params || {};
  const [otp, setOtp] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <View style={styles.inner}>
          <View style={styles.header}>
            <Text style={styles.title}>Verification</Text>
            <Text style={styles.subtitle}>
              Enter the 6-digit code sent to {phone || 'your phone'}
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
              title="Verify"
              onPress={() => navigation.navigate('BackgroundCheck')}
              style={styles.button}
              disabled={otp.length < 6}
            />

            <TouchableOpacity style={styles.resend}>
              <Text style={styles.resendText}>Didn't receive code? </Text>
              <Text style={styles.resendLink}>Resend</Text>
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
