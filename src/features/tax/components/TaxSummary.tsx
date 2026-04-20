
import React from "react";
import { View, Text } from "react-native";

// ==========================
// 💰 FORMATTER
// ==========================
const formatCurrency = (num: number) =>
  `₹${num.toLocaleString("en-IN")}`;

// ==========================
// 📊 MAIN COMPONENT
// ==========================
export default function TaxSummary({ result }: any) {
  if (!result) return null;

  const totalPaid = (result.tds || 0) + (result.advancePaid || 0);

  return (
    <View>
      {/* HEADER */}
      <Text
        style={{
          fontSize: 16,
          fontWeight: "bold",
          marginBottom: 10,
        }}
      >
        📊 Tax Summary
      </Text>

      {/* CARD */}
      <View
        style={{
          backgroundColor: "#f8fafc",
          borderRadius: 14,
          padding: 14,
        }}
      >
        {/* INCOME */}
        <Row label="Total Income" value={formatCurrency(result.totalIncome)} />
        <Row label="Taxable Income" value={formatCurrency(result.taxableIncome)} />

        {/* TAX */}
        <Row label="Income Tax" value={formatCurrency(result.tax)} />
        <Row
          label="Health & Education Cess (4%)"
          value={formatCurrency(result.cess)}
        />

        <Divider />

        {/* TOTAL */}
        <Row
          label="Total Tax Liability"
          value={formatCurrency(result.totalTax)}
          highlight
        />

        <Divider />

        {/* TAX PAID */}
        <Row
          label="TDS Paid"
          value={formatCurrency(result.tds || 0)}
        />

        <Row
          label="Advance Tax Paid"
          value={formatCurrency(result.advancePaid || 0)}
        />

        <Row
          label="Total Tax Paid"
          value={formatCurrency(totalPaid)}
        />

        <Divider />

        {/* NET PAYABLE / REFUND */}
        {result.refund > 0 ? (
          <Row
            label="💸 Refund"
            value={formatCurrency(result.refund)}
            big
            success
          />
        ) : (
          <Row
            label="Net Payable"
            value={formatCurrency(result.netPayable)}
            big
            danger={result.netPayable > 0}
            success={result.netPayable === 0}
          />
        )}
      </View>
    </View>
  );
}

// ==========================
// 🔹 ROW COMPONENT
// ==========================
const Row = ({
  label,
  value,
  highlight,
  big,
  success,
  danger,
}: any) => (
  <View
    style={{
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 10,
    }}
  >
    <Text
      style={{
        color: "#475569",
        fontWeight: highlight ? "bold" : "500",
      }}
    >
      {label}
    </Text>

    <Text
      style={{
        color: success
          ? "#10b981"
          : danger
          ? "#ef4444"
          : "#111",
        fontWeight: big ? "bold" : highlight ? "bold" : "600",
        fontSize: big ? 16 : 14,
      }}
    >
      {value}
    </Text>
  </View>
);

// ==========================
// 🔹 DIVIDER
// ==========================
const Divider = () => (
  <View
    style={{
      height: 1,
      backgroundColor: "#e5e7eb",
      marginVertical: 8,
    }}
  />
);