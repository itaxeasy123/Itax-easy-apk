import React, {
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
  Modal,
} from "react-native";

import {
  Ionicons,
  MaterialIcons,
  FontAwesome5,
} from "@expo/vector-icons";

import {
  useLocalSearchParams,
  router,
} from "expo-router";
import {
  useGSTBusinessProfileStore,
} from "../store/gstBusinessProfileStore";
import GSTLoginPopup from "../components/GSTLoginPopup";
import GSTBottomBar from "../components/GSTBottomBar";


const GSTR1_STATUS = [
  {
    month: "Oct - 2024",
    status: "Filed",
  },

  {
    month: "Nov - 2024",
    status: "Filed",
  },

  {
    month: "Dec - 2024",
    status: "Pending",
  },
];

const GSTR3B_STATUS = [
  {
    month: "Oct - 2024",
    status: "Filed",
  },

  {
    month: "Nov - 2024",
    status: "Filed",
  },

  {
    month: "Dec - 2024",
    status: "Pending",
  },
];

export default function GSTReturnScreen() {
  const params =
    useLocalSearchParams();

  const [modalVisible, setModalVisible] =
    useState(false);
const {
  businessProfile,
} =
  useGSTBusinessProfileStore();

    const [
  showGSTLoginPopup,
  setShowGSTLoginPopup,
] = useState(false);

  const assessmentYear = useMemo(() => {
    return (
      params.assessmentYear ||
      "2024-25"
    );
  }, [params]);

  const handleBack = () => {
    router.push("/gst" as any);
  };

  const handleGSTLogin = () => {
    router.push(
      "/gst/dashboard" as any
    );
  };

  const handleGSTR1 = () => {
    setModalVisible(false);

    router.push(
      "/gst/gstr1" as any
    );
  };

  const handleGSTR3B = () => {
    setModalVisible(false);

    router.push(
      "/gst/gstr3b" as any
    );
  };

  return (
    <SafeAreaView
      style={styles.safe}
    >
      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        bounces={false}
        nestedScrollEnabled
        contentContainerStyle={
          styles.scrollContainer
        }
      >
        {/* HEADER */}

        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleBack}
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color="#FFF"
            />
          </TouchableOpacity>

          <Text
            style={styles.headerTitle}
          >
            Regular
          </Text>

          <Text style={styles.year}>
            {assessmentYear}
          </Text>
        </View>

        {/* RETURN DASHBOARD */}

        <View
          style={
            styles.dashboardWrap
          }
        >
          <View style={styles.line} />

          <View
            style={
              styles.dashboardBtn
            }
          >
            <Text
              style={
                styles.dashboardText
              }
            >
              Return Dashboard
            </Text>
          </View>

          <View style={styles.line} />
        </View>

        {/* PROFILE */}

        {/* <View
          style={styles.profileCard}
        >
          <View
            style={
              styles.profileLeft
            }
          >
            <View
              style={styles.avatar}
            >
              <Ionicons
                name="person"
                size={28}
                color="#FFF"
              />
            </View>

            <View
              style={
                styles.profileContent
              }
            >
              <View
                style={styles.row}
              >
                <Text
                  style={
                    styles.label
                  }
                >
                  ID
                </Text>

                <Text
                  style={
                    styles.value
                  }
                >
                  :
                  {" "}
                  {
                    mockProfile.id
                  }
                </Text>
              </View>

              <View
                style={styles.row}
              >
                <Text
                  style={
                    styles.label
                  }
                >
                  GSTIN
                </Text>

                <Text
                  style={
                    styles.value
                  }
                >
                  :
                  {" "}
                  {
                    mockProfile.gstin
                  }
                </Text>
              </View>

              <Text
                style={
                  styles.financialYear
                }
              >
                Financial year :
                {" "}
                {
                  assessmentYear
                }
              </Text>
            </View>
          </View>

          <Ionicons
            name="chevron-forward"
            size={24}
            color="#222"
          />
        </View> */}
<TouchableOpacity
  activeOpacity={0.9}
  style={styles.profileCard}
  onPress={() =>
    router.push(
      "/gst/businessprofile" as any
    )
  }
>
  <View
    style={
      styles.profileLeft
    }
  >
    <View
      style={styles.avatar}
    >
      <Ionicons
        name="person"
        size={28}
        color="#FFF"
      />
    </View>

    <View
      style={
        styles.profileContent
      }
    >
      <View
        style={styles.row}
      >
        <Text
          style={
            styles.label
          }
        >
          ID
        </Text>

        <Text
          style={
            styles.value
          }
        >
          :
          {" "}
          {
            businessProfile?.id ||
            "N/A"
          }
        </Text>
      </View>

      <View
        style={styles.row}
      >
        <Text
          style={
            styles.label
          }
        >
          GSTIN
        </Text>

        <Text
          style={
            styles.value
          }
        >
          :
          {" "}
          {
            businessProfile?.gstin ||
            "N/A"
          }
        </Text>
      </View>

      <Text
        style={
          styles.financialYear
        }
      >
        Financial year :
        {" "}
        {
          businessProfile?.financialYear ||
          assessmentYear
        }
      </Text>
    </View>
  </View>

  <Ionicons
    name="chevron-forward"
    size={24}
    color="#222"
  />
</TouchableOpacity>
        {/* ACTIONS */}

        <View
          style={
            styles.actionsContainer
          }
        >
          {/* GST LOGIN */}

          <TouchableOpacity
            style={
              styles.actionCard
            }
            activeOpacity={0.85}
            // onPress={
            //   handleGSTLogin
            // }
            onPress={() =>
  setShowGSTLoginPopup(true)
}
          >
            <MaterialIcons
              name="login"
              size={24}
              color="#3D7BEA"
            />

            <Text
              style={
                styles.actionTitle
              }
            >
              GSTR
            </Text>

            <Text
              style={
                styles.actionSub
              }
            >
              Login
            </Text>
          </TouchableOpacity>

          {/* FILE RETURN */}

          <TouchableOpacity
            style={
              styles.actionCard
            }
            activeOpacity={0.85}
            onPress={() =>
              setModalVisible(true)
            }
          >
            <Ionicons
              name="document-text"
              size={24}
              color="#3D7BEA"
            />

            <Text
              style={
                styles.actionTitle
              }
            >
              File
            </Text>

            <Text
              style={
                styles.actionSub
              }
            >
              Return
            </Text>
          </TouchableOpacity>

          {/* TRACK GST */}

          <TouchableOpacity
            style={
              styles.actionCard
            }
            activeOpacity={0.85}
          >
            <Ionicons
              name="analytics"
              size={24}
              color="#3D7BEA"
            />

            <Text
              style={
                styles.actionTitle
              }
            >
              Track
            </Text>

            <Text
              style={
                styles.actionSub
              }
            >
              GST
            </Text>
          </TouchableOpacity>
        </View>

        {/* RETURNS */}

        <Text
          style={
            styles.returnTitle
          }
        >
          Returns Calendar
        </Text>

        <View
          style={styles.returnRow}
        >
          {/* GSTR1 */}

          <View
            style={styles.returnCard}
          >
            <View
              style={
                styles.returnHeader
              }
            >
              <Text
                style={
                  styles.returnHeaderText
                }
              >
                GSTR - 1/IFF
              </Text>
            </View>

            {GSTR1_STATUS.map(
              (item, index) => (
                <View
                  key={index}
                  style={[
                    styles.statusItem,

                    item.status ===
                    "Pending"
                      ? styles.pending
                      : styles.filed,
                  ]}
                >
                  <Text
                    style={
                      styles.statusMonth
                    }
                  >
                    {item.month}
                  </Text>

                  <Text
                    style={
                      styles.statusText
                    }
                  >
                    {item.status}
                  </Text>
                </View>
              )
            )}
          </View>

          {/* GSTR3B */}

          <View
            style={styles.returnCard}
          >
            <View
              style={
                styles.returnHeader
              }
            >
              <Text
                style={
                  styles.returnHeaderText
                }
              >
                GSTR - 3B
              </Text>
            </View>

            {GSTR3B_STATUS.map(
              (item, index) => (
                <View
                  key={index}
                  style={[
                    styles.statusItem,

                    item.status ===
                    "Pending"
                      ? styles.pending
                      : styles.filed,
                  ]}
                >
                  <Text
                    style={
                      styles.statusMonth
                    }
                  >
                    {item.month}
                  </Text>

                  <Text
                    style={
                      styles.statusText
                    }
                  >
                    {item.status}
                  </Text>
                </View>
              )
            )}
          </View>
        </View>
      </ScrollView>

      {/* BOTTOM BAR */}

      <View
        style={{
          position: "absolute",
          bottom: 0,
          width: "100%",
          left: 0,
          right: 0,
        }}
      >
        <GSTBottomBar />
      </View>
      {/* MODAL */}

<Modal
  visible={modalVisible}
  transparent
  animationType="slide"
>
  <View
    style={styles.modalOverlay}
  >
    <View
      style={styles.modalContent}
    >
      {/* TOP BAR */}

      <View
        style={styles.modalHeader}
      >
        {/* EMPTY VIEW */}

        <View
          style={{
            width: 30,
          }}
        />

        {/* HANDLE */}

        <View
          style={styles.modalHandle}
        />

        {/* CLOSE */}

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() =>
            setModalVisible(
              false
            )
          }
          style={
            styles.closeIconBtn
          }
        >
          <Ionicons
            name="close"
            size={22}
            color="#1F2937"
          />
        </TouchableOpacity>
      </View>

      {/* LIST */}

      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.returnCardUI}
        onPress={handleGSTR1}
      >
        {/* LEFT */}

        <View
          style={styles.returnLeft}
        >
          <View
            style={
              styles.returnIconBox
            }
          >
            <Ionicons
              name="document-text"
              size={18}
              color="#4C7DFF"
            />
          </View>

          <View>
            <Text
              style={
                styles.returnTitleUI
              }
            >
              GSTR - 1
            </Text>

            <Text
              style={
                styles.returnSubUI
              }
            >
              Monthly return filing
            </Text>
          </View>
        </View>

        {/* RIGHT */}

        <Ionicons
          name="chevron-forward"
          size={20}
          color="#9CA3AF"
        />
      </TouchableOpacity>

      {/* GSTR 3B */}

      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.returnCardUI}
        onPress={handleGSTR3B}
      >
        {/* LEFT */}

        <View
          style={styles.returnLeft}
        >
          <View
            style={
              styles.returnIconBox
            }
          >
            <Ionicons
              name="receipt"
              size={18}
              color="#4C7DFF"
            />
          </View>

          <View>
            <Text
              style={
                styles.returnTitleUI
              }
            >
              GSTR - 3B
            </Text>

            <Text
              style={
                styles.returnSubUI
              }
            >
              Summary GST return
            </Text>
          </View>
        </View>

        {/* RIGHT */}

        <Ionicons
          name="chevron-forward"
          size={20}
          color="#9CA3AF"
        />
      </TouchableOpacity>
    </View>
  </View>
