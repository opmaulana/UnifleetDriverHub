import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Platform,
  ScrollView,
} from 'react-native';
import { theme, playfairBoldStyle } from '../theme/theme';
import { X } from 'lucide-react-native';

export const DriversIntroScreen = ({ navigation }: any) => {
  const handleBack = () => {
    navigation.replace('IntentSelection');
  };

  const handleRegister = () => {
    navigation.navigate('DriverSignup');
  };

  const handleSignIn = () => {
    navigation.navigate('DriverSignIn');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.topBrand}>ASAS Mobile</Text>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={handleBack}
            activeOpacity={0.7}
          >
            <X color="#000000" size={24} />
          </TouchableOpacity>
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}
        >
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>Drivers Hub</Text>
            <Text style={styles.heroTagline}>
              For drivers to manage trips, tasks and updates.
            </Text>
            <Text style={styles.heroDesc}>
              Access your route schedules, report live transit updates, and communicate seamlessly with operations — all from a single screen.
            </Text>
          </View>

          <View style={styles.optionsContainer}>
            <TouchableOpacity
              onPress={handleRegister}
              activeOpacity={0.85}
              style={styles.optionCard}
            >
              <Text style={styles.cardText}>First time here? Register as a driver.</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSignIn}
              activeOpacity={0.85}
              style={styles.optionCard}
            >
              <Text style={styles.cardText}>Already have an account? Continue</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

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
    ...playfairBoldStyle,
    color: theme.colors.primary,
    fontSize: 30,
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
  heroTitle: {
    ...playfairBoldStyle,
    color: theme.colors.primary,
    fontSize: 62,
    lineHeight: 70,
    letterSpacing: -2,
    marginBottom: 24,
  },
  heroTagline: {
    ...playfairBoldStyle,
    color: theme.colors.text,
    fontSize: 38,
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
    ...playfairBoldStyle,
    fontSize: 18,
    color: '#000000',
    textAlign: 'center',
  },
});
