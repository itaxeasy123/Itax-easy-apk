import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function RegimeToggle({ regime, setRegime }: any) {
  return (
    <View style={styles.container}>
      {["old", "new"].map((r) => (
        <TouchableOpacity
          key={r}
          onPress={() => setRegime(r)}
          style={[
            styles.button,
            regime === r && styles.activeButton,
          ]}
        >
          <Text style={styles.text}>{r.toUpperCase()} REGIME</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    marginBottom: 16,
  },
  button: {
    flex: 1,
    padding: 12,
    marginHorizontal: 4,
    borderRadius: 12,
    backgroundColor: "#27272a",
  },
  activeButton: {
    backgroundColor: "#4f46e5",
  },
  text: {
    textAlign: "center",
    color: "#fff",
    fontWeight: "600",
  },
});