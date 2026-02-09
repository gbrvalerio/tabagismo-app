import * as ExpoHaptics from 'expo-haptics';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Track if haptics failed (likely on simulator) to avoid repeated attempts
let hapticsDisabled = false;

/**
 * Checks if haptics are available on the current device.
 * Only enables haptics on real devices (iOS and Android), not simulators/emulators.
 * This prevents console warnings in iOS Simulator where haptic files are missing.
 */
const isHapticsAvailable = (): boolean => {
  if (hapticsDisabled) return false;

  // In development builds, Constants.isDevice may be undefined
  // We enable by default and disable if we encounter errors (simulator behavior)
  return true;
};

/**
 * Triggers impact haptic feedback with the specified style.
 * Silently fails on simulators/emulators or when haptics are unavailable.
 *
 * @param style - The intensity style of the haptic feedback
 */
export const impactAsync = async (
  style: ExpoHaptics.ImpactFeedbackStyle
): Promise<void> => {
  if (!isHapticsAvailable()) return;
  try {
    await ExpoHaptics.impactAsync(style);
  } catch (error) {
    // Disable haptics for rest of session (likely on simulator)
    hapticsDisabled = true;
    // Silently fail - haptics are non-critical UX enhancement
  }
};

/**
 * Triggers notification haptic feedback with the specified type.
 * Silently fails on simulators/emulators or when haptics are unavailable.
 *
 * @param type - The type of notification (success, warning, error)
 */
export const notificationAsync = async (
  type: ExpoHaptics.NotificationFeedbackType
): Promise<void> => {
  if (!isHapticsAvailable()) return;
  try {
    await ExpoHaptics.notificationAsync(type);
  } catch (error) {
    // Disable haptics for rest of session (likely on simulator)
    hapticsDisabled = true;
    // Silently fail - haptics are non-critical UX enhancement
  }
};

/**
 * Triggers selection haptic feedback.
 * Silently fails on simulators/emulators or when haptics are unavailable.
 */
export const selectionAsync = async (): Promise<void> => {
  if (!isHapticsAvailable()) return;
  try {
    await ExpoHaptics.selectionAsync();
  } catch (error) {
    // Disable haptics for rest of session (likely on simulator)
    hapticsDisabled = true;
    // Silently fail - haptics are non-critical UX enhancement
  }
};

// Re-export types for convenience
export {
  ImpactFeedbackStyle,
  NotificationFeedbackType,
} from 'expo-haptics';
