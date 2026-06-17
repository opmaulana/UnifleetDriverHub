import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Pressable,
  Dimensions,
  Platform,
  StatusBar,
  FlatList,
} from 'react-native';
import {
  Menu,
  X,
  LayoutDashboard,
  Settings,
  ChevronRight,
  Globe,
  Check,
  RotateCw,
  LogOut,
  ArrowLeft,
  Truck,
  Lightbulb,
  MapPin,
} from 'lucide-react-native';
import { useTranslation } from '../../hooks/useTranslation';
import { useOperationsStore } from '../../store/useOperationsStore';
import { useNavigation, useRoute, CommonActions } from '@react-navigation/native';

const ASAS_RED = '#C0392B';
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const STATUS_BAR_HEIGHT = Platform.OS === 'android' ? (StatusBar.currentHeight || 40) : 44;
const DRAWER_WIDTH = Platform.OS === 'web' ? 360 : Math.min(SCREEN_WIDTH * 0.78, 360);

interface OperationsHeaderProps {
  onNavigateToSettings?: () => void;
}

const menuItems = [
  {
    id: 'dashboards',
    label: 'Dashboards',
    icon: <LayoutDashboard size={20} color="#261816" />,
    description: 'Fleet intelligence dashboards',
  },
  {
    id: 'geofence_analytics',
    label: 'Geofence Analytics',
    icon: <MapPin size={20} color="#261816" />,
    description: 'Zone violations & analytics history',
  },
  {
    id: 'vehicle_list',
    label: 'Vehicle List',
    icon: <Truck size={20} color="#261816" />,
    description: 'Real-time fleet tracker roster',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: <Settings size={20} color="#261816" />,
    description: 'App & account configuration',
  },
  {
    id: 'request_feature',
    label: 'Request a Feature',
    icon: <Lightbulb size={20} color="#261816" />,
    description: 'Suggest improvements or custom tools',
  },
];

const LANGUAGES = [
  { code: 'en' as const, name: 'English', flag: '🇬🇧' },
  { code: 'sw' as const, name: 'Kiswahili', flag: '🇹🇿' },
];

