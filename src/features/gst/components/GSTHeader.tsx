import React from "react";
import {
  View,
  Text,
  StyleSheet,
} from "react-native";

import theme from "../theme";

export default function GSTHeroCard() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Welcome to GSTR
      </Text>
      <Text style={styles.subTitle}>
        Discover the World of GSTR
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginBottom: 28,
  },

  title: {
    fontSize: 38,
    fontWeight: "800",
    color: theme.colors.primary,
  },

  subTitle: {
    marginTop: 8,
    color: "#666",
    fontSize: 15,
  },
});