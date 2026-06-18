import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import AuthScaffold, { PrimaryButton } from '../components/AuthScaffold';

export default function OTPSuccessScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ mode?: string }>();
  const isResetFlow = params.mode === 'reset';

  return (
    <AuthScaffold
      headerTitle="Verification Successful"
      onBackPress={() => router.back()}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Verified</Text>
        <Text style={styles.subtitle}>
          {isResetFlow
            ? 'Your password has been updated successfully.'
            : 'Your account is verified successfully.'}
        </Text>

        <View style={styles.iconWrap}>
          <MaterialIcons color="#48C774" name="check-circle" size={52} />
        </View>

        <PrimaryButton
          label="Login"
          onPress={() => router.replace('/login')}
        />
      </View>
    </AuthScaffold>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    elevation: 3,
    boxShadow: '0px 6px 18px rgba(154, 169, 199, 0.12)',
    marginHorizontal: 8,
    marginTop: 86,
    padding: 18,
  },
  title: {
    color: '#1F2940',
    fontSize: 15,
    fontWeight: '700',
  },
  subtitle: {
    color: '#8E9AAF',
    fontSize: 10,
    lineHeight: 14,
    marginTop: 4,
  },
  iconWrap: {
    alignItems: 'center',
    marginVertical: 18,
  },
});
