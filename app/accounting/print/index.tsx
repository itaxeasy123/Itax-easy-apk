import { useRouter, type Href } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { AccountingHeader, Card } from "../../../src/features/accounting/components";

const items: Array<{
  title: string;
  route: Href;
  note: string;
}> = [
  { title: "Party Print", route: "/accounting/print/party", note: "Pass `id` in query params." },
  { title: "Invoice Print", route: "/accounting/print/invoice", note: "Pass `id` in query params." },
  { title: "Voucher Print", route: "/accounting/print/voucher", note: "Pass `id` in query params." },
  { title: "Receipt Print", route: "/accounting/print/receipt", note: "Pass `partyId`, `partyName`, `amount`." },
];

export default function AccountingPrintIndex() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <AccountingHeader title="Print Views" subtitle="A4 preview and PDF export." showBackButton />
      <ScrollView contentContainerStyle={styles.content}>
        {items.map((item) => (
          <Card key={item.title} style={styles.card}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.note}>{item.note}</Text>
            <Pressable style={styles.button} onPress={() => router.push(item.route)}>
              <Text style={styles.buttonText}>Open</Text>
            </Pressable>
          </Card>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F9FF" },
  content: { padding: 16, gap: 12 },
  card: { marginBottom: 0 },
  title: { fontSize: 16, fontWeight: "800", color: "#0F172A" },
  note: { fontSize: 12, color: "#64748B", marginTop: 4 },
  button: { marginTop: 12, alignSelf: "flex-start", backgroundColor: "#2563EB", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10 },
  buttonText: { color: "#fff", fontWeight: "800" },
});
