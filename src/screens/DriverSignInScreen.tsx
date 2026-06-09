import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator, TouchableOpacity, ScrollView, Keyboard } from 'react-native';
import { theme } from '../theme/theme';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { ArrowLeft } from 'lucide-react-native';
import { supabase } from '../lib/supabase';
import { useStore } from '../store/useStore';

export const DriverSignInScreen = ({ navigation }: any) => {
  const [phone, setPhone] = useState('');
  const [trackerName, setTrackerName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const login = useStore((state) => state.login);

  const handleBackPress = () => {
    if (navigation.canGoBack?.()) {
      navigation.goBack();
      return;
    }
    navigation.replace('IntentSelection');
  };

  const handleSignIn = async () => {
    if (!phone || !trackerName) {
      Alert.alert('Missing Fields', 'Please enter both phone number and tracker name.');
      return;
    }

    Keyboard.dismiss();
    setIsLoading(true);

    const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('phone_number', formattedPhone)
        .eq('tracker_name', trackerName)
        .single();

      if (error || !data) {
        throw new Error('No driver found with this phone number and tracker name combination.');
      }

      // Save to local state
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

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
        enabled={Platform.OS !== 'web'}
      >
        <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.headerBackButton}
              onPress={handleBackPress}
              activeOpacity={0.8}
            >
              <ArrowLeft size={20} color={theme.colors.text} />
            </TouchableOpacity>
            <Text style={styles.title}>Driver Sign In</Text>
            <Text style={styles.subtitle}>Enter your details to reconnect to the ASAS Drivers Hub.</Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Phone Number"
              placeholder="+254 700 000 000"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
            <Input
              label="Tracker Name (Vehicle)"
              placeholder="e.g. CAA 104"
              autoCapitalize="characters"
              value={trackerName}
              onChangeText={setTrackerName}
            />

            {isLoading ? (
              <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 24 }} />
            ) : (
              <Button
                title="Sign In"
                onPress={handleSignIn}
                style={styles.button}
              />
            )}
            
            <TouchableOpacity 
              style={styles.linkContainer} 
              onPress={() => navigation.replace('DriverSignup')}
            >
              <Text style={styles.linkText}>
                Need to register a new truck? <Text style={styles.linkTextBold}>Sign Up</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
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
  inner: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    position: 'relative',
    width: '100%',
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.text,
    marginBottom: 8,
    textAlign: 'center',
    paddingHorizontal: 48,
  },
  subtitle: {
    ...theme.typography.bodyMd,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  form: {
    gap: 16,
    zIndex: 1,
  },
  button: {
    marginTop: 8,
  },
  linkContainer: {
    marginTop: 16,
    alignItems: 'center',
    padding: 8,
  },
  linkText: {
    ...theme.typography.bodyMd,
    color: theme.colors.textSecondary,
  },
  linkTextBold: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
});
