import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Animated,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Dimensions,
  PanResponder,
  Platform,
} from 'react-native';
import { X } from 'lucide-react-native';
import { theme } from '../../theme/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ReusableBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const ReusableBottomSheet = ({
  visible,
  onClose,
  title,
  children,
}: ReusableBottomSheetProps) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const sheetViewportHeightRef = useRef(SCREEN_HEIGHT);
  const [webFrameRect, setWebFrameRect] = useState<{
    left: number;
    top: number;
    width: number;
    height: number;
  } | null>(null);

  const isWeb = Platform.OS === 'web';

  useEffect(() => {
    if (!isWeb || !visible || typeof document === 'undefined') return;

    const updateFrameRect = () => {
      const frame = document.getElementById('asas-web-app-frame');
      const rect = frame?.getBoundingClientRect();
      if (!rect) {
        setWebFrameRect(null);
        return;
      }
      setWebFrameRect({
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
      });
    };

    updateFrameRect();
    window.addEventListener('resize', updateFrameRect);
    return () => window.removeEventListener('resize', updateFrameRect);
  }, [isWeb, visible]);

  useEffect(() => {
    if (visible) {
      if (isWeb) {
        animatedValue.setValue(1);
        return;
      }

      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, isWeb, animatedValue]);

  const sheetViewportHeight = isWeb && webFrameRect ? webFrameRect.height : SCREEN_HEIGHT;
  sheetViewportHeightRef.current = sheetViewportHeight;

  const handleClose = () => {
    if (isWeb) {
      onClose();
      return;
    }

    Animated.timing(animatedValue, {
      toValue: 0,
      duration: 220,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  const translateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [sheetViewportHeight * 0.8, 0],
  });

  const backdropOpacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.4],
  });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        if (gestureState.dy > 0) {
          animatedValue.setValue(1 - gestureState.dy / (sheetViewportHeightRef.current * 0.5));
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dy > 120) {
          handleClose();
        } else {
          Animated.spring(animatedValue, {
            toValue: 1,
            friction: 6,
            tension: 40,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const overlayStyle =
    isWeb && webFrameRect
      ? [
          styles.overlay,
          styles.webOverlayFrame,
          {
            left: webFrameRect.left,
            top: webFrameRect.top,
            width: webFrameRect.width,
            height: webFrameRect.height,
          },
        ]
      : styles.overlay;
  const backdropStyle = isWeb ? { opacity: visible ? 0.4 : 0 } : { opacity: backdropOpacity };
  const sheetMotionStyle = isWeb ? null : { transform: [{ translateY }] };

  if (isWeb && visible && !webFrameRect) {
    return null;
  }

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={overlayStyle}>
        {/* Backdrop */}
        <TouchableWithoutFeedback onPress={handleClose}>
          <Animated.View style={[styles.backdrop, backdropStyle]} />
        </TouchableWithoutFeedback>

        {/* Content Sheet */}
        <Animated.View
          style={[
            styles.sheet,
            { maxHeight: sheetViewportHeight * 0.85 },
            sheetMotionStyle,
          ]}
          {...panResponder.panHandlers}
        >
          {/* Top handle and drag indicator */}
          <View style={styles.header}>
            <View style={styles.dragHandle} />
            <View style={styles.titleRow}>
              <Text style={styles.title}>{title}</Text>
              <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
                <X size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Children container with absolute tap pass-through */}
          <TouchableWithoutFeedback>
            <View style={styles.body}>{children}</View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  webOverlayFrame: {
    position: 'absolute',
    flex: 0,
    overflow: 'hidden',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
  },
  sheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 24,
  },
  header: {
    alignItems: 'center',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  dragHandle: {
    width: 36,
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    marginVertical: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  closeBtn: {
    padding: 6,
    borderRadius: 999,
    backgroundColor: '#f3f4f6',
  },
  body: {
    padding: 20,
    paddingBottom: 40,
  },
});
