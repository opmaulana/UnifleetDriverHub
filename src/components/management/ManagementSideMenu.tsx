import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { theme } from '../../theme/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, LayoutDashboard, Truck, Map, FileText, LifeBuoy, LogOut } from 'lucide-react-native';
import { CommonActions } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = Platform.OS === 'web' ? 320 : Math.min(width * 0.78, 320);

interface ManagementSideMenuProps {
  visible: boolean;
  onClose: () => void;
  navigation: any;
}

export const ManagementSideMenu = ({ visible, onClose, navigation }: ManagementSideMenuProps) => {
  const insets = useSafeAreaInsets();
  const [loggingOut, setLoggingOut] = useState(false);
  const splashOpacity = useRef(new Animated.Value(0)).current;
  const splashScale = useRef(new Animated.Value(0.8)).current;

  // Slide from RIGHT (positive direction)
  const slideAnim = useRef(new Animated.Value(DRAWER_WIDTH)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 280,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: DRAWER_WIDTH,
        duration: 220,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleLogout = () => {
    onClose();
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
  };

  const menuItems = [
    { icon: <LayoutDashboard size={22} color={theme.colors.text} />, label: 'Dashboard', route: 'ManagementDashboard' },
    { icon: <Truck size={22} color={theme.colors.text} />, label: 'Vehicle Registry', route: 'VehicleDetail' },
    { icon: <Map size={22} color={theme.colors.text} />, label: 'Geofence Settings', route: null },
    { icon: <FileText size={22} color={theme.colors.text} />, label: 'Officer Logs', route: null },
    { icon: <LifeBuoy size={22} color={theme.colors.text} />, label: 'Support', route: null },
  ];

  const handleNavigation = (route: string | null) => {
    onClose();
    if (route) {
      navigation.navigate(route);
    }
  };

  return (
    <>
      {Platform.OS === 'web' ? (
        visible && (
          <View style={[StyleSheet.absoluteFill, { zIndex: 9999, overflow: 'hidden' }]}>
            <View style={styles.overlay}>
              <TouchableOpacity style={styles.backgroundTouchable} onPress={onClose} activeOpacity={1} />

              <Animated.View
                style={[
                  styles.drawer,
                  { transform: [{ translateX: slideAnim }] },
                ]}
              >
                {/* Header */}
                <View style={[styles.header, { paddingTop: insets.top }]}>
                  <View style={styles.headerTop}>
                    <Text style={styles.brandText}>ASAS FLEET</Text>
                    <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                      <X color={theme.colors.white} size={22} />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.profileSection}>
                    <Text style={styles.activeShiftText}>Active Shift</Text>
                    <Text style={styles.officerName}>Officer: John Doe</Text>
                  </View>
                </View>

                {/* Menu Items */}
                <View style={styles.menuContainer}>
                  {menuItems.map((item, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.menuItem}
                      onPress={() => handleNavigation(item.route)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.menuIcon}>{item.icon}</View>
                      <Text style={styles.menuLabel}>{item.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Logout + Footer */}
                <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
                  <TouchableOpacity
                    style={styles.logoutBtn}
                    onPress={handleLogout}
                    activeOpacity={0.7}
                  >
                    <LogOut size={18} color="#BA1A1A" />
                    <Text style={styles.logoutText}>Log Out</Text>
                  </TouchableOpacity>

                  <Text style={styles.developedBy}>DEVELOPED BY UNIFLEET LABS</Text>
                  <Text style={styles.versionText}>v2.4.1 (Field Ready)</Text>
                </View>
              </Animated.View>
            </View>
          </View>
        )
      ) : (
        <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
          <View style={styles.overlay}>
            <TouchableOpacity style={styles.backgroundTouchable} onPress={onClose} activeOpacity={1} />

            <Animated.View
              style={[
                styles.drawer,
                { transform: [{ translateX: slideAnim }] },
              ]}
            >
              {/* Header */}
              <View style={[styles.header, { paddingTop: insets.top }]}>
                <View style={styles.headerTop}>
                  <Text style={styles.brandText}>ASAS FLEET</Text>
                  <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                    <X color={theme.colors.white} size={22} />
                  </TouchableOpacity>
                </View>
                <View style={styles.profileSection}>
                  <Text style={styles.activeShiftText}>Active Shift</Text>
                  <Text style={styles.officerName}>Officer: John Doe</Text>
                </View>
              </View>

              {/* Menu Items */}
              <View style={styles.menuContainer}>
                {menuItems.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.menuItem}
                    onPress={() => handleNavigation(item.route)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.menuIcon}>{item.icon}</View>
                    <Text style={styles.menuLabel}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Logout + Footer */}
              <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
                <TouchableOpacity
                  style={styles.logoutBtn}
                  onPress={handleLogout}
                  activeOpacity={0.7}
                >
                  <LogOut size={18} color="#BA1A1A" />
                  <Text style={styles.logoutText}>Log Out</Text>
                </TouchableOpacity>

                <Text style={styles.developedBy}>DEVELOPED BY UNIFLEET LABS</Text>
                <Text style={styles.versionText}>v2.4.1 (Field Ready)</Text>
              </View>
            </Animated.View>
          </View>
        </Modal>
      )}

      {/* Global Logout Splash (same as boot splash) */}
      {loggingOut && (
        Platform.OS === 'web' ? (
          <View style={[StyleSheet.absoluteFill, styles.splashOverlay, { zIndex: 99999 }]}>
            <Animated.View style={[styles.splashContent, { opacity: splashOpacity, transform: [{ scale: splashScale }] }]}>
              <Text style={styles.splashLogo}>ASAS</Text>
              <Text style={styles.splashSub}>Management Hub</Text>
            </Animated.View>
          </View>
        ) : (
          <Modal visible transparent animationType="none">
            <Animated.View style={[styles.splashOverlay, { opacity: splashOpacity }]}>
              <Animated.View style={[styles.splashContent, { transform: [{ scale: splashScale }] }]}>
                <Text style={styles.splashLogo}>ASAS</Text>
                <Text style={styles.splashSub}>Management Hub</Text>
              </Animated.View>
            </Animated.View>
          </Modal>
        )
      )}
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    flexDirection: 'row',
  },
  backgroundTouchable: {
    ...StyleSheet.absoluteFillObject,
  },
  drawer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: theme.colors.white,
    shadowColor: '#000',
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 20,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: theme.colors.primary,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 50,
  },
  brandText: {
    fontSize: 18,
    fontWeight: '900',
    color: theme.colors.white,
    letterSpacing: 1.5,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileSection: {
    marginTop: 8,
  },
  activeShiftText: {
    fontSize: 11,
    color: '#81C784',
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  officerName: {
    fontSize: 15,
    color: theme.colors.white,
    fontWeight: '600',
  },
  menuContainer: {
    flex: 1,
    paddingTop: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuLabel: {
    fontSize: 15,
    color: theme.colors.text,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 16,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#BA1A1A',
    backgroundColor: '#FFFFFF',
    marginBottom: 20,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#BA1A1A',
  },
  developedBy: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    fontWeight: '700',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  versionText: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },

  // ---- Splash ----
  splashOverlay: {
    flex: 1,
    backgroundColor: theme.colors.white,
    justifyContent: 'center',
    alignItems: 'center',
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
