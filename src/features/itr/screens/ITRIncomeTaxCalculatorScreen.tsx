import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { itrColors, itrShadows, itrSpacing } from "../../../theme/itr";
import { ITRBottomNav, ITRHeader } from "../components";

type OptionCardProps = {
  title: string;
  onPress?: () => void;
};

function OptionCard({ title, onPress }: OptionCardProps) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <Text style={styles.cardText}>{title}</Text>
    </Pressable>
  );
}

export default function ITRIncomeTaxCalculatorScreen() {
  const router = useRouter();

  return (
    <View style={styles.screen}>
      <ITRHeader title="Taxes Paid & TDS" titleVariant="plain" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <OptionCard
          title="Advance & Assessment Tax"
          onPress={() => router.navigate("/itr/advance-assessment-tax")}
        />
        <OptionCard title="TDS Details" onPress={() => router.navigate("/itr/tds-details")} />
        <OptionCard title="TDS Non Salary" onPress={() => router.navigate("/itr/tds-non-salary")} />
        <OptionCard title="TDS On Salary" onPress={() => router.navigate("/itr/tds-on-salary")} />
      </ScrollView>

      <ITRBottomNav activeRoute="/itr" />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: itrColors.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: itrSpacing.md + 2,
    paddingTop: itrSpacing.md,
    paddingBottom: 112,
  },
  card: {
    alignItems: "flex-start",
    backgroundColor: "#EAF1FF",
    borderColor: "#B8CCF0",
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: "center",
    marginBottom: itrSpacing.md,
    minHeight: 44,
    paddingHorizontal: itrSpacing.lg,
    paddingVertical: itrSpacing.sm,
    width: "100%",
    ...itrShadows.card,
  },
  cardText: {
    color: "#343B4A",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "left",
    width: "100%",
  },
});
