import { StyleSheet, Text, View } from 'react-native';

type OTPInputProps = {
  value: string;
  length?: number;
};

export default function OTPInput({ value, length = 4 }: OTPInputProps) {
  const boxes = Array.from({ length }, (_, index) => value[index] ?? '');

  return (
    <View style={styles.row}>
      {boxes.map((digit, index) => (
        <View key={`otp-${index}`} style={styles.box}>
          <Text style={styles.digit}>{digit}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 6,
  },
  box: {
    alignItems: 'center',
    borderColor: '#C9D2E1',
    borderRadius: 4,
    borderWidth: 1,
    height: 28,
    justifyContent: 'center',
    width: 26,
  },
  digit: {
    color: '#20304B',
    fontSize: 13,
    fontWeight: '600',
  },
});
