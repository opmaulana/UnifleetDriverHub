import React, { useState, useEffect } from 'react';
import { Platform, View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { useStore } from '../store/useStore';
import { theme } from '../theme/theme';

const ANDROID_DOWNLOAD_URL = '#'; // Replace with your APK download link
const IOS_DOWNLOAD_URL = '#'; // Replace with your TestFlight / App Store link

interface WebPhoneWrapperProps {
  children: React.ReactNode;
}

type PreviewMode = 'android_phone' | 'iphone' | 'iphone_large' | 'fullscreen';

export const WebPhoneWrapper: React.FC<WebPhoneWrapperProps> = ({ children }) => {
  if (Platform.OS !== 'web') {
    return <View style={styles.nativeContainer}>{children}</View>;
  }

  const [previewMode, setPreviewMode] = useState<PreviewMode>('android_phone');
  const [time, setTime] = useState('');
  const [screenWidth, setScreenWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  const {
    introTruckX, setIntroTruckX,
    introTruckY, setIntroTruckY,
    introTruckScale, setIntroTruckScale,
    introTextX, setIntroTextX,
    introTextY, setIntroTextY,
    introTextScale, setIntroTextScale,
    introFooterX, setIntroFooterX,
    introFooterY, setIntroFooterY,
    introFooterScale, setIntroFooterScale,
    introS2TextX, setIntroS2TextX,
    introS2TextY, setIntroS2TextY,
    introS2TextScale, setIntroS2TextScale,
    introPointsX, setIntroPointsX,
    introPointsY, setIntroPointsY,
    introPointsScale, setIntroPointsScale,
    introS3TextX, setIntroS3TextX,
    introS3TextY, setIntroS3TextY,
    introS3TextScale, setIntroS3TextScale,
    introS3FooterX, setIntroS3FooterX,
    introS3FooterY, setIntroS3FooterY,
    introS3FooterScale, setIntroS3FooterScale,
  } = useStore();

  // Sync window resize
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Simple live clock for the simulated status bar
  useEffect(() => {
    const updateClock = () => {
      const date = new Date();
      let hours = date.getHours();
      const minutes = date.getMinutes();
      const minutesStr = minutes < 10 ? `0${minutes}` : minutes;
      setTime(`${hours}:${minutesStr}`);
    };
    updateClock();
    const interval = setInterval(updateClock, 60000);
    return () => clearInterval(interval);
  }, []);

  // Determine effective mode based on screen width
  // If the web screen is very narrow (e.g. user is testing in responsive mobile view in Chrome DevTools),
  // force fullscreen so it acts like a native web app.
  const effectiveMode = screenWidth < 500 ? 'fullscreen' : previewMode;

  if (effectiveMode === 'fullscreen') {
    return (
      <View nativeID="asas-web-app-frame" style={styles.fullscreenContainer}>
        {children}
        {/* Floating Toggle Panel for Web developers */}
        {screenWidth >= 500 && (
          <TouchableOpacity 
            style={styles.floatingToggleButton}
            onPress={() => setPreviewMode('android_phone')}
          >
            <Text style={styles.floatingToggleText}>📱 Show Device Frame</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // Get frame dimensions
  const dimensions = {
    android_phone: { width: 411, height: 923 },
    iphone: { width: 390, height: 844 },
    iphone_large: { width: 428, height: 926 },
  }[effectiveMode as 'android_phone' | 'iphone' | 'iphone_large'];

  const showSidePanel = screenWidth >= 850;

  return (
    <View style={styles.webContainer}>
      {/* Sleek Abstract Background Gradients */}
      <View style={styles.bgGradient1} />
      <View style={styles.bgGradient2} />

      <View style={[styles.mainLayout, showSidePanel ? styles.layoutWithPanel : styles.layoutCentered]}>
        
        {/* Left Side Panel - Info & Controls */}
        {showSidePanel && (
          <View style={styles.sidePanel}>
            <View style={styles.brandContainer}>
              <View style={styles.brandLogo}>
                <Text style={styles.brandLogoText}>UF</Text>
              </View>
              <View>
                <Text style={styles.brandName}>UNIFLEET</Text>
                <Text style={styles.appName}>Driver Hub</Text>
              </View>
            </View>

            <View style={styles.sectionDivider} />

            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>⚡ Interactive Preview</Text>
              <Text style={styles.infoDescription}>
                You are viewing the Web-compatible preview of the Unifleet Driver app. Everything below is interactive and connected!
              </Text>
            </View>

            {/* Device Mode Selectors */}
            <Text style={styles.controlLabel}>PREVIEW MODE</Text>
            <View style={styles.buttonGroup}>
              <TouchableOpacity 
                style={[styles.modeButton, previewMode === 'android_phone' && styles.modeButtonActive]}
                onPress={() => setPreviewMode('android_phone')}
              >
                <Text style={[styles.modeButtonText, previewMode === 'android_phone' && styles.modeButtonTextActive]}>
                  🤖 Android (411×923)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.modeButton, previewMode === 'iphone' && styles.modeButtonActive]}
                onPress={() => setPreviewMode('iphone')}
              >
                <Text style={[styles.modeButtonText, previewMode === 'iphone' && styles.modeButtonTextActive]}>
                  📱 Standard (15)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.modeButton, previewMode === 'iphone_large' && styles.modeButtonActive]}
                onPress={() => setPreviewMode('iphone_large')}
              >
                <Text style={[styles.modeButtonText, previewMode === 'iphone_large' && styles.modeButtonTextActive]}>
                  📱 Max (15 Plus)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.modeButton, previewMode === 'fullscreen' && styles.modeButtonActive]}
                onPress={() => setPreviewMode('fullscreen')}
              >
                <Text style={[styles.modeButtonText, previewMode === 'fullscreen' && styles.modeButtonTextActive]}>
                  🖥️ Full Screen
                </Text>
              </TouchableOpacity>
            </View>

            {/* Connectivity Box */}
            <View style={styles.qrCard}>
              <Text style={styles.qrTitle}>📲 Run on Your Phone</Text>
              <Text style={styles.qrText}>
                1. Make sure your phone is on the <Text style={styles.boldText}>same Wi-Fi network</Text> as your computer.{"\n"}
                2. Install the <Text style={styles.boldText}>Expo Go</Text> app from the App Store / Play Store.{"\n"}
                3. Scan the QR code displayed in your terminal terminal screen.
              </Text>
              <View style={styles.wifiBadge}>
                <Text style={styles.wifiBadgeText}>📡 Local Network Mode</Text>
              </View>
            </View>

            {/* Download App Card */}
            <View style={styles.downloadCard}>
              <Text style={styles.downloadTitle}>📲 Get the Native App</Text>
              <Text style={styles.downloadText}>
                Install the native ASAS Driver application directly on your device.
              </Text>
              <View style={styles.downloadButtonRow}>
                <TouchableOpacity 
                  style={styles.downloadButton}
                  onPress={() => {
                    if (ANDROID_DOWNLOAD_URL && ANDROID_DOWNLOAD_URL !== '#') {
                      Linking.openURL(ANDROID_DOWNLOAD_URL);
                    } else {
                      alert('Android APK download link will be available here once the EAS build is completed.');
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.downloadButtonText}>🤖 Android APK</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.downloadButton}
                  onPress={() => {
                    if (IOS_DOWNLOAD_URL && IOS_DOWNLOAD_URL !== '#') {
                      Linking.openURL(IOS_DOWNLOAD_URL);
                    } else {
                      alert('iOS App Store / TestFlight link will be available here once the EAS build is completed.');
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.downloadButtonText}>🍎 iOS App</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Footer */}
            <Text style={styles.footerText}>
              Powered by Expo 54 & React Native Web
            </Text>
          </View>
        )}

        {/* Smartphone Mock Frame */}
        <View style={styles.phoneContainer}>
          {/* Quick Floating Size Switcher if Side Panel is Hidden */}
          {!showSidePanel && (
            <View style={styles.smallButtonGroup}>
              <TouchableOpacity 
                style={[styles.smallModeBtn, previewMode === 'android_phone' && styles.smallModeBtnActive]}
                onPress={() => setPreviewMode('android_phone')}
              >
                <Text style={styles.smallBtnText}>411px</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.smallModeBtn, previewMode === 'iphone' && styles.smallModeBtnActive]}
                onPress={() => setPreviewMode('iphone')}
              >
                <Text style={styles.smallBtnText}>390px</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.smallModeBtn, previewMode === 'iphone_large' && styles.smallModeBtnActive]}
                onPress={() => setPreviewMode('iphone_large')}
              >
                <Text style={styles.smallBtnText}>428px</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.smallModeBtn}
                onPress={() => setPreviewMode('fullscreen')}
              >
                <Text style={styles.smallBtnText}>🖥️ Full</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Smartphone outer body bezel */}
          <View style={[
            styles.phoneBezel, 
            { 
              width: dimensions.width + 24, 
              height: dimensions.height + 24,
              transform: [{ scale: 0.85 }]
            }
          ]}>
            
            {/* Speaker & Sensor Notch (Dynamic Island Style) */}
            <View style={styles.dynamicIsland}>
              <View style={styles.cameraLens} />
            </View>

            {/* Screen Inner Container */}
            <View style={styles.screenInner}>
              
              {/* Simulated iOS Status Bar */}
              <View style={styles.statusBarSim}>
                <Text style={styles.statusBarTime}>{time || '09:41'}</Text>
                <View style={styles.statusBarIcons}>
                  {/* Signal Icon */}
                  <View style={styles.signalIcon}>
                    <View style={[styles.signalBar, { height: 4 }]} />
                    <View style={[styles.signalBar, { height: 6 }]} />
                    <View style={[styles.signalBar, { height: 8 }]} />
                    <View style={[styles.signalBar, { height: 10 }]} />
                  </View>
                  {/* Wifi Icon */}
                  <Text style={styles.wifiSymbol}>📶</Text>
                  {/* Battery Icon */}
                  <View style={styles.batteryIcon}>
                    <View style={styles.batteryBody}>
                      <View style={styles.batteryFill} />
                    </View>
                    <View style={styles.batteryTip} />
                  </View>
                </View>
              </View>

              {/* The Actual App */}
              <View
                nativeID="asas-web-app-frame"
                style={[
                  styles.appContainer,
                  {
                    width: dimensions.width,
                    height: dimensions.height,
                  },
                ]}
              >
                <View style={{
                  width: dimensions.width,
                  height: dimensions.height,
                }}>
                  {children}
                </View>
              </View>

              {/* Simulated iOS Home Indicator */}
              <View style={styles.homeIndicatorContainer}>
                <View style={styles.homeIndicator} />
              </View>

            </View>
          </View>
        </View>

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  nativeContainer: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  fullscreenContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#000000',
  },
  floatingToggleButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'rgba(29, 29, 31, 0.95)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#3a3a3c',
    zIndex: 99999,
  },
  floatingToggleText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  webContainer: {
    flex: 1,
    backgroundColor: '#0B0B0E',
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bgGradient1: {
    position: 'absolute',
    top: -200,
    left: -200,
    width: 600,
    height: 600,
    borderRadius: 300,
    backgroundColor: 'rgba(229, 57, 53, 0.12)', // Subtle primary red glow
    filter: 'blur(100px)' as any,
  },
  bgGradient2: {
    position: 'absolute',
    bottom: -200,
    right: -200,
    width: 600,
    height: 600,
    borderRadius: 300,
    backgroundColor: 'rgba(0, 122, 255, 0.08)', // Subtle secondary blue glow
    filter: 'blur(100px)' as any,
  },
  mainLayout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 1200,
    paddingHorizontal: 20,
    zIndex: 10,
  },
  layoutWithPanel: {
    justifyContent: 'space-between',
  },
  layoutCentered: {
    justifyContent: 'center',
  },
  sidePanel: {
    width: 360,
    paddingRight: 20,
    justifyContent: 'center',
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandLogo: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#E53935',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    shadowColor: '#E53935',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  brandLogoText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  brandName: {
    color: '#8e8e93',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
  },
  appName: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '800',
    marginTop: -2,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#1c1c1e',
    marginVertical: 20,
  },
  infoCard: {
    backgroundColor: '#151518',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#222227',
    marginBottom: 20,
  },
  infoTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  infoDescription: {
    color: '#8e8e93',
    fontSize: 12,
    lineHeight: 18,
  },
  controlLabel: {
    color: '#8e8e93',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  buttonGroup: {
    flexDirection: 'column',
    gap: 8,
    marginBottom: 24,
  },
  modeButton: {
    backgroundColor: '#151518',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#222227',
  },
  modeButtonActive: {
    borderColor: '#E53935',
    backgroundColor: 'rgba(229, 57, 53, 0.08)',
  },
  modeButtonText: {
    color: '#8e8e93',
    fontSize: 13,
    fontWeight: '600',
  },
  modeButtonTextActive: {
    color: '#ffffff',
  },
  qrCard: {
    backgroundColor: '#151518',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#222227',
    marginBottom: 20,
  },
  qrTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  qrText: {
    color: '#8e8e93',
    fontSize: 12,
    lineHeight: 18,
  },
  boldText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  wifiBadge: {
    marginTop: 12,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  wifiBadgeText: {
    color: '#34C759',
    fontSize: 10,
    fontWeight: 'bold',
  },
  footerText: {
    color: '#3e3e42',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 10,
  },
  sliderCard: {
    backgroundColor: '#1a1a20',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#00d4aa33',
  },
  sliderCardTitle: {
    color: '#00d4aa',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  sliderLabel: {
    color: '#a0a0b0',
    fontSize: 11,
    marginBottom: 2,
  },
  sliderValue: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  phoneContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallButtonGroup: {
    flexDirection: 'row',
    backgroundColor: '#151518',
    borderRadius: 20,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#222227',
  },
  smallModeBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  smallModeBtnActive: {
    backgroundColor: '#E53935',
  },
  smallBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  phoneBezel: {
    backgroundColor: '#000000',
    borderRadius: 44,
    borderWidth: 10,
    borderColor: '#1C1C1E',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.6,
    shadowRadius: 32,
    padding: 2,
    position: 'relative',
  },
  dynamicIsland: {
    position: 'absolute',
    top: 14,
    left: '50%',
    marginLeft: -55,
    width: 110,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#000000',
    zIndex: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingRight: 15,
  },
  cameraLens: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#111122',
  },
  screenInner: {
    flex: 1,
    backgroundColor: '#000000',
    borderRadius: 34,
    overflow: 'hidden',
    position: 'relative',
  },
  statusBarSim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 48,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 10,
    zIndex: 90,
  },
  statusBarTime: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  statusBarIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  signalIcon: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 1.5,
    width: 14,
    height: 10,
  },
  signalBar: {
    width: 2.2,
    backgroundColor: '#ffffff',
    borderRadius: 0.5,
  },
  wifiSymbol: {
    color: '#ffffff',
    fontSize: 10,
  },
  batteryIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  batteryBody: {
    width: 20,
    height: 10,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#ffffff',
    padding: 1,
  },
  batteryFill: {
    flex: 1,
    backgroundColor: '#34C759',
    borderRadius: 1,
  },
  batteryTip: {
    width: 1.5,
    height: 4,
    backgroundColor: '#ffffff',
    borderTopRightRadius: 1,
    borderBottomRightRadius: 1,
  },
  appContainer: {
    backgroundColor: '#000000',
  },
  homeIndicatorContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    zIndex: 90,
    pointerEvents: 'none',
  },
  homeIndicator: {
    width: 120,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#ffffff',
  },
  downloadCard: {
    backgroundColor: '#151518',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#222227',
    marginBottom: 20,
  },
  downloadTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  downloadText: {
    color: '#8e8e93',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 12,
  },
  downloadButtonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  downloadButton: {
    flex: 1,
    backgroundColor: '#222227',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#3a3a3c',
  },
  downloadButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  sliderGroup: {
    backgroundColor: '#151518',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#222227',
    marginBottom: 20,
  },
  sliderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sliderTextLabel: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  sliderValueText: {
    color: '#E53935',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