export const OperationsHeader: React.FC<OperationsHeaderProps> = ({
  onNavigateToSettings,
}) => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const isSettingsPage = route.name === 'Settings';

  const [menuVisible, setMenuVisible] = useState(false);
  const [langModalVisible, setLangModalVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(DRAWER_WIDTH)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;
  const { t, language, setLanguage } = useTranslation();

  const { isLoading, bootstrapFleet } = useOperationsStore();
  const spinAnim = useRef(new Animated.Value(0)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (isLoading) {
      spinAnim.setValue(0);
      animationRef.current = Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        })
      );
      animationRef.current.start();
    } else {
      if (animationRef.current) {
        animationRef.current.stop();
        animationRef.current = null;
      }
      Animated.timing(spinAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isLoading]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const handleReload = () => {
    bootstrapFleet();
  };

  const openMenu = () => {
    setMenuVisible(true);
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 280,
        useNativeDriver: true,
      }),
      Animated.timing(overlayAnim, {
        toValue: 1,
        duration: 280,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeMenu = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: DRAWER_WIDTH,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(overlayAnim, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setMenuVisible(false);
    });
  };

  const [loggingOut, setLoggingOut] = useState(false);
  const splashOpacity = useRef(new Animated.Value(0)).current;
  const splashScale = useRef(new Animated.Value(0.8)).current;

  const handleLogout = () => {
    closeMenu();
    // Tiny delay to let drawer close animation play slightly, then trigger full screen splash
    setTimeout(() => {
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
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: 'IntentSelection' }],
            })
          );
        }, 1200);
      });
    }, 150);
  };

  const handleMenuPress = (id: string) => {
    closeMenu();
    setTimeout(() => {
      if (id === 'settings') {
        navigation.navigate('Settings');
      } else if (id === 'dashboards') {
        navigation.navigate('Dashboard');
      } else if (id === 'geofence_analytics') {
        navigation.navigate('GeofenceAnalytics');
      } else if (id === 'vehicle_list') {
        navigation.navigate('VehicleList');
      } else if (id === 'request_feature') {
        alert('Thank you! Tell us what custom features or charts you want on your fleet dashboard, and we will build it for you.');
      }
    }, 250);
  };

  return (
    <>
      {/* Header Bar */}
      <View style={styles.headerBar}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {isSettingsPage && (
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
              <ArrowLeft color="#FFFFFF" size={20} style={{ marginRight: 8 }} />
            </TouchableOpacity>
          )}
          <Text style={styles.headerBrand}>ASAS</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={handleReload}
            style={styles.reloadBtn}
            disabled={isLoading}
            activeOpacity={0.7}
          >
            <Animated.View style={{ transform: [{ rotate: spin }], width: 20, height: 20, justifyContent: 'center', alignItems: 'center' }}>
              <RotateCw color="#FFFFFF" size={20} />
            </Animated.View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setLangModalVisible(true)}
            style={styles.globeBtn}
          >
            <Globe color="#FFFFFF" size={20} />
          </TouchableOpacity>
          <TouchableOpacity onPress={openMenu} style={styles.hamburgerBtn}>
            <Menu color="#FFFFFF" size={22} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Slide-out Menu */}
      {Platform.OS === 'web' ? (
        menuVisible && (
          <View style={[StyleSheet.absoluteFill, { zIndex: 9999, overflow: 'hidden' }]}>
            {/* Overlay */}
            <Animated.View style={[styles.overlay, { opacity: overlayAnim }]}>
              <Pressable style={styles.overlayPressable} onPress={closeMenu} />
            </Animated.View>

            {/* Drawer Panel */}
            <Animated.View
              style={[
                styles.drawerPanel,
                { transform: [{ translateX: slideAnim }] },
              ]}
            >
              {/* Drawer Header */}
              <View style={styles.drawerHeader}>
                <Text style={styles.drawerTitle}>ASAS COMMAND</Text>
                <TouchableOpacity onPress={closeMenu} style={styles.closeBtn}>
                  <X color="#FFFFFF" size={22} />
                </TouchableOpacity>
              </View>

              {/* Drawer Spacer */}
              <View style={{ height: 16 }} />

              {/* Menu Items */}
              {menuItems.map((item, index) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.menuItem,
                    index === menuItems.length - 1 && styles.menuItemLast,
                  ]}
                  onPress={() => handleMenuPress(item.id)}
                  activeOpacity={0.6}
                >
                  <View style={item.id === 'dashboards' ? [styles.menuItemIcon, { backgroundColor: '#FADBD8' }] : styles.menuItemIcon}>{item.icon}</View>
                  <View style={styles.menuItemText}>
                    <Text style={styles.menuItemLabel}>{item.label}</Text>
                    <Text style={styles.menuItemDesc}>{item.description}</Text>
                  </View>
                  <ChevronRight size={16} color="#8D706C" />
                </TouchableOpacity>
              ))}

              {/* Logout Button */}
              <TouchableOpacity
                style={styles.drawerLogoutBtn}
                onPress={handleLogout}
                activeOpacity={0.7}
              >
                <LogOut size={16} color="#BA1A1A" />
                <Text style={styles.drawerLogoutText}>{t('log_out') || 'Log Out'}</Text>
              </TouchableOpacity>

              {/* Footer */}
              <View style={styles.drawerFooter}>
                <Text style={styles.drawerFooterText}>
                  Powered by Uni Fleet Intelligence
                </Text>
                <Text style={styles.drawerVersion}>v4.2.1-stable</Text>
              </View>
            </Animated.View>
          </View>
        )
      ) : (
        <Modal
          visible={menuVisible}
          transparent
          animationType="none"
          statusBarTranslucent
          onRequestClose={closeMenu}
        >
          {/* Overlay */}
          <Animated.View style={[styles.overlay, { opacity: overlayAnim }]}>
            <Pressable style={styles.overlayPressable} onPress={closeMenu} />
          </Animated.View>

          {/* Drawer Panel */}
          <Animated.View
            style={[
              styles.drawerPanel,
              { transform: [{ translateX: slideAnim }] },
            ]}
          >
            {/* Drawer Header */}
            <View style={styles.drawerHeader}>
              <Text style={styles.drawerTitle}>ASAS COMMAND</Text>
              <TouchableOpacity onPress={closeMenu} style={styles.closeBtn}>
                <X color="#FFFFFF" size={22} />
              </TouchableOpacity>
            </View>

            {/* Drawer Spacer */}
            <View style={{ height: 16 }} />

            {/* Menu Items */}
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.menuItem,
                  index === menuItems.length - 1 && styles.menuItemLast,
                ]}
                onPress={() => handleMenuPress(item.id)}
                activeOpacity={0.6}
              >
                <View style={styles.menuItemIcon}>{item.icon}</View>
                <View style={styles.menuItemText}>
                  <Text style={styles.menuItemLabel}>{item.label}</Text>
                  <Text style={styles.menuItemDesc}>{item.description}</Text>
                </View>
                <ChevronRight size={16} color="#8D706C" />
              </TouchableOpacity>
            ))}

            {/* Logout Button */}
            <TouchableOpacity
              style={styles.drawerLogoutBtn}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <LogOut size={16} color="#BA1A1A" />
              <Text style={styles.drawerLogoutText}>{t('log_out') || 'Log Out'}</Text>
            </TouchableOpacity>

            {/* Footer */}
            <View style={styles.drawerFooter}>
              <Text style={styles.drawerFooterText}>
                Powered by Uni Fleet Intelligence
              </Text>
              <Text style={styles.drawerVersion}>v4.2.1-stable</Text>
            </View>
          </Animated.View>
        </Modal>
      )}

      {/* Language Selection Modal */}
      <Modal
        animationType="fade"
        transparent
        visible={langModalVisible}
        onRequestClose={() => setLangModalVisible(false)}
      >
        <View style={styles.langOverlay}>
          <View style={styles.langModal}>
            <View style={styles.langModalHeader}>
              <Text style={styles.langModalTitle}>{t('select_language')}</Text>
              <TouchableOpacity onPress={() => setLangModalVisible(false)}>
                <X color="#261816" size={22} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={LANGUAGES}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.langItem,
                    language === item.code && styles.langItemActive,
                  ]}
                  onPress={() => {
                    setLanguage(item.code);
                    setLangModalVisible(false);
                  }}
                >
                  <Text style={styles.langFlag}>{item.flag}</Text>
                  <Text
                    style={[
                      styles.langName,
                      language === item.code && styles.langNameActive,
                    ]}
                  >
                    {item.name}
                  </Text>
                  {language === item.code && (
                    <Check color={ASAS_RED} size={18} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

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
    </>
  );
};

