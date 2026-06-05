import React from "react";
import { StyleProp, ViewStyle } from "react-native";
import { Searchbar } from "react-native-paper";

interface CustomSearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  style?: StyleProp<ViewStyle>;
}

export default function CustomSearchBar({
  value,
  onChangeText,
  placeholder = "Search",
  style,
}: CustomSearchBarProps) {
  return (
    <Searchbar
      placeholder={placeholder}
      onChangeText={onChangeText}
      value={value}
      style={[
        {
          backgroundColor: "#ffffff",
          borderWidth: 1,
          borderColor: "#e5e7eb",
          elevation: 0,
          shadowOpacity: 0,
        },
        style,
      ]}
      placeholderTextColor="#999"
      iconColor="#666"
    />
  );
}
