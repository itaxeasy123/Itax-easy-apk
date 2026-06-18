import React from "react";

import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Alert,
  TouchableOpacity,
  Modal,
} from "react-native";

import GSTHeroCard from "./GSTHeroCard";
import GSTButton from "./GSTButton";
import GSTSelectField from "./GSTSelectField";

import useGSTDashboard from "../hooks/useGSTDashboard";
import { Ionicons } from "@expo/vector-icons";
import { useGSTBusinessProfileStore } from "../store/gstBusinessProfileStore";

import { fontSizes, fontWeights } from "../../../theme/typography";
interface GSTFilterModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function GSTFilterModal({ visible, onClose }: GSTFilterModalProps) {
  const { businessProfile, setBusinessProfile } = useGSTBusinessProfileStore();
  const {
    assessmentYears,
    quarterData,

    assessmentYear,
    setAssessmentYear,

    quarter,
    selectQuarter,

    month,
    setMonth,

    availableMonths,
  } = useGSTDashboard();

  const handleSubmit = () => {
    if (!assessmentYear || !quarter || !month) {
      Alert.alert("Validation", "Please select all fields");
      return;
    }

    setBusinessProfile({
      ...businessProfile,
      financialYear: assessmentYear,
    });

    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <Ionicons name="close" size={28} color="#333" />
          </TouchableOpacity>
        </View>
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          <GSTHeroCard />

          <Text style={styles.profile}>
            Select Period
          </Text>

          <GSTSelectField
            label="Select Financial Year"
            value={assessmentYear}
            options={assessmentYears}
            onSelect={setAssessmentYear}
          />

          <View style={styles.row}>
            <View style={styles.half}>
              <GSTSelectField
                label="Quarter"
                value={quarter}
                options={quarterData.map(item => item.label)}
                onSelect={(value) => {
                  const selected = quarterData.find(item => item.label === value);
                  if (selected) {
                    selectQuarter(selected.id);
                  }
                }}
              />
            </View>

            <View style={styles.half}>
              <GSTSelectField
                label="Months"
                value={month}
                options={availableMonths}
                onSelect={setMonth}
              />
            </View>
          </View>

          <View style={styles.buttonWrap}>
            <GSTButton
              title="Continue"
              onPress={handleSubmit}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F7F9FC",
  },
  header: {
    paddingHorizontal: 22,
    paddingTop: 16,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  backButton: {
    padding: 4,
  },
  container: {
    paddingHorizontal: 22,
    paddingVertical: 10,
    justifyContent: "center",
    flexGrow: 1,
  },
  profile: {
    fontSize: 28,
    fontWeight: fontWeights.bold,
    color: "#333",
    textAlign: "center",
    marginBottom: 28,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
  },
  half: {
    width: "46%",
  },
  buttonWrap: {
    marginTop: 52,
  },
});