const styles = StyleSheet.create({
  // ---- Header Bar ----
  headerBar: {
    height: 56 + STATUS_BAR_HEIGHT,
    paddingTop: STATUS_BAR_HEIGHT,
    backgroundColor: ASAS_RED,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  headerBrand: {
    fontFamily: Platform.select({
      web: 'Playfair Display',
      default: 'PlayfairDisplay-Bold',
    }),
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  hamburgerBtn: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  globeBtn: {
    width: 38,
    height: 38,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reloadBtn: {
    width: 38,
    height: 38,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ---- Overlay ----
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(38, 24, 22, 0.5)',
  },
  overlayPressable: {
    flex: 1,
  },

  // ---- Drawer ----
  drawerPanel: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: '#FFF8F6',
    shadowColor: '#000',
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 20,
  },
  drawerHeader: {
    height: 56 + STATUS_BAR_HEIGHT,
    paddingTop: STATUS_BAR_HEIGHT,
    backgroundColor: ASAS_RED,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  drawerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1.5,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  drawerSubHeader: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 8,
  },
  drawerSubTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8D706C',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  drawerDivider: {
    height: 1,
    backgroundColor: '#E1BFB9',
    marginTop: 10,
  },

  // ---- Menu Items ----
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F7DDD9',
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  menuItemText: {
    flex: 1,
  },
  menuItemLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#261816',
  },
  menuItemDesc: {
    fontSize: 12,
    fontWeight: '500',
    color: '#59413D',
    marginTop: 2,
  },

  // ---- Footer ----
  drawerFooter: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  drawerFooterText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#8D706C',
  },
  drawerVersion: {
    fontSize: 10,
    color: '#E1BFB9',
    marginTop: 4,
  },

  // ---- Language Modal ----
  langOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  langModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '100%',
    maxHeight: 400,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  langModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  langModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#261816',
  },
  langItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 4,
    gap: 12,
  },
  langItemActive: {
    backgroundColor: ASAS_RED + '10',
  },
  langFlag: {
    fontSize: 22,
  },
  langName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#261816',
  },
  langNameActive: {
    fontWeight: '700',
    color: ASAS_RED,
  },
  backBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  drawerLogoutBtn: {
    position: 'absolute',
    bottom: 100,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#BA1A1A',
    backgroundColor: '#FFFFFF',
  },
  drawerLogoutText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#BA1A1A',
  },
  splashOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  splashContent: {
    alignItems: 'center',
  },
  splashBrand: {
    fontFamily: Platform.select({
      web: 'Playfair Display',
      default: 'PlayfairDisplay-Bold',
    }),
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
