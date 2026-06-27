import React from "react";

import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from "react-native";

import theme from "../theme";

import { fontSizes, fontWeights } from "../../../theme/typography";
interface Props {
  title: string;
  onPress?: () => void;

  loading?: boolean;
  disabled?: boolean;

  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function GSTButton({
  title,
  onPress,

  loading = false,
  disabled = false,

  style,
  textStyle,
}: Props) {
  const isDisabled =
    disabled || loading;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={isDisabled}
      style={[
        styles.button,

        isDisabled &&
          styles.disabledButton,

        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color="#FFFFFF"
        />
      ) : (
        <Text
          style={[
            styles.text,
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 58,

    backgroundColor:
      theme.colors.primary,

    borderRadius: 18,

    alignItems: "center",
    justifyContent: "center",

    shadowColor: "#3D7BEA",

    shadowOpacity: 0.25,

    shadowRadius: 10,

    shadowOffset: {
      width: 0,
      height: 5,
    },

    elevation: 5,
  },

  disabledButton: {
    opacity: 0.6,
  },

  text: {
    color: "#FFFFFF",

    fontSize: fontSizes.xl,

    fontWeight: fontWeights.bold,

    letterSpacing: 0.3,
  },
});
