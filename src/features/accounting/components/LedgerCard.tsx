import { View, Text, StyleSheet } from "react-native";

export default function LedgerCard() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ledger Card</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 14,
  },
});
