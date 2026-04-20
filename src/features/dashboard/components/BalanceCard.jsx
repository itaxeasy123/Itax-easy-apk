import { View, Text } from "react-native";

export default function BalanceCard({ balance }) {
  return (
    <View style={{
      backgroundColor: "#fff",
      margin: 20,
      padding: 20,
      borderRadius: 15,
      elevation: 5
    }}>
      <Text>Total Balance</Text>
      <Text style={{ fontSize: 24, fontWeight: "bold" }}>
        ₹{balance}
      </Text>
    </View>
  );
}