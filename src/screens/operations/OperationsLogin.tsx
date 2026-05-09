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
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { theme } from '../../theme/theme';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { ChevronLeft, Lock, Eye, EyeOff } from 'lucide-react-native';
import { useTranslation } from '../../hooks/useTranslation';

export const OperationsLogin = ({ navigation, route }: any) => {
  const phone = route?.params?.phone || '';
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { t } = useTranslation();

  const handleLogin = () => {
    if (!username.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    setError('');
    navigation.replace('OperationsMain');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* ASAS COMMAND Header */}
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
            {/* Hero */}
            <View style={styles.hero}>
              <View style={styles.iconRing}>
                <Lock color="#C0392B" size={36} />
              </View>
              <Text style={styles.title}>{t('operator_auth')}</Text>
              <Text style={styles.subtitle}>
                {t('login_subtitle')}
              </Text>
            </View>

            {/* Login Form */}
            <View style={styles.form}>
              <Input
                label={t('username')}
                placeholder="Enter operator username"
                autoCapitalize="none"
                value={username}
                onChangeText={(t: string) => {
                  setUsername(t);
                  setError('');
                }}
              />
              <View style={styles.passwordContainer}>
                <Input
                  label={t('access_code')}
                  placeholder="Enter password"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  value={password}
                  onChangeText={(t: string) => {
                    setPassword(t);
                    setError('');
                  }}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff color="#8D706C" size={20} />
                  ) : (
                    <Eye color="#8D706C" size={20} />
                  )}
                </TouchableOpacity>
              </View>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <Button
                title={t('authenticate')}
                onPress={handleLogin}
                style={styles.loginButton}
                disabled={!username || !password}
              />

              <TouchableOpacity style={styles.forgotRow}>
                <Text style={styles.forgotText}>{t('forgot_access')}</Text>
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>{t('or_auth_via')}</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Biometric placeholder */}
              <TouchableOpacity style={styles.biometricButton}>
                <Text style={styles.biometricText}>🔐  {t('biometric_login')}</Text>
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Powered by Uni Fleet Intelligence v. 4.2.1-stable
              </Text>
              <Text style={styles.warningText}>
                {t('unauthorized')}
              </Text>
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
    marginTop: 24,
  },
  iconRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFE5E1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#261816',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#59413D',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  form: {
    marginTop: 8,
  },
  passwordContainer: {
    position: 'relative',
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    top: 38,
    padding: 4,
  },
  errorText: {
    color: '#BA1A1A',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
    marginLeft: 4,
  },
  loginButton: {
    marginTop: 20,
    backgroundColor: ASAS_RED,
    borderRadius: 8,
  },
  forgotRow: {
    alignItems: 'center',
    marginTop: 16,
  },
  forgotText: {
    fontSize: 14,
    fontWeight: '600',
    color: ASAS_RED,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E1BFB9',
  },
  dividerText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#8D706C',
    marginHorizontal: 12,
  },
  biometricButton: {
    height: 52,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E1BFB9',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  biometricText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#261816',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 8,
  },
  footerText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#8D706C',
  },
  warningText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#BA1A1A',
    marginTop: 4,
  },
});
