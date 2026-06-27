import { Ionicons } from "@expo/vector-icons";
import GSTHeader from "../components/GSTHeader";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import GSTBottomBar from "../components/GSTBottomBar";;

import { fontSizes, fontWeights } from "../../../theme/typography";
type DetailRow = {
  id: number;
  label: string;
  value: string;
};

const getRowsById = (id: number): DetailRow[] => {
  return [
    { id: 1, label: "Integrated Tax (₹)", value: "0.0" },
    { id: 2, label: "Central Tax (₹)", value: "0.0" },
    { id: 3, label: "State/UT Tax (₹)", value: "0.0" },
    { id: 4, label: "CESS (₹)", value: "0.0" },
    { id: 5, label: "Total Taxable Value (₹)", value: "0.0" },
  ];
};

export default function GSTR3B4DetailScreen() {
  const params = useLocalSearchParams();

  const rowId = Number(params.rowId || 1);
  const title = (params.title as string) || "(A) ITC Available (whether in full or part)";
  const subtitle = (params.subtitle as string) || "(1) Import of Goods";

  const [rows, setRows] = useState(getRowsById(rowId));

  const STORAGE_KEY = `GSTR3B4_${rowId}`;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);

      if (saved) {
        setRows(JSON.parse(saved));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const updateValue = (index: number, value: string) => {
    const updated = [...rows];
    updated[index].value = value;
    setRows(updated);
  };

  const saveData = async () => {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(rows)
      );

      Alert.alert(
        "Success",
        "Record saved successfully."
      );
    } catch {
      Alert.alert(
        "Error",
        "Unable to save data."
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}

      <GSTHeader title="GSTR 3B - 4" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 130,
        }}
      >
        <View style={styles.titleContainer}>
          <Text style={styles.titleText}>
            {title}
          </Text>
          <Text style={styles.subtitleText}>
            {subtitle}
          </Text>
        </View>

        {/* Table */}

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <View style={styles.srColumnHeader}>
              <Text style={styles.headerText}>Sr.</Text>
            </View>

            <View style={styles.supplyColumnHeader}>
              <Text style={styles.headerText}>
                Supplies
              </Text>
            </View>

            <View style={styles.valueColumnHeader}>
              <Text style={styles.headerText}>
                Value
              </Text>
            </View>
          </View>

          {rows.map((item, index) => (
            <View
              key={item.id}
              style={styles.row}
            >
              <View style={styles.srColumn}>
                <Text style={styles.rowText}>
                  {item.id}.
                </Text>
              </View>

              <View style={styles.supplyColumn}>
                <Text style={styles.rowText}>
                  {item.label}
                </Text>
              </View>

              <View style={styles.valueColumn}>
                <TextInput
                  value={item.value}
                  keyboardType="decimal-pad"
                  style={styles.input}
                  onChangeText={(text) =>
                    updateValue(index, text)
                  }
                />
              </View>
            </View>
          ))}
        </View>

        {/* Buttons */}

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.editBtn}
          >
            <Text style={styles.btnText}>
              Edit
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.saveBtn}
            onPress={saveData}
          >
            <Text style={styles.btnText}>
              Save
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <GSTBottomBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F4F4",
  },

  header: {
    height: 54,
    backgroundColor: "#3574E2",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },

  headerTitle: {
    color: "#FFF",
    fontSize: fontSizes.md,
    fontWeight: fontWeights.medium,
    marginLeft: 8,
  },

  titleContainer: {
    padding: 16,
    gap: 12,
  },

  titleText: {
    color: "#333",
    fontSize: fontSizes.md,
    fontWeight: fontWeights.medium,
  },

  subtitleText: {
    color: "#4A86F7",
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
  },

  table: {
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: "#A9A9A9",
    backgroundColor: "#FFF",
  },

  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#4A86F7",
    height: 48,
  },

  headerText: {
    color: "#FFF",
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
  },

  srColumnHeader: {
    width: 45,
    justifyContent: "center",
    alignItems: "center",
    borderRightWidth: 1,
    borderColor: "#FFF",
  },
  
  srColumn: {
    width: 45,
    justifyContent: "center",
    alignItems: "center",
    borderRightWidth: 1,
    borderColor: "#A9A9A9",
  },

  supplyColumnHeader: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 12,
    borderRightWidth: 1,
    borderColor: "#FFF",
  },
  
  supplyColumn: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 12,
    borderRightWidth: 1,
    borderColor: "#A9A9A9",
  },

  valueColumnHeader: {
    width: 110,
    justifyContent: "center",
    alignItems: "center",
  },

  valueColumn: {
    width: 110,
    justifyContent: "center",
    alignItems: "center",
  },

  row: {
    flexDirection: "row",
    minHeight: 62,
    borderTopWidth: 1,
    borderColor: "#A9A9A9",
  },

  rowText: {
    fontSize: fontSizes.sm,
    color: "#333",
  },

  input: {
    width: 90,
    height: 38,
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 4,
    paddingHorizontal: 8,
    fontSize: fontSizes.sm,
    backgroundColor: "#FFF",
  },

  buttonRow: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 24,
    gap: 16,
  },

  editBtn: {
    flex: 1,
    height: 44,
    backgroundColor: "#EF4444",
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },

  saveBtn: {
    flex: 1,
    height: 44,
    backgroundColor: "#56C63D",
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },

  btnText: {
    color: "#FFF",
    fontWeight: fontWeights.semibold,
    fontSize: fontSizes.md,
  },
});
