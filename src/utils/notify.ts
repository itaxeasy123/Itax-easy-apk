import { Alert, Platform, ToastAndroid } from 'react-native';

/**
 * Lightweight, non-blocking notification. Uses a native Android toast where
 * available (e.g. "OTP sent successfully"), and falls back to an Alert on iOS.
 */
export function notify(message: string) {
  if (!message) {
    return;
  }

  if (Platform.OS === 'android' && ToastAndroid) {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  } else {
    Alert.alert('', message);
  }
}