</Modal>
  {/* gst login popup */}
<GSTLoginPopup
  visible={
    showGSTLoginPopup
  }
  onClose={() =>
    setShowGSTLoginPopup(
      false
    )
  }
/>
    </SafeAreaView>
  );
}

const styles =
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor:
        "#F5F7FB",
    },

    scrollContainer: {
      paddingBottom: 120,
    },

    header: {
      height: 84,

      backgroundColor:
        "#3D7BEA",

      paddingHorizontal: 14,

      flexDirection: "row",

      alignItems: "center",
    },

    headerTitle: {
      color: "#FFFFFF",

      fontSize: 16,

      fontWeight: "600",

      marginLeft: 12,
    },

    year: {
      color: "#FFFFFF",

      fontSize: 12,

      position: "absolute",

      right: 14,

      top: 34,
    },

    dashboardWrap: {
      flexDirection: "row",

      alignItems: "center",

      marginTop: 12,

      paddingHorizontal: 16,
    },

    line: {
      flex: 1,

      height: 1,

      backgroundColor:
        "#A8C5FF",
    },

    dashboardBtn: {
      backgroundColor:
        "#3D7BEA",

      paddingHorizontal: 18,

      paddingVertical: 8,

      borderRadius: 30,
    },

    dashboardText: {
      color: "#FFF",

      fontSize: 12,
    },

    profileCard: {
      marginHorizontal: 16,

      marginTop: 14,

      backgroundColor:
        "#DDEFD8",

      borderRadius: 2,

      paddingVertical: 14,

      paddingHorizontal: 14,

      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "space-between",
    },

    profileLeft: {
      flexDirection: "row",

      alignItems: "center",

      flex: 1,
    },

    avatar: {
      width: 52,

      height: 52,

      borderRadius: 26,

      backgroundColor:
        "#3D7BEA",

      alignItems: "center",

      justifyContent:
        "center",

      marginRight: 12,
    },

    profileContent: {
      flex: 1,
    },

    row: {
      flexDirection: "row",

      alignItems: "center",

      marginBottom: 2,
    },

    label: {
      width: 55,

      fontSize: 14,

      fontWeight: "700",

      color: "#333",
    },

    value: {
      fontSize: 14,

      fontWeight: "500",

      color: "#333",
    },

    financialYear: {
      marginTop: 4,

      fontSize: 14,

      color: "#333",

      fontWeight: "500",
    },

    actionsContainer: {
      flexDirection: "row",

      justifyContent:
        "space-between",

      paddingHorizontal: 16,

      marginTop: 14,
    },

    actionCard: {
      width: "30%",

      backgroundColor:
        "#FFFFFF",

      borderRadius: 14,

      paddingVertical: 14,

      alignItems: "center",

      justifyContent:
        "center",

      shadowColor: "#000",

      shadowOpacity: 0.08,

      shadowRadius: 6,

      shadowOffset: {
        width: 0,
        height: 3,
      },

      elevation: 4,
    },

    actionTitle: {
      fontSize: 13,

      fontWeight: "700",

      marginTop: 8,

      color: "#111827",
    },

    actionSub: {
      fontSize: 10,

      color: "#6B7280",

      marginTop: 2,
    },

    returnTitle: {
      marginTop: 24,

      marginHorizontal: 16,

      fontSize: 16,

      fontWeight: "700",
    },

    returnRow: {
      flexDirection: "row",

      justifyContent:
        "space-between",

      paddingHorizontal: 16,

      marginTop: 14,
    },

    returnCard: {
      width: "48%",

      backgroundColor:
        "#FFF",

      borderRadius: 14,

      overflow: "hidden",
    },

    returnHeader: {
      backgroundColor:
        "#3D7BEA",

      padding: 10,

      alignItems: "center",
    },

    returnHeaderText: {
      color: "#FFF",

      fontWeight: "700",
    },

    statusItem: {
      paddingVertical: 12,

      alignItems: "center",
    },

    filed: {
      backgroundColor:
        "#54C45E",
    },

    pending: {
      backgroundColor:
        "#FF6B6B",
    },

    statusMonth: {
      color: "#FFF",

      fontSize: 12,
    },

    statusText: {
      color: "#FFF",

      fontWeight: "700",

      marginTop: 4,
    },

    modalOverlay: {
      flex: 1,

      backgroundColor:
        "rgba(0,0,0,0.5)",

      justifyContent:
        "flex-end",
    },

  modalContent: {
  backgroundColor: "#F5F7FB",

  borderTopLeftRadius: 28,

  borderTopRightRadius: 28,

  paddingTop: 14,

  paddingHorizontal: 14,

  paddingBottom: 30,
},

