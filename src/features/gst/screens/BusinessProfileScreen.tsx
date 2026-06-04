import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

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

        <View style={styles.header}>
          {/* BACK */}

          <TouchableOpacity
            onPress={() =>
              router.back()
            }
            style={
              styles.backButton
            }
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color="#FFFFFF"
            />
          </TouchableOpacity>

          {/* TITLE */}

          <Text
            style={
              styles.headerTitle
            }
          >
            Business Profile
          </Text>

          {/* EMPTY */}

          <View
            style={{
              width: 38,
            }}
          />
        </View>

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
              size={42}
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
      paddingHorizontal: 18,
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
      fontSize: 20,
      fontWeight: "700",
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
      borderRadius: 30,
      alignItems: "center",
      paddingVertical: 28,
      paddingHorizontal: 20,
      elevation: 4,
    },

    avatar: {
      width: 100,
      height: 100,
      borderRadius: 999,
      backgroundColor:
        "#3D7BEA",
      alignItems: "center",
      justifyContent:
        "center",
    },

    businessTitle: {
      marginTop: 18,
      fontSize: 24,
      fontWeight: "700",
      color: "#111827",
    },

    businessSubTitle: {
      marginTop: 10,
      fontSize: 14,
      fontWeight: "500",
      color: "#6B7280",
      textAlign: "center",
      lineHeight: 22,
    },

    fyBadge: {
      marginTop: 18,
      backgroundColor:
        "#E8F0FF",
      paddingHorizontal: 18,
      paddingVertical: 10,
      borderRadius: 999,
    },

    fyText: {
      fontSize: 14,
      fontWeight: "700",
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
      borderRadius: 28,
      padding: 20,
      elevation: 3,
    },

    inputWrapper: {
      marginBottom: 22,
    },

    label: {
      fontSize: 15,
      fontWeight: "700",
      color: "#111827",
      marginBottom: 10,
    },

    input: {
      height: 58,
      backgroundColor:
        "#F8FAFC",
      borderRadius: 18,
      paddingHorizontal: 18,
      fontSize: 15,
      fontWeight: "600",
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
      height: 58,
      backgroundColor:
        "#F8FAFC",
      borderRadius: 18,
      paddingHorizontal: 18,
      borderWidth: 1,
      borderColor: "#E5E7EB",
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
    },

    dropdownText: {
      fontSize: 15,
      fontWeight: "600",
      color: "#111827",
    },

    dropdownContainer: {
      marginTop: 10,
      backgroundColor:
        "#FFFFFF",
      borderRadius: 18,
      borderWidth: 1,
      borderColor: "#E5E7EB",
      overflow: "hidden",
    },

    dropdownItem: {
      height: 52,
      paddingHorizontal: 18,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
      borderBottomWidth: 1,
      borderBottomColor:
        "#F1F5F9",
    },

    dropdownItemText: {
      fontSize: 15,
      fontWeight: "600",
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
      height: 58,
      backgroundColor:
        "#3D7BEA",
      borderRadius: 20,
      alignItems: "center",
      justifyContent:
        "center",
      flexDirection: "row",
      gap: 10,
      elevation: 4,
    },

    saveButtonText: {
      fontSize: 16,
      fontWeight: "700",
      color: "#FFFFFF",
    },
  });