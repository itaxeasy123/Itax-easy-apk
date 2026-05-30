import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useAuthStore } from '../src/store/authStore';

const { width } = Dimensions.get('window');

export default function IndexScreen() {
  const router = useRouter();

    // App start hote hi phone memory se purana token nikalne ke liye
  const loadAuth = useAuthStore((state) => state.loadAuth);
  const token = useAuthStore((state) => state.token);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  useEffect(() => {
    loadAuth(); // Auth data load karo
  }, [loadAuth]);

  // 🔥 TITLE (IMMEDIATE)
  const titleOpacity = useSharedValue(1); // 👈 already visible

  // ✨ LIGHT SWEEP
  const sweepX = useSharedValue(-width);

  // ✨ TEXT
  const text1Opacity = useSharedValue(0);
  const text2Opacity = useSharedValue(0);

  // 🌊 BACKGROUND MOTION
  const bgMove = useSharedValue(0);

  useEffect(() => {
    // ✨ Light sweep animation
    sweepX.value = withRepeat(
      withTiming(width, { duration: 2000 }),
      -1,
      false
    );

    // 🌊 Background subtle motion
    bgMove.value = withRepeat(
      withTiming(20, { duration: 4000 }),
      -1,
      true
    );

    // ⏱ TEXT SEQUENCE
  //   text1Opacity.value = withDelay(1000, withTiming(1, { duration: 500 }));
  //   text2Opacity.value = withDelay(2000, withTiming(1, { duration: 500 }));

  //   // 🚀 NAVIGATION
  //   const timer = setTimeout(() => {
  //     router.replace('/login');
  //   }, 4000);

  //   return () => clearTimeout(timer);
  // }, []);

      // ⏱ TEXT SEQUENCE
    text1Opacity.value = withDelay(1000, withTiming(1, { duration: 500 }));
    text2Opacity.value = withDelay(2000, withTiming(1, { duration: 500 }));
  }, []);

  // 🚀 NAVIGATION LOGIC
  useEffect(() => {
    // Jab tak phone memory se auth data load na ho jaye, tab tak wait karo
    if (!isHydrated) return;

    const timer = setTimeout(() => {
      if (token) {
        // Agar login session milta hai toh directly dashboard bhejo
        router.replace('/dashboard');
      } else {
        // Agar nahi milta hai toh wapas login par bhejo
        router.replace('/login');
      }
    }, 4000);

    return () => clearTimeout(timer);
  }, [isHydrated, token]);
console.log("Hydrated:", isHydrated, "| Token:", token);
  // 🎯 STYLES
  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
  }));

  const sweepStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: sweepX.value }],
  }));

  const bgStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bgMove.value }],
  }));

  return (
    <View style={[styles.container, { backgroundColor: '#4480DF' }]}>
      <StatusBar style="light" />

      {/* 🌈 BACKGROUND */}
      <Animated.View style={[
        StyleSheet.absoluteFillObject, 
        { top: -50, bottom: -50 }, 
        bgStyle
      ]}>
        <LinearGradient
          colors={['#4480DF', '#4FD0BA']}
          style={{ flex: 1 }}
        />
      </Animated.View>

      {/* 🔥 CONTENT */}
      <View style={styles.center}>
        {/* TITLE + LIGHT SWEEP */}
        <View style={{ overflow: 'hidden' }}>
          <Animated.Text style={[styles.title, titleStyle]}>
            TaxShax
          </Animated.Text>

          <Animated.View style={[styles.sweep, sweepStyle]} />
        </View>

        {/* TEXT 1 */}
        <Animated.Text style={[styles.subtitle, { opacity: text1Opacity }]}>
          Smart Tax Solutions
        </Animated.Text>

        {/* TEXT 2 */}
        <Animated.Text style={[styles.powered, { opacity: text2Opacity }]}>
          Powered by iTaxEasy
        </Animated.Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // 🔥 TITLE
  title: {
    fontSize: 25,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 4,
  },

  // ✨ TEXT
  subtitle: {
    color: '#fff',
    marginTop: 10,
    fontSize: 15,
    fontWeight: '600',
  },

  powered: {
    color: '#002B36',
    marginTop: 6,
    fontSize: 13,
    fontStyle: 'italic',
  },

  // ✨ LIGHT SWEEP
  sweep: {
    position: 'absolute',
    top: 0,
    width: 80,
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.3)',
    transform: [{ skewX: '-20deg' }],
  },
});
