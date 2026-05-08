import { View, Text, StyleSheet } from "react-native";

export default function BillCard() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bill Card</Text>
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
