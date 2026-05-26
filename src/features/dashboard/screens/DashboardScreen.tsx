import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
// import { StatusBar } from "expo-status-bar";
import React, { useCallback, useState } from "react";
import {
  Animated,
  Image,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useAuthStore } from "../../../store/authStore";
import styles from "../../../theme/dashboardStyles";
import DashboardHeader from "../components/DashboardHeader";
type CalculatorRoute =
  | "/gst-calculator"
  | "/depreciation-calculator"
  | "/capital-gain-calculator"
  | "/tax-calculator-screen"
  | "/simple-interest-calculator"
  | "/compound-interest-calculator"
  | "/emi-calculator"
  | "/fd-calculator"
  | "/sip-calculator"
  | "/business-loan-calculator"
  | "/car-loan-calculator"
  | "/loan-against-property-calculator"
  | "/home-loan-calculator"
  | "/personal-loan-calculator"
  | "/gst-return-calculator"
  | "/tds-calculator"
  | "/advance-tax-calculator"
  | "/hra-calculator"
  | "/pan-scan" // ✅ ADD THIS (FIX)
  | "/adhaar-scan" // ✅ ADD THIS (FIX)
  | "/about"
  | "/profile"
  | "/help-support"
  | "/privacy-policy"
  | "/image-to-pdf-converter" // ✅ yaha pipe add karo
  | "/merge-pdf" // ✅ add karo
  | "/split-pdf" // ✅ add karo
  | "/accounting"
  | "/itr"
  | "/gst"
  | null;

type CalculatorItem = {
  route: CalculatorRoute;
  title: string;
};

type ServiceItem = {
  calculators: CalculatorItem[];
  hasBottomSheet?: boolean;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  title: string;
};

type ServiceEntry = ServiceItem & {
  originalIndex: number;
};

const PDF_TOOL: ServiceItem = {
  title: "PDF Toolkit",
  icon: "document-attach",
  hasBottomSheet: true,
  calculators: [
    { title: "Merge PDF", route: "/merge-pdf" },
    { title: "Split PDF", route: "/split-pdf" },
    { title: "Image to PDF", route: "/image-to-pdf-converter" },
  ],
};

const ALL_SERVICES: ServiceItem[] = [
  {
    title: "Accounting",
    icon: "reader",
    hasBottomSheet: true,
    calculators: [{ title: "Accounting Dashboard", route: "/accounting" }],
  },
  {
    title: "ITR",
    icon: "document-text",
    hasBottomSheet: true,
    calculators: [{ title: "ITR Dashboard", route: "/itr" }],
  },
  {
    title: "GST",
    icon: "document-text",
    hasBottomSheet: true,
    calculators: [{ title: "GST Dashboard", route: "/gst" }],
  },
  
  {
    title: "Bank",
    icon: "business",
    hasBottomSheet: true,
    calculators: [
      {
        title: "Simple Interest Calculator",
        route: "/simple-interest-calculator",
      },
      {
        title: "Compound Interest Calculator",
        route: "/compound-interest-calculator",
      },
    ],
  },
  {
    title: "GST",
    icon: "calculator",
    hasBottomSheet: true,
    calculators: [{ title: "GST Calculator", route: "/gst-calculator" }],
  },
  {
    title: "Business Loan",
    icon: "receipt",
    hasBottomSheet: true,
    calculators: [
      { title: "Business Loan Calculator", route: "/business-loan-calculator" },
    ],
  },
  // { title: 'Income Tax', icon: 'pie-chart', calculators: [{ title: 'Income Tax Calculator', route: null }] },
  {
    title: "Income Tax",
    icon: "pie-chart",
    hasBottomSheet: true,
    calculators: [
      { title: "Depreciation Calculator", route: "/depreciation-calculator" },
      { title: "Tax Calculator", route: "/tax-calculator-screen" },
      { title: "Capital Gain Calculator", route: "/capital-gain-calculator" },
    ],
  },

  {
    title: "EMI",
    icon: "calculator",
    hasBottomSheet: true,
    calculators: [{ title: "EMI Calculator", route: "/emi-calculator" }],
  },
  {
    title: "Advance Tax",
    icon: "document-text",
    hasBottomSheet: true,
    calculators: [
      { title: "Advance Tax Calculator", route: "/advance-tax-calculator" },
    ],
  },
  {
    title: "HRA",
    icon: "home",
    hasBottomSheet: true,
    calculators: [{ title: "HRA Calculator", route: "/hra-calculator" }],
  },
  {
    title: "Loan",
    icon: "cash",
    hasBottomSheet: true,
    calculators: [
      { title: "Car Loan Calculator", route: "/car-loan-calculator" },
      {
        title: "Loan Against Property",
        route: "/loan-against-property-calculator",
      },
      { title: "Home Loan Calculator", route: "/home-loan-calculator" },
      { title: "Personal Loan Calculator", route: "/personal-loan-calculator" },
    ],
  },
  {
    title: "FD",
    icon: "wallet",
    hasBottomSheet: true,
    calculators: [{ title: "FD Calculator", route: "/fd-calculator" }],
  },
  {
    title: "SIP",
    icon: "trending-up",
    hasBottomSheet: true,
    calculators: [{ title: "SIP Calculator", route: "/sip-calculator" }],
  },
  {
    title: "GST Return",
    icon: "file-tray",
    hasBottomSheet: true,
    calculators: [
      { title: "GST Return Calculator", route: "/gst-return-calculator" },
    ],
  },
  {
    title: "TDS",
    icon: "shield-checkmark",
    hasBottomSheet: true,
    calculators: [{ title: "TDS Calculator", route: "/tds-calculator" }],
  },
];

