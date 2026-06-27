/**
 * Config plugin: limit which CPU architectures (ABIs) the Android build packages.
 *
 * The default Expo/RN build ships a "universal" APK with all four ABIs
 * (armeabi-v7a, arm64-v8a, x86, x86_64). x86/x86_64 are emulator-only and
 * arm64-v8a covers every phone from ~2017 on, so trimming to arm64-v8a cuts
 * the APK by ~75 MB with no impact on real modern devices.
 *
 * Set via app.json:
 *   ["./plugins/withReactNativeArchitectures", { "architectures": "arm64-v8a" }]
 *
 * To support old 32-bit phones too, use "armeabi-v7a,arm64-v8a".
 * Prebuild regenerates android/gradle.properties each build, so doing this as a
 * config plugin keeps the setting sticky.
 */
const { withGradleProperties } = require('@expo/config-plugins');

module.exports = function withReactNativeArchitectures(config, props = {}) {
  const architectures = props.architectures || 'arm64-v8a';
  const KEY = 'reactNativeArchitectures';

  return withGradleProperties(config, (cfg) => {
    const items = cfg.modResults;
    const existing = items.find((i) => i.type === 'property' && i.key === KEY);
    if (existing) {
      existing.value = architectures;
    } else {
      items.push({ type: 'property', key: KEY, value: architectures });
    }
    return cfg;
  });
};
