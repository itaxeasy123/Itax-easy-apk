import { View, TextInput, StyleSheet } from "react-native";

export default function TaxInputForm({ state, setState }: any) {
  return (
    <View>
      <TextInput
        placeholder="Salary"
        placeholderTextColor="#aaa"
        keyboardType="numeric"
        style={styles.input}
        onChangeText={(v) =>
          setState({ ...state, salary: Number(v) })
        }
      />

      <TextInput
        placeholder="Other Income"
        placeholderTextColor="#aaa"
        keyboardType="numeric"
        style={styles.input}
        onChangeText={(v) =>
          setState({ ...state, otherIncome: Number(v) })
        }
      />

      <TextInput
        placeholder="Deductions"
        placeholderTextColor="#aaa"
        keyboardType="numeric"
        style={styles.input}
        onChangeText={(v) =>
          setState({ ...state, deductions: Number(v) })
        }
      />

      <TextInput
        placeholder="TDS"
        placeholderTextColor="#aaa"
        keyboardType="numeric"
        style={styles.input}
        onChangeText={(v) =>
          setState({ ...state, tds: Number(v) })
        }
      />

      <TextInput
        placeholder="Advance Tax"
        placeholderTextColor="#aaa"
        keyboardType="numeric"
        style={styles.input}
        onChangeText={(v) =>
          setState({ ...state, advanceTax: Number(v) })
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: "#18181b",
    color: "#fff",
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#27272a",
  },
});