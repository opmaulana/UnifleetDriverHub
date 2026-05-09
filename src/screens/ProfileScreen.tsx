import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { CommonActions } from '@react-navigation/native';
import { GlobalHeader } from '../components/GlobalHeader';
import { theme } from '../theme/theme';
import { useStore } from '../store/useStore';
import { Card } from '../components/Card';
import { User, Shield, Car, FileText, Settings, LogOut, ChevronRight } from 'lucide-react-native';

export const ProfileScreen = ({ navigation }: any) => {
  const { user, logout } = useStore();
  const [loggingOut, setLoggingOut] = useState(false);
  const splashOpacity = useRef(new Animated.Value(0)).current;
  const splashScale = useRef(new Animated.Value(0.8)).current;

  const menuItems = [
    { icon: <Shield size={20} color={theme.colors.textSecondary} />, title: 'Personal Info' },
    { icon: <Car size={20} color={theme.colors.textSecondary} />, title: 'Vehicle Details' },
    { icon: <FileText size={20} color={theme.colors.textSecondary} />, title: 'Documents' },
    { icon: <Settings size={20} color={theme.colors.textSecondary} />, title: 'Settings' },
  ];

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
        logout();
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'IntentSelection' }],
          })
        );
      }, 1200);
    });
  };

  return (
    <View style={styles.container}>
      <GlobalHeader />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <User size={64} color={theme.colors.border} />
            </View>
            <TouchableOpacity style={styles.editBtn}>
              <Text style={styles.editText}>Edit</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{user?.name || 'Driver John'}</Text>
          <Text style={styles.userPhone}>{user?.phone || '+254 700 000 000'}</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>4.9</Text>
            <Text style={styles.statLab}>Rating</Text>
          </View>
          <View style={[styles.statBox, styles.statBorder]}>
            <Text style={styles.statVal}>2.4k</Text>
            <Text style={styles.statLab}>Trips</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>3y</Text>
            <Text style={styles.statLab}>Exp</Text>
          </View>
        </View>

        <View style={styles.menu}>
          {menuItems.map((item, index) => (
            <TouchableOpacity key={index} style={styles.menuItem}>
              <View style={styles.menuIcon}>{item.icon}</View>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <ChevronRight size={20} color={theme.colors.border} />
            </TouchableOpacity>
          ))}
          
          <TouchableOpacity style={[styles.menuItem, styles.logoutBtn]} onPress={handleLogout}>
            <View style={[styles.menuIcon, { backgroundColor: theme.colors.error + '10' }]}>
              <LogOut size={20} color={theme.colors.error} />
            </View>
            <Text style={[styles.menuTitle, { color: theme.colors.error }]}>Log Out</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.version}>ASAS Driver Hub v1.0.0</Text>
      </ScrollView>

      {/* Logout Splash Overlay */}
      {loggingOut && (
        <Animated.View style={[styles.splashOverlay, { opacity: splashOpacity }]}>
          <Animated.View style={[styles.splashContent, { transform: [{ scale: splashScale }] }]}>
            <Text style={styles.splashBrand}>ASAS</Text>
            <Text style={styles.splashSub}>Drivers Hub</Text>
          </Animated.View>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
    backgroundColor: theme.colors.white,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: theme.spacing.md,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: theme.colors.white,
  },
  editBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: theme.colors.white,
  },
  editText: {
    color: theme.colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  userName: {
    ...theme.typography.h2,
    color: theme.colors.text,
  },
  userPhone: {
    ...theme.typography.bodyMd,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: theme.colors.white,
    paddingVertical: theme.spacing.lg,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.colors.background,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: theme.colors.background,
  },
  statVal: {
    ...theme.typography.h3,
    color: theme.colors.text,
  },
  statLab: {
    ...theme.typography.labelSm,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  menu: {
    marginTop: theme.spacing.lg,
    backgroundColor: theme.colors.white,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.background,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  menuTitle: {
    ...theme.typography.bodyMd,
    flex: 1,
    fontWeight: '500',
  },
  logoutBtn: {
    borderBottomWidth: 0,
    marginTop: theme.spacing.lg,
  },
  version: {
    textAlign: 'center',
    ...theme.typography.labelSm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xxl,
  },

  // ---- Splash Overlay ----
  splashOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  splashContent: {
    alignItems: 'center',
  },
  splashBrand: {
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
