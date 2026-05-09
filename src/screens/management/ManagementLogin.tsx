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
import { theme } from '../../theme/theme';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Shield } from 'lucide-react-native';
import { useTranslation } from '../../hooks/useTranslation';

export const ManagementLogin = ({ navigation }: any) => {
  const [phone, setPhone] = useState('');
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.inner}>
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Shield color={theme.colors.primary} size={48} />
              </View>
              <Text style={styles.title}>{t('officer_login')}</Text>
              <Text style={styles.subtitle}>{t('enter_registered')}</Text>
            </View>

            <View style={styles.form}>
              <Input
                label={t('registered_mobile')}
                placeholder="+254 700 000 000"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />

              <Button
                title={t('continue_btn')}
                onPress={() => navigation.replace('ManagementDashboard')}
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
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FCEAEA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.text,
    textAlign: 'center',
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
