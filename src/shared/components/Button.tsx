import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors, fontWeights, radius, spacing } from '../../theme';

export default function Button({ title, onPress }: any) {
  return (
    <TouchableOpacity style={styles.btn} onPress={onPress}>
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  text: {
    color: colors.white,
    fontWeight: fontWeights.semibold,
  },
});
