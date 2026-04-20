import { TextInput, View } from "react-native";

export default function Input({
  value,
  onChangeText,
  ...props
}: any) {
  return (
    <View style={{ marginBottom: 12 }}>
      <TextInput
        value={value ?? ""} // 🔥 MUST
        onChangeText={onChangeText} // 🔥 MUST
        {...props}
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          padding: 12,
          borderRadius: 10,
        }}
      />
    </View>
  );
}