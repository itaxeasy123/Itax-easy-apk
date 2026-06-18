import { View, Text } from "react-native";

export default function SettingsScreen() {
  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 22 }}>Settings ⚙️</Text>
      <Text>Notifications</Text>
      <Text>Privacy</Text>
    </View>
  );
}