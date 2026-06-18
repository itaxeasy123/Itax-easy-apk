import React, { useState } from "react";

import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  Pressable,
  StyleSheet,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import theme from "../theme";

import { fontSizes, fontWeights } from "../../../theme/typography";
interface Props {
  label: string;
  value: string;
  options: string[];
  onSelect: (value: string) => void;
}

export default function GSTSelectField({
  label,
  value,
  options,
  onSelect,
}: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <TouchableOpacity
        style={styles.container}
        onPress={() => setVisible(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.text}>
          {value || label}
        </Text>

        <Ionicons
          name="chevron-down"
          size={22}
          color="#667085"
        />
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="slide"
      >
        <Pressable
          style={styles.overlay}
          onPress={() => setVisible(false)}
        >
          <View style={styles.modal}>
            <FlatList
              data={options}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.option}
                  onPress={() => {
                    onSelect(item);
                    setVisible(false);
                  }}
                >
                  <Text style={styles.optionText}>
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 58,
    borderWidth: 1,
    borderColor: "#D0D5DD",
    borderRadius: 18,
    backgroundColor: "#FFF",
    paddingHorizontal: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  text: {
    fontSize: fontSizes.xl,
    color: "#667085",
    fontWeight: fontWeights.medium,
  },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },

  modal: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: "55%",
  },

  option: {
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderColor: "#EEE",
  },

  optionText: {
    fontSize: fontSizes.xl,
    color: "#111827",
  },
});
