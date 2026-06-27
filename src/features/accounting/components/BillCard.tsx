import { View, Text, StyleSheet } from "react-native";
import { accountingTheme } from "../../../theme/accounting";

export default function BillCard() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bill Card</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: accountingTheme.spacing.lg,
  },
  title: {
    fontSize: accountingTheme.fontSizes.lg,
  },
});
