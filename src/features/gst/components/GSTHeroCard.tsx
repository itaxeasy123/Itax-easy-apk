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
        Welcome to{" "}
        <Text style={styles.highlight}>
          GSTR
        </Text>
      </Text>

      <Text style={styles.subtitle}>
        Discover the World of GSTR
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginBottom: 30,
  },

  title: {
    fontSize: 34,
    fontWeight: "800",
    color: theme.colors.primary,
  },

highlight: {
  color: "#3D7BEA",
},

  subtitle: {
    marginTop: 8,
    fontSize: 14,
    color: "#666",
  },
});