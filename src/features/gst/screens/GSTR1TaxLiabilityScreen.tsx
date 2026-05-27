import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  FlatList,
  Platform,
  ScrollView,
  Modal,
  Dimensions,
  KeyboardAvoidingView,
} from "react-native";

import { useRouter } from "expo-router";

import {
  Ionicons,
  MaterialIcons,
  Feather,
} from "@expo/vector-icons";

import GSTBottomBar from "../components/GSTBottomBar";

const { width, height } = Dimensions.get("window");

interface LiabilityItem {
  id: number;
  state: string;
  supplyType: string;
  cess: string;
}

const STATE_OPTIONS = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Punjab",
  "Rajasthan",
  "Tamil Nadu",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

const GSTR1TaxLiabilityScreen = () => {
  const router = useRouter();

  const [selectedState, setSelectedState] =
    useState("");

  const [supplyType, setSupplyType] =
    useState("");

  const [cess, setCess] = useState("");

  const [dropdownVisible, setDropdownVisible] =
    useState(false);

  const [records, setRecords] = useState<
    LiabilityItem[]
  >([]);

  const [editingId, setEditingId] =
    useState<number | null>(null);

  const resetFields = () => {
    setSelectedState("");
    setSupplyType("");
    setCess("");
  };

  const handleAddOrUpdate = () => {
    if (
      !selectedState ||
      !supplyType ||
      !cess
    ) {
      return;
    }

    if (editingId !== null) {
      setRecords((prev) =>
        prev.map((item) =>
          item.id === editingId
            ? {
                ...item,
                state: selectedState,
                supplyType,
                cess,
              }
            : item
        )
      );

      setEditingId(null);
    } else {
      const newItem: LiabilityItem = {
        id: Date.now(),
        state: selectedState,
        supplyType,
        cess,
      };

      setRecords((prev) => [
        ...prev,
        newItem,
      ]);
    }

    resetFields();
  };

  const handleEdit = (
    item: LiabilityItem
  ) => {
    setSelectedState(item.state);

    setSupplyType(item.supplyType);

    setCess(item.cess);

    setEditingId(item.id);
  };

  const handleDelete = (id: number) => {
    setRecords((prev) =>
      prev.filter((item) => item.id !== id)
    );

    if (editingId === id) {
      setEditingId(null);
      resetFields();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
        style={styles.container}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.8}
            onPress={() =>
              router.push("/gst/gstr1-records")
            }
          >
            <Ionicons
              name="chevron-back"
              size={20}
              color="#fff"
            />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>
            11A(1),11A(2) – Tax Liability
            {"\n"}
            (advances Received)
          </Text>
        </View>

        {/* BODY */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={
            styles.scrollContent
          }
        >
          <View style={styles.body}>
            <Text style={styles.title}>
              Outward and Reverse charge
              Inward
            </Text>

            <Text style={styles.srNo}>
              Sr. No 1
            </Text>

            {/* DROPDOWN */}
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.inputBox}
              onPress={() =>
                setDropdownVisible(true)
              }
            >
              <Text
                style={[
                  styles.inputText,
                  !selectedState && {
                    color: "#9b9b9b",
                  },
                ]}
              >
                {selectedState ||
                  "Select State"}
              </Text>

              <Ionicons
                name="chevron-down"
                size={18}
                color="#7d7d7d"
              />
            </TouchableOpacity>

            {/* INPUT */}
            <TextInput
              value={supplyType}
              onChangeText={
                setSupplyType
              }
              placeholder="Supply Type"
              placeholderTextColor="#9b9b9b"
              style={styles.inputBox}
            />

            {/* INPUT */}
            <TextInput
              value={cess}
              onChangeText={setCess}
              placeholder="Cess"
              placeholderTextColor="#9b9b9b"
              style={styles.inputBox}
            />

            {/* ACTION BUTTONS */}
            <View style={styles.actionRow}>
              {/* EDIT */}
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.actionButton}
                onPress={() => {
                  if (records.length > 0) {
                    handleEdit(
                      records[
                        records.length - 1
                      ]
                    );
                  }
                }}
              >
                <Feather
                  name="edit-2"
                  size={14}
                  color="#2962ff"
                />
              </TouchableOpacity>

              {/* DELETE */}
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.actionButton}
                onPress={() => {
                  if (records.length > 0) {
                    handleDelete(
                      records[
                        records.length - 1
                      ].id
                    );
                  }
                }}
              >
                <MaterialIcons
                  name="delete-outline"
                  size={18}
                  color="#ff3b30"
                />
              </TouchableOpacity>
            </View>

            {/* RECORDS */}
            <FlatList
              data={records}
              scrollEnabled={false}
              keyExtractor={(item) =>
                item.id.toString()
              }
              contentContainerStyle={{
                marginTop: 14,
              }}
              renderItem={({ item, index }) => (
                <View style={styles.recordCard}>
                  <View
                    style={
                      styles.recordHeader
                    }
                  >
                    <Text
                      style={
                        styles.recordTitle
                      }
                    >
                      Record {index + 1}
                    </Text>

                    <View
                      style={
                        styles.recordAction
                      }
                    >
                      <TouchableOpacity
                        onPress={() =>
                          handleEdit(item)
                        }
                      >
                        <Feather
                          name="edit"
                          size={15}
                          color="#2962ff"
                        />
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() =>
                          handleDelete(
                            item.id
                          )
                        }
                      >
                        <MaterialIcons
                          name="delete-outline"
                          size={18}
                          color="#ff3b30"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <Text
                    style={styles.recordText}
                  >
                    State : {item.state}
                  </Text>

                  <Text
                    style={styles.recordText}
                  >
                    Supply Type :{" "}
                    {item.supplyType}
                  </Text>

                  <Text
                    style={styles.recordText}
                  >
                    Cess : {item.cess}
                  </Text>
                </View>
              )}
            />
          </View>
        </ScrollView>

        {/* BUTTONS */}
        <View style={styles.bottomButtons}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.bottomButton}
            onPress={() =>
              router.push("/gst/gstr1-records")
            }
          >
            <Text style={styles.buttonText}>
              Back
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.bottomButton}
            onPress={handleAddOrUpdate}
          >
            <Text style={styles.buttonText}>
              {editingId !== null
                ? "Update"
                : "Add"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* DROPDOWN MODAL */}
        <Modal
          visible={dropdownVisible}
          transparent
          animationType="fade"
        >
          <TouchableOpacity
            activeOpacity={1}
            style={styles.modalOverlay}
            onPress={() =>
              setDropdownVisible(false)
            }
          >
            <View style={styles.dropdownBox}>
              <ScrollView
                showsVerticalScrollIndicator={
                  false
                }
              >
                {STATE_OPTIONS.map(
                  (item, index) => (
                    <TouchableOpacity
                      key={index}
                      activeOpacity={0.8}
                      style={
                        styles.dropdownItem
                      }
                      onPress={() => {
                        setSelectedState(
                          item
                        );

                        setDropdownVisible(
                          false
                        );
                      }}
                    >
                      <Text
                        style={
                          styles.dropdownText
                        }
                      >
                        {item}
                      </Text>
                    </TouchableOpacity>
                  )
                )}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* BOTTOM BAR */}
        <GSTBottomBar />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default GSTR1TaxLiabilityScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f3f3f3",
  },

  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },

  scrollContent: {
    paddingBottom: 220,
    flexGrow: 1,
  },

  /* HEADER */
  header: {
    backgroundColor: "#4B7BE5",

    flexDirection: "row",

    alignItems: "flex-start",

    paddingHorizontal: width * 0.04,

    paddingTop:
      Platform.OS === "android"
        ? height * 0.02
        : height * 0.015,

    paddingBottom: 22,
  },

  backButton: {
    marginTop: 2,
  },

  headerTitle: {
    color: "#fff",

    fontSize: width * 0.038,

    fontWeight: "600",

    marginLeft: 8,

    lineHeight: 20,
  },

  /* BODY */
  body: {
    paddingHorizontal: width * 0.04,
    paddingTop: 14,
  },

  title: {
    fontSize: width * 0.034,
    color: "#222",
    fontWeight: "500",
  },

  srNo: {
    marginTop: 12,
    marginBottom: 10,

    fontSize: width * 0.03,

    color: "#2962ff",

    fontWeight: "600",
  },

  /* SAME INPUTS */
  inputBox: {
    width: "100%",

    height: 46,

    borderWidth: 1,

    borderColor: "#cfd5df",

    borderRadius: 8,

    backgroundColor: "#fff",

    paddingHorizontal: 12,

    marginBottom: 12,

    fontSize: width * 0.033,

    color: "#222",

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",
  },

  inputText: {
    fontSize: width * 0.033,
    color: "#222",
  },

  /* ACTIONS */
  actionRow: {
    flexDirection: "row",

    alignItems: "center",

    gap: 12,

    marginTop: 6,
  },

  actionButton: {
    width: 34,
    height: 34,

    borderRadius: 100,

    backgroundColor: "#fff",

    justifyContent: "center",

    alignItems: "center",

    borderWidth: 1,

    borderColor: "#ececec",

    shadowColor: "#000",

    shadowOpacity: 0.08,

    shadowRadius: 3,

    shadowOffset: {
      width: 0,
      height: 1,
    },

    elevation: 2,
  },

  /* RECORD CARD */
  recordCard: {
    backgroundColor: "#fff",

    borderRadius: 10,

    borderWidth: 1,

    borderColor: "#ececec",

    padding: 14,

    marginBottom: 12,
  },

  recordHeader: {
    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",
  },

  recordTitle: {
    fontSize: width * 0.034,

    fontWeight: "600",

    color: "#222",
  },

  recordAction: {
    flexDirection: "row",

    alignItems: "center",

    gap: 16,
  },

  recordText: {
    marginTop: 8,

    fontSize: width * 0.032,

    color: "#444",
  },

  /* BUTTONS */
  bottomButtons: {
    position: "absolute",

    left: width * 0.04,
    right: width * 0.04,

    bottom: 92,

    flexDirection: "row",

    gap: 12,
  },

  bottomButton: {
    flex: 1,

    height: 42,

    borderRadius: 5,

    backgroundColor: "#4B7BE5",

    justifyContent: "center",

    alignItems: "center",
  },

  buttonText: {
    color: "#fff",

    fontSize: width * 0.034,

    fontWeight: "600",
  },

  /* DROPDOWN */
  modalOverlay: {
    flex: 1,

    backgroundColor:
      "rgba(0,0,0,0.05)",

    paddingHorizontal: width * 0.04,

    paddingTop: height * 0.32,
  },

  dropdownBox: {
    width: "100%",

    maxHeight: height * 0.35,

    backgroundColor: "#fff",

    borderRadius: 10,

    overflow: "hidden",

    borderWidth: 1,

    borderColor: "#e5e5e5",
  },

  dropdownItem: {
    height: 46,

    justifyContent: "center",

    paddingHorizontal: 16,

    borderBottomWidth: 1,

    borderBottomColor: "#f1f1f1",
  },

  dropdownText: {
    fontSize: width * 0.033,

    color: "#222",
  },
});
