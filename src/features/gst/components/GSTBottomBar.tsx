import React, {
  useState,
} from "react";

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
} from "react-native";

import {
  Ionicons,
} from "@expo/vector-icons";

import {
  router,
  usePathname,
} from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const blogItems = [
  {
    title: "Cash",
    subtitle: "Cash payment",
    route: "/gst/cash",
  },

  {
    title: "Challan",
    subtitle: "GST challan",
    route: "/gst/challan",
  },

  {
    title: "Credit",
    subtitle: "Input credit",
    route: "/gst/credit",
  },

  {
    title: "Liability",
    subtitle: "Tax liability",
    route: "/gst/liability",
  },

  {
    title: "Pay Tax",
    subtitle: "Pay GST tax",
    route: "/gst/pay-tax",
  },
];

export default function GSTBottomBar() {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const [blogModal, setBlogModal] =
    useState(false);

  const iconColor =
    "#8F8BA8";

  const handleNavigate = (
    route: string
  ) => {
    setBlogModal(false);

    router.push(route as any);
  };

  return (
    <>
      {/* FLOAT BUTTON */}

      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.fab}
      >
        <Ionicons
          name="add"
          size={30}
          color="#FFFFFF"
        />
      </TouchableOpacity>

      {/* BLOG BOTTOM SHEET */}

      <Modal
        visible={blogModal}
        transparent
        animationType="slide"
      >
        <View
          style={
            styles.modalOverlay
          }
        >
          <View
            style={
              styles.modalContainer
            }
          >
            {/* TOP BAR */}

            <View
              style={
                styles.modalTop
              }
            >
              {/* CLOSE */}

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() =>
                  setBlogModal(
                    false
                  )
                }
                style={
                  styles.closeButton
                }
              >
                <Ionicons
                  name="close"
                  size={22}
                  color="#1F2937"
                />
              </TouchableOpacity>

              {/* HANDLE */}

              <View
                style={
                  styles.handle
                }
              />

              <View
                style={{
                  width: 34,
                }}
              />
            </View>

            {/* BLOG LIST */}

            <ScrollView
              showsVerticalScrollIndicator={
                false
              }
              contentContainerStyle={{
                paddingBottom: 40,
              }}
            >
              {blogItems.map(
                (
                  item,
                  index
                ) => (
                  <TouchableOpacity
                    key={index}
                    activeOpacity={
                      0.85
                    }
                    style={
                      styles.blogCard
                    }
                    onPress={() =>
                      handleNavigate(
                        item.route
                      )
                    }
                  >
                    {/* LEFT */}

                    <View
                      style={
                        styles.blogLeft
                      }
                    >
                      <View
                        style={
                          styles.blogIcon
                        }
                      >
                        <Ionicons
                          name="document-text"
                          size={18}
                          color="#4C7DFF"
                        />
                      </View>

                      <View
                        style={
                          styles.blogContent
                        }
                      >
                        <Text
                          style={
                            styles.blogTitle
                          }
                        >
                          {
                            item.title
                          }
                        </Text>

                        <Text
                          style={
                            styles.blogSubtitle
                          }
                        >
                          {
                            item.subtitle
                          }
                        </Text>
                      </View>
                    </View>

                    {/* RIGHT ARROW */}

                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color="#9CA3AF"
                    />
                  </TouchableOpacity>
                )
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* BOTTOM BAR */}

      <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 8), height: 66 + Math.max(insets.bottom, 8) }]}>
        {/* HOME */}

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.item}
          onPress={() => router.push("/gst/returns")}
        >
          <Ionicons
            name="home"
            size={18}
            color={
              pathname.startsWith("/gst") && pathname !== "/gst/tools"
                ? "#4C7DFF"
                : iconColor
            }
          />

          <Text
            style={[
              styles.label,
              pathname.startsWith("/gst") && pathname !== "/gst/tools" && {
                color: "#4C7DFF",
              },
            ]}
          >
            Home
          </Text>
        </TouchableOpacity>

        {/* TOOLS */}

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.item}
          onPress={() => router.push("/gst/tools")}
        >
          <Ionicons
            name="construct"
            size={18}
            color={
              pathname === "/gst/tools"
                ? "#4C7DFF"
                : iconColor
            }
          />

          <Text
            style={[
              styles.label,
              pathname === "/gst/tools" && {
                color: "#4C7DFF",
              },
            ]}
          >
            Tools
          </Text>
        </TouchableOpacity>

        {/* BLOGS */}

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.item}
          onPress={() => setBlogModal(true)}
        >
          <View style={{ alignItems: "center", justifyContent: "center", width: 28, height: 28 }}>
            <Ionicons
              name="newspaper"
              size={18}
              color={iconColor}
            />
          </View>

          <Text
            style={[
              styles.label,
            ]}
          >
            Blogs
          </Text>
        </TouchableOpacity>

        {/* MORE */}

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.item}
        >
          <Ionicons
            name="menu"
            size={18}
            color={iconColor}
          />

          <Text
            style={styles.label}
          >
            More
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
    borderTopWidth: 1,
    borderColor: "#ECECEC",
  },

  item: {
    width: 70,

    alignItems: "center",

    justifyContent:
      "center",
  },

  label: {
    marginTop: 4,

    fontSize: 10,

    color: "#8F8BA8",

    fontWeight: "500",

    textAlign: "center",
  },

  activeIcon: {
    width: 28,

    height: 28,

    borderRadius: 8,

    backgroundColor:
      "#EEF4FF",

    alignItems: "center",

    justifyContent:
      "center",
  },

  fab: {
    position: "absolute",

    right: 14,

    bottom: 42,

    width: 46,

    height: 46,

    borderRadius: 23,

    backgroundColor:
      "#4C7DFF",

    alignItems: "center",

    justifyContent:
      "center",

    zIndex: 999,

    borderWidth: 3,

    borderColor:
      "#FFFFFF",

    shadowColor:
      "#4C7DFF",

    shadowOpacity: 0.25,

    shadowRadius: 8,

    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 10,
  },

  modalOverlay: {
    flex: 1,

    backgroundColor:
      "rgba(0,0,0,0.35)",

    justifyContent:
      "flex-end",
  },

  modalContainer: {
    height: "58%",

    backgroundColor:
      "#F5F7FB",

    borderTopLeftRadius: 26,

    borderTopRightRadius: 26,

    paddingTop: 14,

    paddingHorizontal: 14,
  },

  modalTop: {
    flexDirection: "row",

    alignItems: "center",

    justifyContent:
      "space-between",

    marginBottom: 18,
  },

  closeButton: {
    width: 34,

    height: 34,

    borderRadius: 17,

    backgroundColor:
      "#F3F4F6",

    alignItems: "center",

    justifyContent:
      "center",
  },

  handle: {
    width: 60,

    height: 5,

    borderRadius: 10,

    backgroundColor:
      "#D1D5DB",

    alignSelf: "center",
  },

  blogCard: {
    flexDirection: "row",

    alignItems: "center",

    justifyContent:
      "space-between",

    backgroundColor:
      "#FFFFFF",

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

  blogLeft: {
    flexDirection: "row",

    alignItems: "center",

    flex: 1,
  },

  blogIcon: {
    width: 42,

    height: 42,

    borderRadius: 12,

    backgroundColor:
      "#EEF4FF",

    alignItems: "center",

    justifyContent:
      "center",

    marginRight: 14,
  },

  blogContent: {
    flex: 1,
  },

  blogTitle: {
    fontSize: 16,

    fontWeight: "600",

    color: "#1F2937",
  },

  blogSubtitle: {
    fontSize: 12,

    color: "#6B7280",

    marginTop: 2,
  },
});