// Key/value storage backed by react-native-mmkv.
//
// MMKV is a custom native module (NitroModules) and is therefore NOT available
// in Expo Go. To allow live development on a device via Expo Go, we fall back
// to an in-memory store when the native module can't load. In real builds
// (dev-client / release APK) the native MMKV is used and data persists.

type KVStore = {
  set: (key: string, value: string | number | boolean) => void;
  getString: (key: string) => string | undefined;
  delete: (key: string) => void;
};

function createFallbackStore(): KVStore {
  // Non-persistent — fine for dev/live testing in Expo Go.
  const mem = new Map<string, string>();
  return {
    set: (key, value) => {
      mem.set(key, String(value));
    },
    getString: (key) => mem.get(key),
    delete: (key) => {
      mem.delete(key);
    },
  };
}

function createStore(): KVStore {
  try {
    // Loaded lazily so a missing native module throws here (caught below)
    // instead of crashing the whole app at import time (e.g. in Expo Go).
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createMMKV } = require('react-native-mmkv');
    return createMMKV({ id: 'itaxeasy-storage' }) as KVStore;
  } catch (error) {
    console.warn(
      '[mmkv] native module unavailable — using in-memory fallback (data will not persist):',
      error
    );
    return createFallbackStore();
  }
}

export const storage = createStore();
