import { View, Text, StyleSheet } from "react-native";

// ✅ currency formatter
const formatCurrency = (num: number) =>
  `₹${Number(num || 0).toLocaleString("en-IN")}`;

export default function TaxResultView({ result }: any) {
  if (!result) return null;

  return (
    <View style={styles.card}>
      
      {/* ===== INCOME ===== */}
      <Text style={styles.sectionTitle}>Income Summary</Text>
      <Text style={styles.white}>
        Gross: {formatCurrency(result.grossIncome)}
      </Text>
      <Text style={styles.white}>
        Taxable: {formatCurrency(result.taxableIncome)}
      </Text>

      {/* ===== TAX ===== */}
      <Text style={styles.sectionTitle}>Tax Breakdown</Text>
      <Text style={styles.yellow}>
        Tax: {formatCurrency(result.tax)}
      </Text>
      <Text style={styles.green}>
        Rebate: {formatCurrency(result.rebate)}
      </Text>
      <Text style={styles.orange}>
        Surcharge: {formatCurrency(result.surcharge)}
      </Text>
      <Text style={styles.blue}>
        Cess: {formatCurrency(result.cess)}
      </Text>

      {/* ===== TOTAL ===== */}
      <Text style={styles.total}>
        Total Tax: {formatCurrency(result.totalTax)}
      </Text>

      {/* ===== PAYMENT ===== */}
      <Text style={styles.sectionTitle}>Payment</Text>
      <Text style={styles.green}>
        Paid: {formatCurrency(result.totalPaid)}
      </Text>

      {result.netPayable > 0 && (
        <Text style={styles.red}>
          Payable: {formatCurrency(result.netPayable)}
        </Text>
      )}

      {result.refund > 0 && (
        <Text style={styles.refund}>
          Refund: {formatCurrency(result.refund)}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#09090b",
    padding: 16,
    marginTop: 16,
    borderRadius: 16,
  },

  sectionTitle: {
    color: "#a1a1aa",
    marginTop: 10,
    marginBottom: 4,
    fontSize: 13,
  },

  white: { color: "#fff" },
  yellow: { color: "#facc15" },
  green: { color: "#4ade80" },
  orange: { color: "#fb923c" },
  blue: { color: "#60a5fa" },
  red: { color: "#f87171" },

  refund: {
    color: "#22c55e",
    fontWeight: "bold",
    marginTop: 4,
  },

  total: {
    color: "#fff",
    fontWeight: "bold",
    marginTop: 8,
    fontSize: 16,
  },
});