const COLORS = [
  "#EEF2FF",
  "#F0FDF4",
  "#FEF3C7",
  "#FFE4E6",
  "#E0F2FE",
  "#F5F3FF",
];
const ICON_COLORS = [
  "#4F46E5",
  "#16A34A",
  "#F59E0B",
  "#EF4444",
  "#0EA5E9",
  "#8B5CF6",
];

type DashboardTab = "blogs" | "home" | "more" | "tools";

function getFullName(user: ReturnType<typeof useAuthStore.getState>["user"]) {
  if (!user) {
    return "User";
  }

  if (user.fullName?.trim()) {
    return user.fullName.trim();
  }

  return (
    [user.firstName, user.lastName].filter(Boolean).join(" ").trim() || "User"
  );
}

export default function DashboardScreen() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const [activeTab, setActiveTab] = useState<DashboardTab>("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(
    null,
  );
  const [sheetAnim] = useState(() => new Animated.Value(0));
  const insets = useSafeAreaInsets();

  useFocusEffect(
    useCallback(() => {
      setActiveTab("home");
      setSelectedService(null);
      setSearchQuery("");
    }, []),
  );

  const closeCalculatorSheet = useCallback(() => {
    Animated.timing(sheetAnim, {
      duration: 180,
      toValue: 0,
      useNativeDriver: Platform.OS !== "web",
    }).start(({ finished }) => {
      if (finished) {
        setSelectedService(null);
      }
    });
  }, [sheetAnim]);

  const openCalculatorSheet = useCallback(
    (service: ServiceItem) => {
      setSelectedService(service);
      sheetAnim.setValue(0);
      Animated.timing(sheetAnim, {
        duration: 200,
        toValue: 1,
        useNativeDriver: Platform.OS !== "web",
      }).start();
    },
    [sheetAnim],
  );

  const blurActiveElement = useCallback(() => {
    if (Platform.OS !== "web") {
      return;
    }

    const activeElement = globalThis.document
      ?.activeElement as HTMLElement | null;
    activeElement?.blur?.();
    globalThis.document?.body?.focus?.();
  }, []);

  const fullName = getFullName(user);
  const initials =
    fullName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "U";

  const toolsItems: ServiceItem[] = [
    PDF_TOOL, // 👈 yaha add karo
    ALL_SERVICES.find((s) => s.title === "GST")!,
    ALL_SERVICES.find((s) => s.title === "Business Loan")!,
    ALL_SERVICES.find((s) => s.title === "Income Tax")!,
    ALL_SERVICES.find((s) => s.title === "EMI")!,
    ALL_SERVICES.find((s) => s.title === "Advance Tax")!,
  ];

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredServices: ServiceEntry[] = normalizedQuery
    ? ALL_SERVICES.map((service, originalIndex) => ({
        ...service,
        originalIndex,
      })).filter((service) => {
        const matchesService = service.title
          .toLowerCase()
          .includes(normalizedQuery);
        const matchesCalculator = service.calculators.some((calculator) =>
          calculator.title.toLowerCase().includes(normalizedQuery),
        );

        return matchesService || matchesCalculator;
      })
    : ALL_SERVICES.map((service, originalIndex) => ({
        ...service,
        originalIndex,
      }));
  const filteredSelectedService = selectedService
    ? {
        ...selectedService,
        calculators: normalizedQuery
          ? selectedService.calculators.filter((calculator) =>
              calculator.title.toLowerCase().includes(normalizedQuery),
            )
          : selectedService.calculators,
      }
    : null;

  const blogItems = [
    { title: "Tax Saving Tips", subtitle: "Latest article" },
    { title: "GST Filing Guide", subtitle: "Beginner friendly" },
    { title: "ITR Documents", subtitle: "Checklist" },
  ];

  return (
    // <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
     <SafeAreaView style={styles.container} edges={["top"]}>
      {/* <StatusBar backgroundColor="#F5F9FF" style="dark" /> */}
      <DashboardHeader />
      {/* <View
        style={[styles.container, { paddingTop: Math.max(insets.top, 10) }]}
      > */}
      {/* <View style={{ height: 4 }} /> */}
      

        {/* <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: 88 + Math.max(insets.bottom, 6) },
          ]}
          showsVerticalScrollIndicator={false}
        > */}
        <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 80 }}
      >

          <View style={styles.searchBox}>
            <Ionicons name="search" size={18} color="#666" />
            <TextInput
              onChangeText={setSearchQuery}
              placeholder="Search"
              placeholderTextColor="#999"
              style={styles.searchInput}
              value={searchQuery}
            />
          </View>

          <View style={styles.banner}>
            <Image
              accessibilityLabel="Policy banner"
              resizeMode="cover"
              source={require("../../../../assets/images/dashboard.jpeg")}
              style={styles.bannerImage}
            />
          </View>

          {activeTab === "home" ? (
            <>
              <Text style={styles.sectionTitle}>All Calculators</Text>
              <View
                style={[
                  styles.grid,
                  normalizedQuery ? styles.searchGrid : null,
                ]}
              >
                {filteredServices.length > 0 ? (
                  filteredServices.map((item) => (
                    <Pressable
                      key={item.title}
                      onPress={() => {
                        if (item.hasBottomSheet) {
                          openCalculatorSheet(item);
                        }
                      }}
                      style={[
                        styles.card,
                        normalizedQuery ? styles.searchCard : null,
                      ]}
                    >
                      <View
                        style={[
                          styles.iconBox,
                          {
                            backgroundColor:
                              COLORS[item.originalIndex % COLORS.length],
                          },
                        ]}
                      >
                        <Ionicons
                          name={item.icon}
                          size={18}
                          color={
                            ICON_COLORS[item.originalIndex % ICON_COLORS.length]
                          }
                        />
                      </View>

                      <Text style={styles.cardTitle}>{item.title}</Text>
                      <Text style={styles.cardSub}>Calculator</Text>
                    </Pressable>
                  ))
                ) : (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyStateTitle}>No results found</Text>
                    <Text style={styles.emptyStateSub}>
                      Try a different calculator or service name.
                    </Text>
                  </View>
                )}
              </View>
            </>
          ) : null}

          {activeTab === "tools" ? (
            <>
              <Text style={styles.sectionTitle}>Popular Tools</Text>
              <View style={styles.grid}>
                {toolsItems.map((item, index) => (
                  <Pressable
                    key={item.title}
                    onPress={() => {
                      if (item.hasBottomSheet) {
                        openCalculatorSheet(item);
                      }
                    }}
                    style={styles.card}
                  >
                    <View
                      style={[
                        styles.iconBox,
                        { backgroundColor: COLORS[index % COLORS.length] },
                      ]}
                    >
                      <Ionicons
                        name={item.icon}
                        size={18}
                        color={ICON_COLORS[index % ICON_COLORS.length]}
                      />
                    </View>

                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <Text style={styles.cardSub}>Quick Tool</Text>
                  </Pressable>
                ))}
              </View>
            </>
          ) : null}

          {activeTab === "blogs" ? (
            <>
              <Text style={styles.sectionTitle}>Latest Blogs</Text>
              <View style={styles.listSection}>
                {blogItems.map((item) => (
                  <View key={item.title} style={styles.listCard}>
                    <View style={styles.listIcon}>
                      <Ionicons
                        color="#347BE5"
                        name="newspaper-outline"
                        size={18}
                      />
                    </View>
                    <View style={styles.listContent}>
                      <Text style={styles.listTitle}>{item.title}</Text>
                      <Text style={styles.listSubtitle}>{item.subtitle}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </>
          ) : null}

          {activeTab === "more" ? (
            <>
              <Text style={styles.sectionTitle}>More Options</Text>
              <View style={styles.moreSection}>
                <Text style={styles.moreMenuName}>{fullName}</Text>
                <Text style={styles.moreSectionSub}>
                  Manage your profile and session settings from here.
                </Text>

                <Pressable
                  onPress={() => {
                    blurActiveElement();
                    router.push("/help-support");
                  }}
                  style={styles.moreMenuButton}
                >
                  <Text style={styles.moreMenuButtonText}>Help & Support</Text>
                </Pressable>

                <Pressable
                  onPress={() => {
                    blurActiveElement();
                    router.push("/privacy-policy");
                  }}
                  style={styles.moreMenuButton}
                >
                  <Text style={styles.moreMenuButtonText}>Privacy Policy</Text>
                </Pressable>

                <Pressable
                  onPress={() => {
                    blurActiveElement();
                    router.push("/about");
                  }}
                  style={styles.moreMenuButton}
                >
                  <Text style={styles.moreMenuButtonText}>About</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    blurActiveElement();
                    router.push("/pan-scan" as any);
                  }}
                  style={styles.moreMenuButton}
                >
                  <Text style={styles.moreMenuButtonText}>PAN OCR Scan</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    blurActiveElement();
                    router.push("/adhaar-scan" as any);
                  }}
                  style={styles.moreMenuButton}
                >
                  <Text style={styles.moreMenuButtonText}>
                    Aadhaar OCR Scan
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    blurActiveElement();
                    router.push("/excel");
                  }}
                  style={styles.moreMenuButton}
                >
                  <Text style={styles.moreMenuButtonText}>Export Excel</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    blurActiveElement();
                    router.push("/csv");
                  }}
                  style={styles.moreMenuButton}
                >
                  <Text style={styles.moreMenuButtonText}>Export CSV</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    blurActiveElement();
                    router.push("/profile");
                  }}
                  style={styles.moreMenuButton}
                >
                  <Text style={styles.moreMenuButtonText}>Profile</Text>
                </Pressable>

                <Pressable
                  onPress={() => {
                    logout();
                    router.replace("/login");
                  }}
                  style={[styles.moreMenuButton, styles.moreMenuLogout]}
                >
                  <Text
                    style={[
                      styles.moreMenuButtonText,
                      styles.moreMenuLogoutText,
                    ]}
                  >
                    Logout
                  </Text>
                </Pressable>
              </View>
            </>
          ) : null}
        </ScrollView>

        {filteredSelectedService ? (
          <Animated.View
            style={[
              styles.calculatorSheet,
              {
                bottom: Math.max(insets.bottom, 1) + 82,
                opacity: sheetAnim,
                transform: [
                  {
                    translateY: sheetAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [24, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.calculatorSheetHandle} />

            <View style={styles.calculatorSheetHeader}>
              <View>
                <Text style={styles.calculatorSheetTitle}>
                  {filteredSelectedService.title}
                </Text>
                <Text style={styles.calculatorSheetSubtitle}>
                  Available calculators
                </Text>
              </View>

              <Pressable
                onPress={closeCalculatorSheet}
                style={styles.calculatorSheetClose}
              >
                <Ionicons color="#75849C" name="close" size={18} />
              </Pressable>
            </View>

            {filteredSelectedService.calculators.length > 0 ? (
              filteredSelectedService.calculators.map((calculator) => (
                <Pressable
                  key={calculator.title}
                  onPress={() => {
                    blurActiveElement();
                    if (calculator.route) {
                      const route = calculator.route;
                      setSelectedService(null);
                      globalThis.requestAnimationFrame(() => {
                        router.push(route as never);
                      });
                    } else {
                      closeCalculatorSheet();
                    }
                  }}
                  style={styles.calculatorSheetItem}
                >
                  <View style={styles.calculatorSheetItemIcon}>
                    <Ionicons
                      color="#347BE5"
                      name="calculator-outline"
                      size={16}
                    />
                  </View>
                  <View style={styles.calculatorSheetItemContent}>
                    <Text style={styles.calculatorSheetItemTitle}>
                      {calculator.title}
                    </Text>
                    <Text style={styles.calculatorSheetItemSub}>
                      {calculator.route ? "Tap to open" : "Coming soon"}
                    </Text>
                  </View>
                  <Ionicons color="#A2AEC0" name="chevron-forward" size={16} />
                </Pressable>
              ))
            ) : (
              <View style={styles.emptySheetState}>
                <Text style={styles.emptyStateTitle}>
                  No matching calculators
                </Text>
                <Text style={styles.emptyStateSub}>
                  Clear the search to see all options again.
                </Text>
              </View>
            )}
          </Animated.View>
        ) : null}

        <View
          style={[styles.bottomNav, { bottom: Math.max(insets.bottom, 1) }]}
        >
          <Pressable
            onPress={() => setActiveTab("home")}
            style={styles.bottomItem}
          >
            <View
              style={[
                styles.bottomIconWrap,
                activeTab === "home" && styles.bottomIconWrapActive,
              ]}
            >
              <Ionicons
                color={activeTab === "home" ? "#347BE5" : "#94A3B8"}
                name="home"
                size={20}
              />
            </View>
            <Text
              style={[
                styles.bottomText,
                activeTab === "home" && styles.bottomTextActive,
              ]}
            >
              Home
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setActiveTab("tools")}
            style={styles.bottomItem}
          >
            <View
              style={[
                styles.bottomIconWrap,
                activeTab === "tools" && styles.bottomIconWrapActive,
              ]}
            >
              <Ionicons
                color={activeTab === "tools" ? "#347BE5" : "#94A3B8"}
                name="construct-outline"
                size={20}
              />
            </View>
            <Text
              style={[
                styles.bottomText,
                activeTab === "tools" && styles.bottomTextActive,
              ]}
            >
              Tools
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setActiveTab("blogs")}
            style={styles.bottomItem}
          >
            <View
              style={[
                styles.bottomIconWrap,
                activeTab === "blogs" && styles.bottomIconWrapActive,
              ]}
            >
              <Ionicons
                color={activeTab === "blogs" ? "#347BE5" : "#94A3B8"}
                name="newspaper-outline"
                size={20}
              />
            </View>
            <Text
              style={[
                styles.bottomText,
                activeTab === "blogs" && styles.bottomTextActive,
              ]}
            >
              Blogs
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setActiveTab("more")}
            style={styles.bottomItem}
          >
            <View
              style={[
                styles.bottomIconWrap,
                activeTab === "more" && styles.bottomIconWrapActive,
              ]}
            >
              <Ionicons
                color={activeTab === "more" ? "#347BE5" : "#94A3B8"}
                name="menu-outline"
                size={20}
              />
            </View>
            <Text
              style={[
                styles.bottomText,
                activeTab === "more" && styles.bottomTextActive,
              ]}
            >
              More
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
  );
}
