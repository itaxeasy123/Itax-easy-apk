import { View, Text } from "react-native";

export default function ComparisonCard({ result }: any) {
  return (
    <View
      style={{
        marginTop: 20,
        padding: 16,
        borderRadius: 12,
        backgroundColor: "#111827",
      }}
    >
      <Text style={{ color: "#fff", fontSize: 16 }}>
        🆚 Regime Comparison
      </Text>

      <Text style={{ color: "#22c55e" }}>
        Old: ₹{result.oldTax}
      </Text>

      <Text style={{ color: "#3b82f6" }}>
        New: ₹{result.newTax}
      </Text>

      <Text style={{ color: "#facc15" }}>
        Best: {result.bestRegime}
      </Text>
    </View>
  );
}