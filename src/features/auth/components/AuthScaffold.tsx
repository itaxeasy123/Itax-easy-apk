import { Feather, FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type AuthScaffoldProps = {
  children: ReactNode;
  headerTitle?: string;
  onBackPress?: () => void;
  footer?: ReactNode;
};

function hexToRgb(hex: string) {
  const value = hex.replace('#', '');
  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16),
  };
}

function interpolateColor(start: string, end: string, progress: number) {
  const first = hexToRgb(start);
  const second = hexToRgb(end);
  const channel = (from: number, to: number) =>
    Math.round(from + (to - from) * progress);

  return `rgb(${channel(first.r, second.r)}, ${channel(first.g, second.g)}, ${channel(first.b, second.b)})`;
}

function GradientPanel() {
  return (
    <View style={StyleSheet.absoluteFillObject}>
      {Array.from({ length: 28 }, (_, index) => {
        const progress = index / 27;
        return (
          <View
            key={`gradient-${index}`}
            style={{
              backgroundColor: interpolateColor('#4480DF', '#4FD0BA', progress),
              flex: 1,
            }}
          />
        );
      })}
    </View>
  );
}

export function AuthIllustration() {
  return (
    <View style={illustrationStyles.wrapper}>
      <View style={illustrationStyles.circle} />

      <View style={illustrationStyles.phone}>
        <View style={illustrationStyles.camera} />
        <MaterialIcons color="#2C76DD" name="verified-user" size={30} />
        <Text style={illustrationStyles.phoneText}>Login</Text>
      </View>

      <View style={illustrationStyles.person}>
        <View style={illustrationStyles.head} />
        <View style={illustrationStyles.body} />
        <View style={illustrationStyles.legLeft} />
        <View style={illustrationStyles.legRight} />
      </View>

      <View style={illustrationStyles.plant}>
        <View style={illustrationStyles.plantStem} />
        <View style={illustrationStyles.plantLeafLeft} />
        <View style={illustrationStyles.plantLeafRight} />
      </View>

      <View style={illustrationStyles.mail}>
        <Feather color="#7E8DAA" name="mail" size={15} />
      </View>
    </View>
  );
}

export function SignupIllustration() {
  return (
    <View style={illustrationStyles.wrapper}>
      <View style={[illustrationStyles.circle, illustrationStyles.signupCircle]} />

      <View style={[illustrationStyles.phone, illustrationStyles.signupPhone]}>
        <View style={illustrationStyles.camera} />
        <MaterialIcons color="#2C76DD" name="person-add-alt-1" size={26} />
        <Text style={illustrationStyles.phoneText}>Sign up</Text>
      </View>

      <View style={illustrationStyles.signupPerson}>
        <View style={illustrationStyles.signupHead} />
        <View style={illustrationStyles.signupBody} />
        <View style={illustrationStyles.signupArm} />
        <View style={illustrationStyles.signupLegLeft} />
        <View style={illustrationStyles.signupLegRight} />
      </View>

      <View style={[illustrationStyles.mail, illustrationStyles.signupMail]}>
        <Feather color="#7E8DAA" name="file-text" size={14} />
      </View>

      <View style={illustrationStyles.signupBadge}>
        <Feather color="#FFFFFF" name="check" size={12} />
      </View>
    </View>
  );
}

export function PrimaryButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.primaryButton}>
      <Text style={styles.primaryButtonText}>{label}</Text>
    </Pressable>
  );
}

export function SocialButtons() {
  return (
    <View style={socialStyles.row}>
      <Pressable style={socialStyles.button}>
        <FontAwesome color="#EA4335" name="google" size={22} />
      </Pressable>
      <Pressable style={socialStyles.button}>
        <FontAwesome color="#244B99" name="facebook-official" size={22} />
      </Pressable>
    </View>
  );
}

export default function AuthScaffold({
  children,
  headerTitle,
  onBackPress,
  footer,
}: AuthScaffoldProps) {
  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <GradientPanel />
        <SafeAreaView edges={['top']} style={styles.safeArea}>
          <View style={styles.headerRow}>
            {onBackPress ? (
              <Pressable
                accessibilityRole="button"
                hitSlop={10}
                onPress={onBackPress}
                style={styles.backButton}
              >
                <Feather color="#FFFFFF" name="chevron-left" size={18} />
              </Pressable>
            ) : null}
            {headerTitle ? <Text style={styles.headerTitle}>{headerTitle}</Text> : null}
          </View>
        </SafeAreaView>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
        style={styles.keyboardWrap}
      >
        <View style={styles.sheetWrap}>
          <View style={styles.sheet}>
            <ScrollView
              bounces={false}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {children}
              {footer}
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: '#FFFFFF',
    flex: 1,
  },
  header: {
    height: 92,
    overflow: 'hidden',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 14,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    paddingTop: 16,
  },
  backButton: {
    marginLeft: 2,
    marginTop: 5,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    marginTop: 5,
  },
  keyboardWrap: {
    flex: 1,
  },
  sheetWrap: {
    flex: 1,
    marginTop: -14,
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    flex: 1,
    overflow: 'hidden',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 16,
    paddingHorizontal: 14,
    paddingTop: 18,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#3D7BE0',
    borderRadius: 10,
    height: 40,
    justifyContent: 'center',
    marginTop: 14,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});

