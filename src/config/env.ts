// Single source of truth for API base URLs.
// EXPO_PUBLIC_* vars are inlined by Expo at bundle time — restart Metro
// (`npx expo start -c`) after changing .env.

function requireEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Missing required env var ${name}. Set it in itaxeasy-app/.env and restart Metro with "npx expo start -c".`
    );
  }
  return value.replace(/\/+$/, '');
}

export const API_URL = requireEnv(
  'EXPO_PUBLIC_API_BASE_URL',
  process.env.EXPO_PUBLIC_API_BASE_URL
);

export const OCR_API_URL = requireEnv(
  'EXPO_PUBLIC_OCR_API_BASE_URL',
  process.env.EXPO_PUBLIC_OCR_API_BASE_URL
);

// New iTaxEasy APK backend (FastAPI, phone-OTP auth). Endpoints are mounted at
// `/api/...`, so this is the host root (no trailing /api).
export const APK_API_URL = requireEnv(
  'EXPO_PUBLIC_APK_API_BASE_URL',
  process.env.EXPO_PUBLIC_APK_API_BASE_URL
);
