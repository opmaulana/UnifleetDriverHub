import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Animated, Platform } from 'react-native';
import { theme } from '../../theme/theme';
import { LogOut, User, Bell } from 'lucide-react-native';

export const ManagementSettingsScreen = ({ navigation }: any) => {
  const [loggingOut, setLoggingOut] = useState(false);
  const splashOpacity = useRef(new Animated.Value(0)).current;
  const splashScale = useRef(new Animated.Value(0.8)).current;

  const handleLogout = () => {
    setLoggingOut(true);
    Animated.parallel([
      Animated.timing(splashOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(splashScale, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setTimeout(() => {
        navigation.replace('IntentSelection');
      }, 1200);
    });
  };

  return (
    <>
      <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <User color={theme.colors.white} size={32} />
          </View>
          <Text style={styles.name}>Management Admin</Text>
          <Text style={styles.role}>Super User</Text>
        </View>

        <View style={styles.menuGroup}>
          <TouchableOpacity style={styles.menuItem}>
            <Bell color={theme.colors.textSecondary} size={24} />
            <Text style={styles.menuText}>Notifications</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <LogOut color={theme.colors.error} size={24} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>

      {loggingOut && (
        <Animated.View style={[styles.splashOverlay, { opacity: splashOpacity }]}>
          <Animated.View style={[styles.splashContent, { transform: [{ scale: splashScale }] }]}>
            <Text style={styles.splashLogo}>ASAS</Text>
            <Text style={styles.splashSub}>Management Hub</Text>
          </Animated.View>
        </Animated.View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.primary,
    paddingTop: 60,
  },
  headerTitle: {
    ...theme.typography.h1,
    color: theme.colors.white,
    fontSize: 28,
  },
  content: {
    padding: theme.spacing.xl,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  name: {
    ...theme.typography.h2,
    color: theme.colors.text,
  },
  role: {
    ...theme.typography.bodyMd,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  menuGroup: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  menuText: {
    ...theme.typography.bodyLg,
    color: theme.colors.text,
    marginLeft: 16,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: theme.colors.error + '10',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.error + '30',
  },
  logoutText: {
    ...theme.typography.bodyLg,
    color: theme.colors.error,
    fontWeight: '600',
    marginLeft: 12,
  },
  splashOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99999,
  },
  splashContent: {
    alignItems: 'center',
  },
  splashLogo: {
    fontSize: 64,
    fontWeight: '900',
    color: theme.colors.primary,
    letterSpacing: -2,
  },
  splashSub: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 8,
    letterSpacing: 4,
    textTransform: 'uppercase',
  },
});