const illustrationStyles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    height: 136,
    justifyContent: 'center',
    marginBottom: 8,
    position: 'relative',
    width: '100%',
  },
  circle: {
    backgroundColor: '#EDF3FF',
    borderRadius: 60,
    height: 118,
    position: 'absolute',
    left: '50%',
    top: 9,
    transform: [{ translateX: -59 }],
    width: 118,
  },
  phone: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#99A8C6',
    borderRadius: 14,
    borderWidth: 2,
    height: 84,
    justifyContent: 'center',
    position: 'absolute',
    left: '50%',
    top: 22,
    transform: [{ translateX: -65 }],
    width: 46,
  },
  camera: {
    backgroundColor: '#D7E0F1',
    borderRadius: 2,
    height: 4,
    position: 'absolute',
    top: 7,
    width: 16,
  },
  phoneText: {
    color: '#7987A3',
    fontSize: 10,
    marginTop: 3,
  },
  signupCircle: {
    height: 112,
    width: 112,
    transform: [{ translateX: -56 }],
  },
  signupPhone: {
    left: '50%',
    top: 26,
    transform: [{ translateX: -59 }],
  },
  person: {
    height: 70,
    position: 'absolute',
    left: '50%',
    top: 68,
    transform: [{ translateX: -30 }],
    width: 62,
  },
  signupPerson: {
    height: 66,
    position: 'absolute',
    left: '50%',
    top: 58,
    transform: [{ translateX: -26 }],
    width: 52,
  },
  head: {
    backgroundColor: '#2F3551',
    borderRadius: 9,
    height: 18,
    left: 19,
    position: 'absolute',
    width: 18,
  },
  signupHead: {
    backgroundColor: '#2F3551',
    borderRadius: 8,
    height: 16,
    left: 10,
    position: 'absolute',
    top: 2,
    width: 16,
  },
  body: {
    backgroundColor: '#5F8EF1',
    borderRadius: 18,
    height: 28,
    left: 14,
    position: 'absolute',
    top: 15,
    transform: [{ rotate: '-10deg' }],
    width: 34,
  },
  signupBody: {
    backgroundColor: '#6D93EE',
    borderRadius: 16,
    height: 24,
    left: 5,
    position: 'absolute',
    top: 16,
    width: 28,
  },
  signupArm: {
    backgroundColor: '#6D93EE',
    borderRadius: 4,
    height: 8,
    left: 28,
    position: 'absolute',
    top: 20,
    transform: [{ rotate: '-28deg' }],
    width: 18,
  },
  legLeft: {
    backgroundColor: '#2B3459',
    borderRadius: 5,
    height: 24,
    left: 17,
    position: 'absolute',
    top: 39,
    transform: [{ rotate: '18deg' }],
    width: 8,
  },
  signupLegLeft: {
    backgroundColor: '#2B3459',
    borderRadius: 4,
    height: 23,
    left: 10,
    position: 'absolute',
    top: 36,
    transform: [{ rotate: '12deg' }],
    width: 7,
  },
  legRight: {
    backgroundColor: '#2B3459',
    borderRadius: 5,
    height: 28,
    left: 37,
    position: 'absolute',
    top: 37,
    transform: [{ rotate: '-18deg' }],
    width: 8,
  },
  signupLegRight: {
    backgroundColor: '#2B3459',
    borderRadius: 4,
    height: 25,
    left: 26,
    position: 'absolute',
    top: 35,
    transform: [{ rotate: '-10deg' }],
    width: 7,
  },
  plant: {
    height: 56,
    position: 'absolute',
    left: '50%',
    top: 70,
    transform: [{ translateX: -86 }],
    width: 28,
  },
  plantStem: {
    backgroundColor: '#8AA6E9',
    height: 38,
    left: 13,
    position: 'absolute',
    top: 18,
    width: 2,
  },
  plantLeafLeft: {
    backgroundColor: '#C8D7FB',
    borderRadius: 14,
    height: 22,
    position: 'absolute',
    top: 20,
    transform: [{ rotate: '-35deg' }],
    width: 14,
  },
  plantLeafRight: {
    backgroundColor: '#9EB6F0',
    borderRadius: 14,
    height: 22,
    left: 14,
    position: 'absolute',
    top: 8,
    transform: [{ rotate: '25deg' }],
    width: 14,
  },
  mail: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    height: 28,
    justifyContent: 'center',
    position: 'absolute',
    left: '50%',
    top: 48,
    transform: [{ translateX: 54 }],
    width: 28,
  },
  signupMail: {
    left: '50%',
    top: 66,
    transform: [{ translateX: 44 }],
  },
  signupBadge: {
    alignItems: 'center',
    backgroundColor: '#5F8EF1',
    borderRadius: 12,
    height: 24,
    justifyContent: 'center',
    position: 'absolute',
    left: '50%',
    top: 44,
    transform: [{ translateX: -72 }],
    width: 24,
  },
});

const socialStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  button: {
    alignItems: 'center',
    borderColor: '#E2E8F2',
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    height: 42,
    justifyContent: 'center',
  },
});
