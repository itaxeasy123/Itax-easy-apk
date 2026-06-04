import { Ionicons } from "@expo/vector-icons";
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

import GSTBottomBar from "../components/GSTBottomBar";

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

export default function GSTR3B311DetailScreen() {
  const params = useLocalSearchParams();

  const rowId = Number(params.rowId || 1);

  const [rows, setRows] = useState(getRowsById(rowId));

  const STORAGE_KEY = `GSTR3B311_${rowId}`;

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

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons
            name="chevron-back"
            size={22}
            color="#FFF"
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          GSTR 3B- 3.1.1
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 130,
        }}
      >
        <View style={styles.titleContainer}>
          <Text style={styles.title}>
            {params.title}
          </Text>
        </View>

        {/* Table */}

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <View style={styles.srColumn}>
              <Text style={styles.headerText}>Sr.</Text>
            </View>

            <View style={styles.supplyColumn}>
              <Text style={styles.headerText}>
                Supplies
              </Text>
            </View>

            <View style={styles.valueColumn}>
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
    height: 50,
    backgroundColor: "#3574E2",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },

  headerTitle: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 8,
  },

  titleContainer: {
    padding: 16,
  },

  title: {
    color: "#3574E2",
    fontSize: 14,
    lineHeight: 20,
  },

  table: {
    marginHorizontal: 10,
    borderWidth: 1,
    borderColor: "#4A86F7",
    backgroundColor: "#FFF",
  },

  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#4A86F7",
    height: 42,
  },

  headerText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "500",
  },

  srColumn: {
    width: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRightWidth: 1,
    borderStyle: "dashed",
    borderColor: "#7AA0F8",
  },

  supplyColumn: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 10,
    borderRightWidth: 1,
    borderStyle: "dashed",
    borderColor: "#7AA0F8",
  },

  valueColumn: {
    width: 100,
    justifyContent: "center",
    alignItems: "center",
  },

  row: {
    flexDirection: "row",
    minHeight: 54,
    borderTopWidth: 1,
    borderStyle: "dashed",
    borderColor: "#4A86F7",
  },

  rowText: {
    fontSize: 12,
    color: "#333",
  },

  input: {
    width: 80,
    height: 34,
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 4,
    paddingHorizontal: 8,
    fontSize: 12,
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
    fontWeight: "600",
    fontSize: 14,
  },
});
