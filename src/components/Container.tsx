import { View, StyleSheet, ViewProps } from "react-native";

export default function Container({ children, style }: ViewProps) {
  return <View style={[styles.container, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});