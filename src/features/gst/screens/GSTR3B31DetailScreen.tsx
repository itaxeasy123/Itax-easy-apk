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
  switch (id) {
    case 1:
      return [
        { id: 1, label: "Integrated Tax (₹)", value: "0.0" },
        { id: 2, label: "Central Tax (₹)", value: "0.0" },
        { id: 3, label: "State/UT Tax (₹)", value: "0.0" },
        { id: 4, label: "CESS (₹)", value: "0.0" },
        { id: 5, label: "Total Taxable Value (₹)", value: "0.0" },
      ];

    case 2:
      return [
             { id: 1, label: "Integrated Tax (₹)", value: "0.0" },
        { id: 2, label: "Central Tax (₹)", value: "0.0" },
        { id: 3, label: "State/UT Tax (₹)", value: "0.0" },
        { id: 4, label: "CESS (₹)", value: "0.0" },
        { id: 5, label: "Total Taxable Value (₹)", value: "0.0" },
      ];

    case 3:
      return [
               { id: 1, label: "Integrated Tax (₹)", value: "0.0" },
        { id: 2, label: "Central Tax (₹)", value: "0.0" },
        { id: 3, label: "State/UT Tax (₹)", value: "0.0" },
        { id: 4, label: "CESS (₹)", value: "0.0" },
        { id: 5, label: "Total Taxable Value (₹)", value: "0.0" },
      ];
      case 4: 
      return [
        { id: 1, label: "Integrated Tax (₹)", value: "0.0" },
        { id: 2, label: "Central Tax (₹)", value: "0.0" },
        { id: 3, label: "State/UT Tax (₹)", value: "0.0" },
        { id: 4, label: "CESS (₹)", value: "0.0" },
        { id: 5, label: "Total Taxable Value (₹)", value: "0.0" },
      ];
    default:
      return [
        { id: 1, label: "Integrated Tax (₹)", value: "0.0" },
        { id: 2, label: "Central Tax (₹)", value: "0.0" },
        { id: 3, label: "State/UT Tax (₹)", value: "0.0" },
        { id: 4, label: "CESS (₹)", value: "0.0" },
        { id: 5, label: "Total Taxable Value (₹)", value: "0.0" },
      ];
  }
};

export default function GSTR3B31DetailScreen() {
  const params = useLocalSearchParams();

  const rowId = Number(params.rowId || 1);

  const [rows, setRows] = useState(getRowsById(rowId));

  const STORAGE_KEY = `GSTR3B31_${rowId}`;

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
          GSTR 3B - 3.1
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
                  {item.id}
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
    backgroundColor: "#4E82F6",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },

  headerTitle: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "600",
    marginLeft: 8,
  },

  titleContainer: {
    padding: 10,
  },

  title: {
    color: "#356EE8",
    fontSize: 12,
    lineHeight: 18,
  },

  table: {
    marginHorizontal: 10,
    borderWidth: 1,
    borderColor: "#D0D0D0",
    backgroundColor: "#FFF",
  },

  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#4E82F6",
    height: 38,
  },

  headerText: {
    color: "#FFF",
    fontSize: 11,
    fontWeight: "600",
  },

  srColumn: {
    width: 38,
    justifyContent: "center",
    alignItems: "center",
    borderRightWidth: 1,
    borderColor: "#7AA0F8",
  },

  supplyColumn: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 8,
    borderRightWidth: 1,
    borderColor: "#D0D0D0",
  },

  valueColumn: {
    width: 95,
    justifyContent: "center",
    alignItems: "center",
  },

  row: {
    flexDirection: "row",
    minHeight: 48,
    borderTopWidth: 1,
    borderColor: "#D0D0D0",
  },

  rowText: {
    fontSize: 11,
    color: "#333",
  },

  input: {
    width: 82,
    height: 32,
    borderWidth: 1,
    borderColor: "#C7C7C7",
    borderRadius: 2,
    paddingHorizontal: 6,
    fontSize: 11,
    backgroundColor: "#FFF",
  },

  buttonRow: {
    flexDirection: "row",
    marginHorizontal: 12,
    marginTop: 24,
    gap: 12,
  },

  editBtn: {
    flex: 1,
    height: 38,
    backgroundColor: "#F44336",
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
  },

  saveBtn: {
    flex: 1,
    height: 38,
    backgroundColor: "#56C63D",
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
  },

  btnText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 13,
  },
});