import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import GSTHeader from "../../gst/components/GSTHeader";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from "react-native";

import {
  Ionicons,
} from "@expo/vector-icons";

import {
  router,
} from "expo-router";

import { fontSizes, fontWeights } from "../../../theme/typography";
import {
  useGSTBusinessProfileStore,
} from "../../gst/store/gstBusinessProfileStore";

export default function BusinessProfileScreen() {
  /*
  |--------------------------------------------------------------------------
  | GST PROFILE STORE
  |--------------------------------------------------------------------------
  */

  const {
    businessProfile,
    setBusinessProfile,
  } =
    useGSTBusinessProfileStore();

  /*
  |--------------------------------------------------------------------------
  | DYNAMIC FINANCIAL YEAR
  |--------------------------------------------------------------------------
  */

  const currentYear =
    new Date().getFullYear();

  const nextYear =
    currentYear + 1;

  const dynamicFY =
    `${currentYear}-${String(
      nextYear
    ).slice(2)}`;

  /*
  |--------------------------------------------------------------------------
  | DYNAMIC FINANCIAL YEARS LIST
  |--------------------------------------------------------------------------
  */

  const financialYears =
    useMemo(() => {
      return Array.from(
        { length: 10 },
        (_, index) => {
          const startYear =
            currentYear -
            4 +
            index;

          const endYear =
            String(
              startYear + 1
            ).slice(2);

          return `${startYear}-${endYear}`;
        }
      );
    }, []);

  /*
  |--------------------------------------------------------------------------
  | FORM STATES
  |--------------------------------------------------------------------------
  */

  /*
  |--------------------------------------------------------------------------
  | IMPORTANT
  |--------------------------------------------------------------------------
  | ID yaha businessName se hi aayega
  |
  | Example:
  |
  | businessName = "Shahbaz Alam"
  |
  | GSTReturnScreen me:
  |
  | ID : Shahbaz Alam
  |
  |--------------------------------------------------------------------------
  */

  const [businessName, setBusinessName] =
    useState("");

  const [gstin, setGSTIN] =
    useState("");

  const [
    financialYear,
    setFinancialYear,
  ] = useState("");

  const [
    showFYDropdown,
    setShowFYDropdown,
  ] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | LOAD STORE DATA
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    setBusinessName(
      businessProfile?.id || ""
    );

    setGSTIN(
      businessProfile?.gstin || ""
    );

    setFinancialYear(
      businessProfile?.financialYear ||
        dynamicFY
    );
  }, []);

  /*
  |--------------------------------------------------------------------------
  | SAVE PROFILE
  |--------------------------------------------------------------------------
  */

  const handleSaveProfile = () => {
    setBusinessProfile({
      /*
      |--------------------------------------------------------------------------
      | ID STORE
      |--------------------------------------------------------------------------
      | Business name ko hi ID bana rahe h
      |--------------------------------------------------------------------------
      */

      id: businessName,

      gstin,

      financialYear,
    });

    router.back();
  };

  return (
    <SafeAreaView
      style={styles.container}
    >
      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={{
          paddingBottom: 40,
        }}
      >
        {/* HEADER */}

        <GSTHeader title="Business Profile" />

        {/* HERO CARD */}

        <View
          style={
            styles.profileHeroCard
          }
        >
          {/* AVATAR */}

          <View
            style={
              styles.avatar
            }
          >
            <Ionicons
              name="business"
              size={28}
              color="#FFFFFF"
            />
          </View>

          {/* TITLE */}

          <Text
            style={
              styles.businessTitle
            }
          >
            GST Business
          </Text>

          {/* SUBTITLE */}

          <Text
            style={
              styles.businessSubTitle
            }
          >
            Manage your GST
            business details,
            profile and filing
            information
          </Text>

          {/* FY BADGE */}

          <View
            style={
              styles.fyBadge
            }
          >
            <Text
              style={
                styles.fyText
              }
            >
              FY {financialYear}
            </Text>
          </View>
        </View>

        {/* FORM CARD */}

        <View
          style={
            styles.formCard
          }
        >
          {/* BUSINESS NAME */}

          <View
            style={
              styles.inputWrapper
            }
          >
            <Text
              style={
                styles.label
              }
            >
              Business Name
            </Text>

            <TextInput
              value={
                businessName
              }
              onChangeText={
                setBusinessName
              }
              placeholder="Enter business name"
              placeholderTextColor="#9CA3AF"
              style={
                styles.input
              }
            />
          </View>

          {/* GSTIN */}

          <View
            style={
              styles.inputWrapper
            }
          >
            <Text
              style={
                styles.label
              }
            >
              GSTIN Number
            </Text>

            <TextInput
              value={gstin}
              onChangeText={
                setGSTIN
              }
              placeholder="Enter GSTIN number"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="characters"
              style={
                styles.input
              }
            />
          </View>

          {/* FINANCIAL YEAR */}

          <View
            style={
              styles.inputWrapper
            }
          >
            <Text
              style={
                styles.label
              }
            >
              Financial Year
            </Text>

            {/* DROPDOWN BUTTON */}

            <TouchableOpacity
              activeOpacity={0.9}
              style={
                styles.dropdownButton
              }
              onPress={() =>
                setShowFYDropdown(
                  !showFYDropdown
                )
              }
            >
              <Text
                style={
                  styles.dropdownText
                }
              >
                {financialYear ||
                  "Select Financial Year"}
              </Text>

              <Ionicons
                name={
                  showFYDropdown
                    ? "chevron-up"
                    : "chevron-down"
                }
                size={20}
                color="#6B7280"
              />
            </TouchableOpacity>

            {/* DROPDOWN */}

            {showFYDropdown && (
              <View
                style={
                  styles.dropdownContainer
                }
              >
                {financialYears.map(
                  (year) => (
                    <TouchableOpacity
                      key={year}
                      style={
                        styles.dropdownItem
                      }
                      onPress={() => {
                        setFinancialYear(
                          year
                        );

                        setShowFYDropdown(
                          false
                        );
                      }}
                    >
                      <Text
                        style={
                          styles.dropdownItemText
                        }
                      >
                        {year}
                      </Text>

                      {financialYear ===
                        year && (
                        <Ionicons
                          name="checkmark-circle"
                          size={20}
                          color="#2563EB"
                        />
                      )}
                    </TouchableOpacity>
                  )
                )}
              </View>
            )}
          </View>
        </View>

        {/* SAVE BUTTON */}

        <TouchableOpacity
          activeOpacity={0.9}
          style={
            styles.saveButton
          }
          onPress={
            handleSaveProfile
          }
        >
          <Ionicons
            name="save"
            size={20}
            color="#FFFFFF"
          />

          <Text
            style={
              styles.saveButtonText
            }
          >
            Save Business Profile
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        "#F4F7FB",
    },

    /*
    |--------------------------------------------------------------------------
    | HEADER
    |--------------------------------------------------------------------------
    */

    header: {
      height: 72,
      backgroundColor:
        "#3D7BEA",
      borderBottomLeftRadius: 24,
      borderBottomRightRadius: 24,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
      paddingHorizontal: 12,
    },

    backButton: {
      width: 38,
      height: 38,
      borderRadius: 999,
      backgroundColor:
        "rgba(255,255,255,0.15)",
      alignItems: "center",
      justifyContent:
        "center",
    },

    headerTitle: {
      fontSize: fontSizes.xxl,
      fontWeight: fontWeights.bold,
      color: "#FFFFFF",
    },

    /*
    |--------------------------------------------------------------------------
    | HERO CARD
    |--------------------------------------------------------------------------
    */

    profileHeroCard: {
      marginHorizontal: 18,
      marginTop: 22,
      backgroundColor:
        "#FFFFFF",
      borderRadius: 12,
      alignItems: "center",
      paddingVertical: 28,
      paddingHorizontal: 20,
      elevation: 4,
    },

    avatar: {
      width: 60,
      height: 60,
      borderRadius: 999,
      backgroundColor:
        "#3D7BEA",
      alignItems: "center",
      justifyContent:
        "center",
    },

    businessTitle: {
      marginTop: 18,
      fontSize: fontSizes.display,
      fontWeight: fontWeights.bold,
      color: "#111827",
    },

    businessSubTitle: {
      marginTop: 10,
      fontSize: fontSizes.md,
      fontWeight: fontWeights.medium,
      color: "#6B7280",
      textAlign: "center",
      lineHeight: 22,
    },

    fyBadge: {
      marginTop: 18,
      backgroundColor:
        "#E8F0FF",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 999,
    },

    fyText: {
      fontSize: fontSizes.md,
      fontWeight: fontWeights.bold,
      color: "#2563EB",
    },

    /*
    |--------------------------------------------------------------------------
    | FORM CARD
    |--------------------------------------------------------------------------
    */

    formCard: {
      marginTop: 24,
      marginHorizontal: 18,
      backgroundColor:
        "#FFFFFF",
      borderRadius: 12,
      padding: 20,
      elevation: 3,
    },

    inputWrapper: {
      marginBottom: 22,
    },

    label: {
      fontSize: fontSizes.md,
      fontWeight: fontWeights.bold,
      color: "#111827",
      marginBottom: 10,
    },

    input: {
      height: 44,
      backgroundColor:
        "#F8FAFC",
      borderRadius: 8,
      paddingHorizontal: 12,
      fontSize: fontSizes.md,
      fontWeight: fontWeights.semibold,
      color: "#111827",
      borderWidth: 1,
      borderColor: "#E5E7EB",
    },

    /*
    |--------------------------------------------------------------------------
    | DROPDOWN
    |--------------------------------------------------------------------------
    */

    dropdownButton: {
      height: 44,
      backgroundColor:
        "#F8FAFC",
      borderRadius: 8,
      paddingHorizontal: 12,
      borderWidth: 1,
      borderColor: "#E5E7EB",
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
    },

    dropdownText: {
      fontSize: fontSizes.md,
      fontWeight: fontWeights.semibold,
      color: "#111827",
    },

    dropdownContainer: {
      marginTop: 10,
      backgroundColor:
        "#FFFFFF",
      borderRadius: 8,
      borderWidth: 1,
      borderColor: "#E5E7EB",
      overflow: "hidden",
    },

    dropdownItem: {
      height: 52,
      paddingHorizontal: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
      borderBottomWidth: 1,
      borderBottomColor:
        "#F1F5F9",
    },

    dropdownItemText: {
      fontSize: fontSizes.md,
      fontWeight: fontWeights.semibold,
      color: "#111827",
    },

    /*
    |--------------------------------------------------------------------------
    | SAVE BUTTON
    |--------------------------------------------------------------------------
    */

    saveButton: {
      marginHorizontal: 18,
      marginTop: 24,
      height: 44,
      backgroundColor:
        "#3D7BEA",
      borderRadius: 8,
      alignItems: "center",
      justifyContent:
        "center",
      flexDirection: "row",
      gap: 10,
      elevation: 4,
    },

    saveButtonText: {
      fontSize: fontSizes.lg,
      fontWeight: fontWeights.bold,
      color: "#FFFFFF",
    },
  });
