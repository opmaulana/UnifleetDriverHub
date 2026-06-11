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
  Alert,
  TouchableOpacity,
} from 'react-native';
import { theme } from '../../theme/theme';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { ArrowLeft } from 'lucide-react-native';
import { useTranslation } from '../../hooks/useTranslation';

export const ManagementLogin = ({ navigation }: any) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { t } = useTranslation();

  const handleBackPress = () => {
    if (navigation.canGoBack?.()) {
      navigation.goBack();
      return;
    }
    navigation.getParent?.()?.navigate?.('IntentSelection');
  };

  const handleLogin = () => {
    if (username.trim() === 'asas.team' && password === 'admin@1901') {
      navigation.replace('ManagementDashboard');
    } else {
      Alert.alert('Login Failed', 'Invalid username or password.');
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
              <TouchableOpacity
                style={styles.headerBackButton}
                onPress={handleBackPress}
                activeOpacity={0.8}
              >
                <ArrowLeft size={20} color={theme.colors.text} />
              </TouchableOpacity>
              <Text style={styles.title}>{t('officer_login')}</Text>
              <Text style={styles.subtitle}>{t('enter_registered')}</Text>
            </View>

            <View style={styles.form}>
              <Input
                label="Username"
                placeholder="Enter username"
                autoCapitalize="none"
                value={username}
                onChangeText={setUsername}
              />
              <Input
                label="Password"
                placeholder="Enter password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />

              <Button
                title={t('continue_btn')}
                onPress={handleLogin}
                style={styles.button}
              />
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                {t('terms_service')}
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
  headerBackButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
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
    marginTop: theme.spacing.xxl + 152,
    alignItems: 'center',
    position: 'relative',
    width: '100%',
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.text,
    textAlign: 'center',
    paddingHorizontal: 48,
  },
  subtitle: {
    ...theme.typography.bodyMd,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
  form: {
    marginTop: theme.spacing.xl,
  },
  button: {
    marginTop: theme.spacing.xl,
  },
  footer: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  footerText: {
    ...theme.typography.labelSm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});
