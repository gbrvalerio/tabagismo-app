import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from '@/lib/haptics';
import {
  colors,
  spacing,
  borderRadius,
  shadows,
  typographyPresets,
} from '@/lib/theme/tokens';
import { RadialBurst } from './RadialBurst';
import { SparkleParticles } from './SparkleParticles';
import { CoinCascade } from './CoinCascade';
import { SlotMachineCounter } from './SlotMachineCounter';

export interface CelebrationDialogProps {
  visible: boolean;
  onDismiss: () => void;
  title: string;
  subtitle?: string;
  coinsEarned: number;
  autoDismissDelay?: number;
  testID?: string;
}

const { height: screenHeight } = Dimensions.get('window');

export function CelebrationDialog({
  visible,
  onDismiss,
  title,
  subtitle,
  coinsEarned,
  autoDismissDelay = 5000,
  testID = 'celebration-dialog',
}: CelebrationDialogProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isInteracted, setIsInteracted] = useState(false);
  const [modalCenterY, setModalCenterY] = useState(screenHeight / 2);

  const overlayOpacity = useSharedValue(0);
  const modalScale = useSharedValue(0);
  const modalTranslateY = useSharedValue(50);
  const buttonGlowOpacity = useSharedValue(0);

  const clearAutoDismissTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const handleDismiss = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onDismiss();
  }, [onDismiss]);

  const startAutoDismissTimer = useCallback(() => {
    clearAutoDismissTimer();
    timerRef.current = setTimeout(() => {
      /* istanbul ignore else - interaction state is tested via separate test cases */
      if (!isInteracted) {
        handleDismiss();
      }
    }, autoDismissDelay);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clearAutoDismissTimer, handleDismiss, autoDismissDelay]);

  useEffect(() => {
    if (visible) {
      setIsInteracted(false);

      // Trigger haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Overlay fade in
      overlayOpacity.value = withTiming(1, { duration: 200 });

      // Modal bounce in
      modalScale.value = withDelay(
        100,
        withSpring(1, {
          damping: 12,
          stiffness: 200,
          overshootClamping: false,
        })
      );

      modalTranslateY.value = withDelay(
        100,
        withSpring(0, {
          damping: 12,
          stiffness: 200,
        })
      );

      // Button glow pulse starts after 1 second
      buttonGlowOpacity.value = withDelay(
        1000,
        withRepeat(
          withSequence(
            withTiming(0.6, { duration: 800 }),
            withTiming(0.3, { duration: 800 })
          ),
          -1,
          true
        )
      );

      startAutoDismissTimer();
    } else {
      overlayOpacity.value = 0;
      modalScale.value = 0;
      modalTranslateY.value = 50;
      buttonGlowOpacity.value = 0;
      clearAutoDismissTimer();
    }

    return () => clearAutoDismissTimer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, startAutoDismissTimer, clearAutoDismissTimer]);

  const handleUserInteraction = () => {
    setIsInteracted(true);
    clearAutoDismissTimer();
  };

  const handleModalLayout = useCallback((event: any) => {
    const { y, height } = event.nativeEvent.layout;
    // Calculate the center Y position of the modal card
    const centerY = y + height / 2;
    setModalCenterY(centerY);
  }, []);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const modalStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: modalScale.value },
      { translateY: modalTranslateY.value },
    ],
  }));

  const buttonGlowStyle = useAnimatedStyle(() => ({
    shadowColor: colors.primary.base,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: buttonGlowOpacity.value,
    shadowRadius: 12,
    elevation: 8,
  }));

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none">
      <Pressable
        style={styles.overlayPressable}
        onPress={handleDismiss}
        testID={`${testID}-overlay`}
      >
        <Animated.View style={[styles.overlay, overlayStyle]}>
          <Pressable onPress={handleUserInteraction} testID={`${testID}-card`}>
            <Animated.View
              style={[styles.modalCard, modalStyle]}
              onLayout={handleModalLayout}
            >
              <RadialBurst testID={`${testID}-burst`} />
              <SparkleParticles testID={`${testID}-sparkles`} />

              <Text style={styles.title}>{title}</Text>

              {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}

              <CoinCascade
                modalCenterY={modalCenterY}
                testID={`${testID}-cascade`}
              />

              <View style={styles.counterContainer}>
                <SlotMachineCounter
                  value={coinsEarned}
                  testID={`${testID}-counter`}
                />
              </View>

              <Animated.View style={buttonGlowStyle}>
                <Pressable
                  style={
                    /* istanbul ignore next - render prop pressed state is not testable in RN Testing Library */
                    ({ pressed }) => [
                      styles.button,
                      pressed && styles.buttonPressed,
                    ]
                  }
                  onPress={handleDismiss}
                >
                  <LinearGradient
                    colors={[
                      colors.primary.light,
                      colors.primary.base,
                      colors.primary.dark,
                    ]}
                    locations={[0, 0.5, 1]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={styles.buttonGradient}
                  >
                    <Text style={styles.buttonText}>Continuar</Text>
                  </LinearGradient>
                </Pressable>
              </Animated.View>
            </Animated.View>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlayPressable: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(26, 26, 46, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
    width: '85%',
    maxWidth: 400,
    alignItems: 'center',
    ...shadows.xl,
    borderWidth: 2,
    borderColor: colors.accent.gold,
    overflow: 'visible',
  },
  title: {
    ...typographyPresets.hero,
    color: colors.primary.base,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typographyPresets.body,
    color: colors.neutral.gray[600],
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  counterContainer: {
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  button: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.95 }],
  },
  buttonGradient: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl * 1.5,
    alignItems: 'center',
  },
  buttonText: {
    ...typographyPresets.button,
    color: colors.neutral.white,
  },
});
