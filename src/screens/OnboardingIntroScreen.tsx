import React, { useRef, useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Animated,
  TextInput,
  KeyboardAvoidingView,
  Keyboard,
  Image,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { ArrowRight } from 'lucide-react-native';
import { theme, playfairBold, playfairBoldStyle } from '../theme/theme';
import { useStore } from '../store/useStore';

const OnboardingPoint = ({ title, desc }: { title: string, desc: string }) => (
  <View style={styles.pointRow}>
    <View style={styles.pointDot} />
    <View style={styles.pointTextContainer}>
      <Text style={styles.pointTitle}>{title}</Text>
      <Text style={styles.pointDesc}>{desc}</Text>
    </View>
  </View>
);

export const OnboardingIntroScreen = ({ navigation }: any) => {
  const { width, height } = useWindowDimensions();
  const layoutWidth = Platform.OS === 'web' ? 411 : width;
  const layoutHeight = Platform.OS === 'web' ? 923 : height;
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const transition = useRef(new Animated.Value(0)).current;
  const keyboardHeight = useRef(new Animated.Value(0)).current;

  const isButtonDisabled = step === 2 && !name.trim();
  const sidePadding = Math.max(24, Math.min(36, layoutWidth * 0.085));
  const titleFontSize = Math.max(50, Math.min(64, layoutWidth * 0.155));
  const titleLineHeight = titleFontSize * 1.08;
  const topBrandFontSize = Math.max(26, Math.min(30, layoutWidth * 0.075));
  const truckWidth = Math.min(layoutWidth * 0.98, 390);
  const truckHeight = truckWidth * (682 / 1024);
  const truckRightOffset = -truckWidth * 0.48;
  const truckBottomOffset = Math.max(78, layoutHeight * 0.11);
  const firstScreenTitleDrop = Math.max(250, layoutHeight * 0.37);
  const buttonWidth = layoutWidth - sidePadding * 2;

  const {
    introTruckX, introTruckY, introTruckScale,
    introTextX, introTextY, introTextScale,
    introFooterX, introFooterY, introFooterScale,
    introS2TextX, introS2TextY, introS2TextScale,
    introPointsX, introPointsY, introPointsScale,
    introS3TextX, introS3TextY, introS3TextScale,
    introS3FooterX, introS3FooterY, introS3FooterScale,
  } = useStore();

  // Store values drive position+scale on ALL platforms (411×923 matches Android)
  const webTruckRight = introTruckX;
  const webTruckBottom = introTruckY;
  const webTruckTransform = [{ scale: introTruckScale }];

  // Hero text overrides — applied on all platforms, interpolating between Screen 1, Screen 2, and Screen 3 positions
  const webHeroTranslateX = transition.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [introTextX, introS2TextX, introS3TextX],
  });
  const webHeroTranslateY = transition.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [introTextY, introS2TextY, introS3TextY],
  });
  const webHeroScale = transition.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [introTextScale, introS2TextScale, introS3TextScale],
  });

  // Footer (tagline + button) overrides — applied on all platforms, interpolating between Screen 1, Screen 2, and Screen 3
  const webFooterTranslateX = transition.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [introFooterX, 0, introS3FooterX],
  });
  const webFooterTranslateY = transition.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [introFooterY, 0, introS3FooterY],
  });
  const webFooterScale = transition.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [introFooterScale, 1.0, introS3FooterScale],
  });

  useEffect(() => {
    const showSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardVisible(true);
        Animated.timing(keyboardHeight, {
          toValue: e.endCoordinates.height,
          duration: Platform.OS === 'ios' ? e.duration : 250,
          useNativeDriver: true,
        }).start();
      }
    );
    const hideSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      (e) => {
        setKeyboardVisible(false);
        Animated.timing(keyboardHeight, {
          toValue: 0,
          duration: Platform.OS === 'ios' ? e.duration : 250,
          useNativeDriver: true,
        }).start();
      }
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const handlePrimaryPress = () => {
    if (step === 0) {
      setStep(1);
      Animated.timing(transition, {
        toValue: 1,
        duration: 320,
        useNativeDriver: true,
      }).start();
      return;
    }

    if (step === 1) {
      setStep(2);
      Animated.timing(transition, {
        toValue: 2,
        duration: 320,
        useNativeDriver: true,
      }).start();
      return;
    }

    if (!name.trim()) return;

    navigation.replace('IntentSelection', { visitorName: name.trim() });
  };

  const heroTranslateY = transition.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [firstScreenTitleDrop, 0, 0],
  });

  const pointsOpacity = transition.interpolate({
    inputRange: [0, 0.45, 1, 1.45, 2],
    outputRange: [0, 0, 1, 0, 0],
  });

  const pointsTranslateY = transition.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [20, 0, -20],
  });

  const formOpacity = transition.interpolate({
    inputRange: [1, 1.45, 2],
    outputRange: [0, 0, 1],
  });

  const formTranslateY = transition.interpolate({
    inputRange: [1, 2],
    outputRange: [34, 0],
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={styles.keyboardView}
        enabled={false}
      >
      <Animated.View 
        style={[
          styles.content, 
          { 
            paddingHorizontal: sidePadding,
            transform: [
              { translateY: Animated.multiply(keyboardHeight, -0.6) }
            ]
          }
        ]}
      >
        {!isKeyboardVisible && (
          <Text style={[styles.topBrand, { fontSize: topBrandFontSize }]}>ASAS Mobile</Text>
        )}

        {(step === 0 || step === 1) && (
          <View
            pointerEvents="none"
            style={[
              styles.truckContainer,
              {
                width: truckWidth,
                height: truckHeight,
                right: webTruckRight,
                bottom: webTruckBottom,
                ...(webTruckTransform ? { transform: webTruckTransform } : {}),
              },
            ]}
          >
            <Image
              source={require('../../assets/intro-truck.png')}
              style={styles.introTruck}
              resizeMode="contain"
            />
          </View>
        )}

        <Animated.View
          style={[
            styles.heroContent,
            {
              alignItems: step === 2 ? 'flex-start' : 'center',
              width: step === 2 ? buttonWidth : 'auto',
              alignSelf: 'center',
              transform: [
                { translateY: heroTranslateY },
                { translateX: webHeroTranslateX },
                { translateY: webHeroTranslateY },
                { scale: webHeroScale },
              ],
            },
          ]}
        >
          <Text
            style={[
              styles.heroTitle,
              {
                fontSize: titleFontSize,
                lineHeight: titleLineHeight,
                textAlign: step === 2 ? 'left' : 'center',
              },
            ]}
          >
            {step === 2 ? 'ASAS Mobile' : `ASAS\nMobile`}
          </Text>
          {step === 2 && (
            <>
              <Text style={[styles.heroTagline, { textAlign: 'left', fontSize: Math.max(28, Math.min(38, layoutWidth * 0.09)), marginTop: 12 }]}>
                Total fleet control,{"\n"}right in your pocket.
              </Text>
            </>
          )}
        </Animated.View>

        {(step === 1) && (
          <Animated.View 
            style={[
              styles.pointsListContainer, 
              { 
                opacity: pointsOpacity,
                transform: [
                  { translateY: pointsTranslateY },
                  { translateX: introPointsX },
                  { translateY: introPointsY },
                  { scale: introPointsScale },
                ]
              }
            ]}
          >
            <ScrollView 
              showsVerticalScrollIndicator={false}
              style={{ maxHeight: 380 }}
            >
              <OnboardingPoint 
                title="One app. Three consoles." 
                desc="Drivers, on-ground officers, and management — all in one powerful platform." 
              />
              <OnboardingPoint 
                title="Real-time data, always." 
                desc="Get live updates and stay in control, wherever you are." 
              />
              <OnboardingPoint 
                title="Smarter decisions." 
                desc="Insights and reports that help you act faster and plan better." 
              />
              <OnboardingPoint 
                title="Secure & reliable." 
                desc="Your data is safe with enterprise-grade security." 
              />
            </ScrollView>
          </Animated.View>
        )}

        <Animated.View
          style={[
            styles.footer,
            {
              transform: [
                { translateX: webFooterTranslateX },
                { translateY: webFooterTranslateY },
                { scale: webFooterScale },
              ],
            },
          ]}
        >
          {step === 0 && (
            <Text style={styles.heroSubtitle}>
              Let's get you started.
            </Text>
          )}

          {step === 2 && (
            <Animated.View
              style={[
                styles.nameSection,
                {
                  opacity: formOpacity,
                  transform: [{ translateY: formTranslateY }],
                  width: buttonWidth,
                },
              ]}
            >
              <Text style={styles.nameLabel}>Tell us your name?</Text>
              <TextInput
                style={[styles.nameInput, { width: '100%' }]}
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                placeholderTextColor="#A8A8A8"
                autoCapitalize="words"
                returnKeyType="done"
              />
            </Animated.View>
          )}

          <TouchableOpacity
            style={[
              styles.ctaButton,
              isButtonDisabled && styles.ctaButtonDisabled,
              { width: buttonWidth }
            ]}
            activeOpacity={0.85}
            onPress={handlePrimaryPress}
            disabled={isButtonDisabled}
          >
            <Text
              style={[
                styles.ctaText,
                isButtonDisabled && styles.ctaTextDisabled,
              ]}
            >
              {step === 0 ? 'Get started' : step === 1 ? 'Continue' : 'Proceed'}
            </Text>
            <ArrowRight
              size={24}
              color={isButtonDisabled ? '#A8A8A8' : theme.colors.white}
              strokeWidth={2.5}
            />
          </TouchableOpacity>

          <View style={styles.pagination}>
            <View style={[styles.dot, step === 0 ? styles.dotActive : styles.dotInactive]} />
            <View style={[styles.dot, step === 1 ? styles.dotActive : styles.dotInactive]} />
            <View style={[styles.dot, step === 2 ? styles.dotActive : styles.dotInactive]} />
          </View>
        </Animated.View>
      </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingTop: 72,
    paddingBottom: 28,
  },
  topBrand: {
    ...playfairBoldStyle,
    color: theme.colors.primary,
    fontSize: 30,
    letterSpacing: -1,
  },
  heroContent: {
    marginTop: 0,
    marginBottom: 20,
    zIndex: 2,
    alignItems: 'center',
  },
  heroTitle: {
    ...playfairBoldStyle,
    color: theme.colors.primary,
    letterSpacing: -2,
    marginBottom: 28,
    textAlign: 'center',
  },
  heroTagline: {
    ...playfairBoldStyle,
    color: theme.colors.text,
    fontSize: 38,
    lineHeight: 48,
    letterSpacing: -1.2,
    marginBottom: 30,
  },
  heroSubtitle: {
    color: '#4A4A4A',
    fontSize: 22,
    fontWeight: '500',
    lineHeight: 30,
    textAlign: 'center',
  },
  footer: {
    marginTop: 'auto',
    gap: 28,
    zIndex: 2,
    alignItems: 'center',
    width: '100%',
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#D6D6D6',
  },
  dotActive: {
    backgroundColor: theme.colors.primary,
  },
  dotInactive: {
    backgroundColor: '#D6D6D6',
  },
  nameSection: {
    gap: 18,
  },
  nameLabel: {
    color: theme.colors.black,
    fontSize: 23,
    fontWeight: '500',
    lineHeight: 30,
  },
  nameInput: {
    height: 78,
    borderWidth: 1.5,
    borderColor: '#D6D6D6',
    borderRadius: 18,
    paddingHorizontal: 24,
    color: theme.colors.text,
    fontSize: 23,
    fontWeight: '400',
    backgroundColor: theme.colors.white,
  },
  ctaButton: {
    height: 76,
    borderRadius: 18,
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 8,
    alignSelf: 'center',
  },
  ctaText: {
    ...playfairBoldStyle,
    color: theme.colors.white,
    fontSize: 26,
    letterSpacing: -0.4,
  },
  ctaButtonDisabled: {
    backgroundColor: '#EAEAEA',
    shadowOpacity: 0,
    elevation: 0,
  },
  ctaTextDisabled: {
    color: '#A8A8A8',
  },
  truckContainer: {
    position: 'absolute',
    zIndex: 1,
  },
  introTruck: {
    width: '100%',
    height: '100%',
  },
  pointsListContainer: {
    marginTop: 10,
    flex: 1,
    zIndex: 10,
  },
  pointRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    maxWidth: '65%',
  },
  pointDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.primary,
    marginTop: 8,
    marginRight: 12,
  },
  pointTextContainer: {
    flex: 1,
  },
  pointTitle: {
    ...playfairBoldStyle,
    fontSize: 18,
    color: '#000000',
    marginBottom: 4,
  },
  pointDesc: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    fontWeight: '400',
  },
});
