import React from "react";

import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Alert,
} from "react-native";

import { router } from "expo-router";

import GSTHeroCard from "../components/GSTHeroCard";
import GSTButton from "../components/GSTButton";
import GSTSelectField from "../components/GSTSelectField";

import useGSTDashboard from "../hooks/useGSTDashboard";

import theme from "../theme";

export default function GSTDashboardScreen() {
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
    if (
      !assessmentYear ||
      !quarter ||
      !month
    ) {
      Alert.alert(
        "Validation",
        "Please select all fields"
      );

      return;
    }

    router.push({
       pathname: "/gst/returns",

      params: {
        assessmentYear,
        quarter,
        month,
      },
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <GSTHeroCard />

        <Text style={styles.profile}>
          Profile
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
              options={quarterData.map(
                item => item.label
              )}
              onSelect={(value) => {
                const selected =
                  quarterData.find(
                    item =>
                      item.label === value
                  );

                if (selected) {
                  selectQuarter(
                    selected.id
                  );
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
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F7F9FC",
  },

  container: {
    paddingHorizontal: 22,
    paddingVertical: 32,
    justifyContent: "center",
    flexGrow: 1,
  },

  profile: {
    fontSize: 32,
    fontWeight: "700",
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