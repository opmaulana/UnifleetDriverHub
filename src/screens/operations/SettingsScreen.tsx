import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Animated,
  Dimensions,
} from 'react-native';
import { CommonActions } from '@react-navigation/native';
import { useTranslation } from '../../hooks/useTranslation';
import {
  User,
  Bell,
  Shield,
  Globe,
  Moon,
  Wifi,
  HelpCircle,
  LogOut,
  ChevronRight,
  Smartphone,
  Database,
  Lock,
  Info,
} from 'lucide-react-native';
import { OperationsHeader } from '../../components/operations/OperationsHeader';

const ASAS_RED = '#C0392B';

interface SettingItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  description?: string;
  type: 'navigate' | 'toggle' | 'action';
  value?: boolean;
}

export const SettingsScreen = ({ navigation }: any) => {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [liveTracking, setLiveTracking] = useState(true);
  const [offlineMode, setOfflineMode] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const splashOpacity = useRef(new Animated.Value(0)).current;
  const splashScale = useRef(new Animated.Value(0.8)).current;
  const { width: SW, height: SH } = Dimensions.get('window');
  const { t } = useTranslation();

  const handleLogout = () => {
    setLoggingOut(true);
    // Animate splash in
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
      // Hold splash for a moment, then navigate
      setTimeout(() => {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'IntentSelection' }],
          })
        );
      }, 1200);
    });
  };

  const sections = [
    {
      title: 'ACCOUNT',
      items: [
        {
          id: 'profile',
          icon: <User size={18} color="#261816" />,
          label: 'Operator Profile',
          description: 'Name, role, and credentials',
          type: 'navigate' as const,
        },
        {
          id: 'security',
          icon: <Lock size={18} color="#261816" />,
          label: 'Security & Access',
          description: 'Password, biometric, 2FA',
          type: 'navigate' as const,
        },
      ],
    },
    {
      title: 'PREFERENCES',
      items: [
        {
          id: 'notifications',
          icon: <Bell size={18} color="#261816" />,
          label: 'Push Notifications',
          description: 'Alert sounds and vibration',
          type: 'toggle' as const,
          value: notifications,
        },
        {
          id: 'darkMode',
          icon: <Moon size={18} color="#261816" />,
          label: 'Dark Mode',
          description: 'Switch to dark interface',
          type: 'toggle' as const,
          value: darkMode,
        },
        {
          id: 'language',
          icon: <Globe size={18} color="#261816" />,
          label: 'Language',
          description: 'English (Default)',
          type: 'navigate' as const,
        },
      ],
    },
    {
      title: 'OPERATIONS',
      items: [
        {
          id: 'liveTracking',
          icon: <Wifi size={18} color="#261816" />,
          label: 'Live Tracking',
          description: 'Real-time GPS telemetry',
          type: 'toggle' as const,
          value: liveTracking,
        },
        {
          id: 'offlineMode',
          icon: <Database size={18} color="#261816" />,
          label: 'Offline Mode',
          description: 'Cache data for field use',
          type: 'toggle' as const,
          value: offlineMode,
        },
        {
          id: 'devices',
          icon: <Smartphone size={18} color="#261816" />,
          label: 'Connected Devices',
          description: '2 devices linked',
          type: 'navigate' as const,
        },
      ],
    },
    {
      title: 'SUPPORT',
      items: [
        {
          id: 'help',
          icon: <HelpCircle size={18} color="#261816" />,
          label: 'Help & Support',
          description: 'FAQs and contact',
          type: 'navigate' as const,
        },
        {
          id: 'about',
          icon: <Info size={18} color="#261816" />,
          label: 'About ASAS',
          description: 'v4.2.1-stable',
          type: 'navigate' as const,
        },
      ],
    },
  ];

  const handleToggle = (id: string) => {
    switch (id) {
      case 'notifications': setNotifications(!notifications); break;
      case 'darkMode': setDarkMode(!darkMode); break;
      case 'liveTracking': setLiveTracking(!liveTracking); break;
      case 'offlineMode': setOfflineMode(!offlineMode); break;
    }
  };

  return (
    <View style={styles.screen}>
      <OperationsHeader />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Page Title */}
        <View style={styles.titleSection}>
          <Text style={styles.pageTitle}>{t('settings')}</Text>
          <Text style={styles.pageSubtitle}>
            {t('configure_env')}
          </Text>
        </View>

        {/* Operator Info Card */}
        <TouchableOpacity style={styles.operatorCard} activeOpacity={0.7}>
          <View style={styles.operatorAvatar}>
            <Text style={styles.avatarText}>OP</Text>
          </View>
          <View style={styles.operatorInfo}>
            <Text style={styles.operatorName}>Operator Alpha</Text>
            <Text style={styles.operatorRole}>Field Operations • Dar Es Salaam</Text>
          </View>
          <ChevronRight size={18} color="#8D706C" />
        </TouchableOpacity>

        {/* Settings Sections */}
        {sections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionLabel}>{section.title}</Text>
            <View style={styles.sectionCard}>
              {section.items.map((item, index) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.settingRow,
                    index === section.items.length - 1 && styles.settingRowLast,
                  ]}
                  onPress={() => {
                    if (item.type === 'toggle') handleToggle(item.id);
                  }}
                  activeOpacity={item.type === 'toggle' ? 1 : 0.6}
                >
                  <View style={styles.settingIcon}>{item.icon}</View>
                  <View style={styles.settingInfo}>
                    <Text style={styles.settingLabel}>{item.label}</Text>
                    {item.description && (
                      <Text style={styles.settingDesc}>{item.description}</Text>
                    )}
                  </View>
                  {item.type === 'toggle' ? (
                    <Switch
                      value={item.value}
                      onValueChange={() => handleToggle(item.id)}
                      trackColor={{ false: '#E1BFB9', true: ASAS_RED + '60' }}
                      thumbColor={item.value ? ASAS_RED : '#F7DDD9'}
                    />
                  ) : (
                    <ChevronRight size={16} color="#8D706C" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Logout */}
        <TouchableOpacity
          style={styles.logoutButton}
          activeOpacity={0.7}
          onPress={handleLogout}
        >
          <LogOut size={18} color="#BA1A1A" />
          <Text style={styles.logoutText}>{t('log_out')}</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Logout Splash Overlay */}
      {loggingOut && (
        <Animated.View
          style={[
            styles.splashOverlay,
            { opacity: splashOpacity },
          ]}
        >
          <Animated.View
            style={[
              styles.splashContent,
              { transform: [{ scale: splashScale }] },
            ]}
          >
            <Text style={styles.splashBrand}>ASAS</Text>
            <Text style={styles.splashSub}>Live Ops</Text>
          </Animated.View>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFF8F6',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },

  // ---- Title ----
  titleSection: {
    marginBottom: 16,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#261816',
  },
  pageSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#59413D',
    marginTop: 4,
  },

  // ---- Operator Card ----
  operatorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  operatorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: ASAS_RED,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  operatorInfo: {
    flex: 1,
  },
  operatorName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#261816',
  },
  operatorRole: {
    fontSize: 12,
    fontWeight: '500',
    color: '#59413D',
    marginTop: 2,
  },

  // ---- Settings Sections ----
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8D706C',
    letterSpacing: 1.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F7DDD9',
  },
  settingRowLast: {
    borderBottomWidth: 0,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#FFF0EE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#261816',
  },
  settingDesc: {
    fontSize: 12,
    fontWeight: '500',
    color: '#8D706C',
    marginTop: 1,
  },

  // ---- Logout ----
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#BA1A1A',
    backgroundColor: '#FFFFFF',
    marginTop: 8,
    marginBottom: 20,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#BA1A1A',
  },

  // ---- Splash Overlay (matches boot splash) ----
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
    color: '#C0392B',
    letterSpacing: -2,
  },
  splashSub: {
    fontSize: 14,
    color: '#7F8C8D',
    marginTop: 8,
    letterSpacing: 4,
    textTransform: 'uppercase',
  },
});