modalHeader: {
  flexDirection: "row",

  alignItems: "center",

  justifyContent: "space-between",

  marginBottom: 20,
},

modalHandle: {
  width: 60,

  height: 5,

  borderRadius: 10,

  backgroundColor: "#D1D5DB",
},

closeIconBtn: {
  width: 30,

  height: 30,

  borderRadius: 15,

  backgroundColor: "#EEF2FF",

  alignItems: "center",

  justifyContent: "center",
},

returnCardUI: {
  flexDirection: "row",

  alignItems: "center",

  justifyContent: "space-between",

  backgroundColor: "#FFFFFF",

  borderRadius: 18,

  padding: 16,

  marginBottom: 14,

  shadowColor: "#000",

  shadowOpacity: 0.04,

  shadowRadius: 4,

  shadowOffset: {
    width: 0,
    height: 2,
  },

  elevation: 2,
},

returnLeft: {
  flexDirection: "row",

  alignItems: "center",

  flex: 1,
},

returnIconBox: {
  width: 42,

  height: 42,

  borderRadius: 12,

  backgroundColor: "#EEF4FF",

  alignItems: "center",

  justifyContent: "center",

  marginRight: 14,
},

returnTitleUI: {
  fontSize: 16,

  fontWeight: "600",

  color: "#1F2937",
},

returnSubUI: {
  fontSize: 12,

  color: "#6B7280",

  marginTop: 2,
},
  });