// Firebase Phone Auth wrapper.
//
// OTP send/verify happens 100% on-device via the Firebase Phone Auth SDK (free).
// The backend never sends or checks OTP codes — it only verifies the Firebase ID
// token we hand it after `confirmOtp` succeeds.
//
// Native module is loaded with a safe require (per CLAUDE.md) so the JS bundle
// doesn't crash in environments where the native module isn't compiled yet
// (e.g. plain `expo start` before a native rebuild, or on web).

import { Platform } from 'react-native';

let firebaseAuth: any = null;
// @react-native-firebase is NATIVE-only — it has no working web implementation
// (no google-services.json auto-init on web → "No Firebase App [DEFAULT]").
// So we only load it on Android/iOS; on web it stays unavailable.
if (Platform.OS !== 'web') {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    firebaseAuth = require('@react-native-firebase/auth').default;
  } catch (error) {
    console.warn(
      '[firebasePhone] @react-native-firebase/auth is not available. ' +
        'Rebuild the native app (npm run android) with google-services.json in place.',
      error
    );
  }
}

export function isFirebaseAvailable(): boolean {
  return typeof firebaseAuth === 'function';
}

function requireAuth() {
  if (!isFirebaseAvailable()) {
    throw new Error(
      'Phone verification is unavailable in this build. Please update the app.'
    );
  }
  return firebaseAuth();
}

// Normalize a raw Indian mobile number to E.164 (+91XXXXXXXXXX), which Firebase
// requires. Accepts inputs like "9876543210", "+91 98765 43210", "098765...".
export function toE164India(raw: string): string {
  const digits = (raw || '').replace(/\D/g, '');
  const last10 = digits.slice(-10);
  return `+91${last10}`;
}

export function isValidIndianMobile(raw: string): boolean {
  const digits = (raw || '').replace(/\D/g, '').slice(-10);
  // Indian mobile numbers start 6-9 and are 10 digits long.
  return /^[6-9]\d{9}$/.test(digits);
}

// In-memory holder for the active confirmation session. The Firebase
// `ConfirmationResult` can't be serialized into navigation params, so we keep it
// here between the phone screen (sendOtp) and the OTP screen (confirmOtp).
let pendingConfirmation: any = null;

export async function sendOtp(phoneE164: string): Promise<void> {
  const auth = requireAuth();
  pendingConfirmation = await auth.signInWithPhoneNumber(phoneE164);
}

export function hasPendingOtp(): boolean {
  return pendingConfirmation != null;
}

// Confirm the SMS code and return the Firebase ID token to send to our backend.
export async function confirmOtp(code: string): Promise<string> {
  if (!pendingConfirmation) {
    throw new Error('Your verification session expired. Please request a new OTP.');
  }
  const credential = await pendingConfirmation.confirm(code);
  const user = credential?.user ?? requireAuth().currentUser;
  if (!user) {
    throw new Error('Verification failed. Please try again.');
  }
  // force-refresh to be safe so the backend always gets a fresh, valid token
  return user.getIdToken(true);
}

export function clearOtpSession(): void {
  pendingConfirmation = null;
}

// Sign out of the device-side Firebase session (our own JWT is what we rely on
// afterwards; the Firebase session is only needed for the OTP exchange).
export async function firebaseSignOut(): Promise<void> {
  try {
    if (isFirebaseAvailable() && firebaseAuth().currentUser) {
      await firebaseAuth().signOut();
    }
  } catch {
    // best-effort
  }
  clearOtpSession();
}
