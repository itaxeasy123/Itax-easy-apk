import React from "react";
import { View, Text } from "react-native";

export default function InstallmentTable({ installments }: any) {
  if (!installments) return null;

  return (
    <View style={{ marginTop: 20 }}>
      <Text>📅 Advance Tax Installments</Text>
      <Text>June (15%): ₹{installments.june}</Text>
      <Text>September (45%): ₹{installments.september}</Text>
      <Text>December (75%): ₹{installments.december}</Text>
      <Text>March (100%): ₹{installments.march}</Text>
    </View>
  );
}