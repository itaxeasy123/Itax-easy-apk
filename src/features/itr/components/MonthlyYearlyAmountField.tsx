import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { itrShadows } from "../../../theme/itr";


export type Frequency = "Monthly" | "Yearly";

type MonthlyYearlyAmountFieldProps = {
  label: string;
  value: string;
  frequency: Frequency;
  onChangeValue: (value: string) => void;
  onChangeFrequency: (value: Frequency) => void;
  helper?: string;
};

export default function MonthlyYearlyAmountField({
  label,
  value,
  frequency,
  onChangeValue,
  onChangeFrequency,
  helper,
}: MonthlyYearlyAmountFieldProps) {
  const modeHint = frequency === "Monthly" ? "Enter monthly amount" : "Enter yearly amount";
  return (
    <View style={styles.block}>
      <Text style={styles.label}>{label}</Text>
      {helper ? <Text style={styles.helper}>{helper}</Text> : null}

      <TextInput
        value={value}
        keyboardType="numeric"
        onChangeText={onChangeValue}
        placeholder="0"
        placeholderTextColor="#9CA3AF"
        style={styles.input}
      />

      <View style={styles.toggleWrap}>
        {(["Monthly", "Yearly"] as Frequency[]).map((item) => {
          const active = frequency === item;
          return (
            <Pressable
              key={item}
              onPress={() => onChangeFrequency(item)}
              style={[styles.togglePill, active && styles.togglePillActive]}
            >
              <Text style={[styles.toggleText, active && styles.toggleTextActive]}>{item}</Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.modeHint}>{modeHint}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    marginBottom: 14,
  },
  helper: {
    color: "#546172",
    fontSize: 12.5,
    fontWeight: "500",
    marginBottom: 4,
    marginTop: 2,
  },
  label: {
    color: "#2B313B",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#fff",
    borderColor: "#CDD6E4",
    borderRadius: 4,
    borderWidth: 1,
    color: "#111827",
    fontSize: 14,
    height: 44,
    marginBottom: 10,
    paddingHorizontal: 10,
    paddingVertical: 0,
    ...itrShadows.card,
  },
  toggleWrap: {
    backgroundColor: "#ECECEC",
    borderColor: "#C9D2E0",
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    height: 28,
    overflow: "hidden",
    width: 170,
  },
  togglePill: {
    alignItems: "center",
    borderRadius: 999,
    flex: 1,
    justifyContent: "center",
    minHeight: 28,
  },
  togglePillActive: {
    backgroundColor: "#E7F0FF",
    borderColor: "#3A7BFF",
    borderWidth: 1,
  },
  toggleText: {
    color: "#5B6474",
    fontSize: 12,
    fontWeight: "600",
  },
  toggleTextActive: {
    color: "#2E6EFD",
  },
  modeHint: {
    color: "#6B7280",
    fontSize: 11.5,
    fontWeight: "500",
    marginTop: 6,
  },
});
