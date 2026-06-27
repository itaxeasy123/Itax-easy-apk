import { View, Text } from "react-native";

export default function ChartCard({ income, expense }) {
  return (
    <View style={{
      backgroundColor: "#fff",
      margin: 20,
      padding: 20,
      borderRadius: 15
    }}>
      <Text style={{ fontWeight: "bold", marginBottom: 10 }}>
        Overview
      </Text>

      <Text>Income: ₹{income}</Text>
      <Text>Expense: ₹{expense}</Text>
    </View>
  );
}