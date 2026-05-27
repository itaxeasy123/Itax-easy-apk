import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useState, useEffect, useRef } from "react";
import {
  Animated,
  Easing,
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

const OCR_TOOL: ServiceItem = {
  title: "OCR Scanner",
  icon: "scan",
  hasBottomSheet: true,
  calculators: [
    { title: "PAN OCR Scan", route: "/pan-scan" },
    { title: "Aadhaar OCR Scan", route: "/adhaar-scan" },
  ],
};

const REPORTS_MARQUEE = [
  { title: "Monthly Reports", icon: "calendar", route: "/accounting/reports", colors: ['#ec4899', '#be185d'] as const },
  { title: "Daybook", icon: "book", route: "/accounting/daybook", colors: ['#f59e0b', '#b45309'] as const },
  { title: "Profit & Loss", icon: "trending-up", route: "/accounting/reports-profit-loss", colors: ['#10b981', '#047857'] as const },
  { title: "Balance Sheet", icon: "reader", route: "/accounting/reports-balance-sheet", colors: ['#3b82f6', '#1d4ed8'] as const },
];

function MarqueeBanner({ onNavigate }: { onNavigate: (route: string) => void }) {
  const scrollX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let animation: Animated.CompositeAnimation;
    const startAnimation = () => {
      scrollX.setValue(0);
      animation = Animated.timing(scrollX, {
        toValue: -480, // roughly 4 items * 120 width
        duration: 12000,
        easing: Easing.linear,
        useNativeDriver: true,
      });
      animation.start(({ finished }) => {
        if (finished) {
          startAnimation();
        }
      });
    };
    startAnimation();
    return () => animation?.stop();
  }, [scrollX]);

  const marqueeItems = [...REPORTS_MARQUEE, ...REPORTS_MARQUEE, ...REPORTS_MARQUEE];

  return (
    <View style={styles.marqueeContainer}>
      <Animated.View style={[styles.marqueeScroll, { transform: [{ translateX: scrollX }] }]}>
        {marqueeItems.map((item, index) => (
          <Pressable key={index} onPress={() => onNavigate(item.route)}>
            <View style={styles.marqueeCard}>
              <LinearGradient colors={item.colors as any} style={styles.marqueeCardIcon}>
                <Ionicons name={item.icon as any} size={22} color="#fff" />
              </LinearGradient>
              <Text style={styles.marqueeCardText}>{item.title}</Text>
            </View>
          </Pressable>
        ))}
      </Animated.View>
    </View>
  );
}

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

  const quickActionsItems = [
    { title: 'ITR Filing', colors: ['#3b82f6', '#1d4ed8'], icon: 'document-text', route: '/itr' },
    { title: 'GST Return', colors: ['#2dd4bf', '#0f766e'], icon: 'file-tray', route: '' },
    { title: 'Create Invoice', colors: ['#a855f7', '#6b21a8'], icon: 'receipt', route: '/accounting' }
  ];

  const allServicesItems = [
    { title: 'ITR Filing', icon: 'document-text', color: '#3b82f6', route: '/itr' },
    { title: 'GST Return', icon: 'file-tray', color: '#2dd4bf', route: '' },
    { title: 'E-Invoice', icon: 'flash', color: '#f59e0b', route: '/accounting' },
    { title: 'Invoice', icon: 'receipt', color: '#a855f7', route: '/accounting' },
    { title: 'Converter', icon: 'sync', color: '#2dd4bf', isTool: PDF_TOOL },
    { title: 'OCR', icon: 'scan', color: '#3b82f6', isTool: OCR_TOOL },
  ];

  const calculatorToolsItems = [
    { title: 'Bank Calculator', searchTitle: 'Bank', icon: 'business', sub: 'Quick financial calculations' },
    { title: 'Income Tax', searchTitle: 'Income Tax', icon: 'pie-chart', sub: 'Quick financial calculations' },
    { title: 'GST Calculator', searchTitle: 'GST', icon: 'calculator', sub: 'Quick financial calculations' },
  ];

  const isMatch = (title: string, searchTitle?: string) => !normalizedQuery || title.toLowerCase().includes(normalizedQuery) || (searchTitle && searchTitle.toLowerCase().includes(normalizedQuery));

  const filteredQA = quickActionsItems.filter(q => isMatch(q.title));
  const filteredAS = allServicesItems.filter(s => isMatch(s.title));
  const filteredCT = calculatorToolsItems.filter(c => isMatch(c.title, c.searchTitle));

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
        contentContainerStyle={{ paddingBottom: 120 }}
      >

          <View style={styles.searchBox}>
            <Ionicons name="search" size={18} color="#666" />
            <TextInput
              onChangeText={(text) => {
                setSearchQuery(text);
                if (text.trim() && activeTab !== "home" && activeTab !== "tools" && activeTab !== "more") {
                  setActiveTab("home");
                }
              }}
              placeholder="Search"
              placeholderTextColor="#999"
              style={styles.searchInput}
              value={searchQuery}
            />
          </View>

          <MarqueeBanner onNavigate={(route) => { blurActiveElement(); globalThis.requestAnimationFrame(() => router.navigate(route as any)); }} />

          {activeTab === "home" ? (
            <>
              {filteredQA.length > 0 && (
                <>
                  <Text style={styles.sectionTitle}>Quick Actions</Text>
                  <View style={styles.quickActionsContainer}>
                    {filteredQA.map((item, idx) => (
                      <Pressable key={idx} style={{ flex: 1 }} onPress={() => { if (item.route) { blurActiveElement(); globalThis.requestAnimationFrame(() => router.navigate(item.route as any)); } }}>
                        <View style={styles.quickActionCard}>
                          <LinearGradient colors={item.colors as any} style={styles.quickActionIconContainer}>
                            <Ionicons name={item.icon as any} size={22} color="#fff" />
                          </LinearGradient>
                          <Text style={styles.quickActionText}>{item.title}</Text>
                        </View>
                      </Pressable>
                    ))}
                  </View>
                </>
              )}

              {filteredAS.length > 0 && (
                <>
                  <Text style={styles.sectionTitle}>All Services</Text>
                  <View style={styles.allServicesGrid}>
                    {filteredAS.map((item, idx) => (
                      <Pressable key={idx} style={styles.serviceCard} onPress={() => {
                        if (item.isTool) openCalculatorSheet(item.isTool);
                        else if (item.route) { blurActiveElement(); globalThis.requestAnimationFrame(() => router.navigate(item.route as any)); }
                      }}>
                        <View style={styles.serviceCardIconContainer}><Ionicons name={item.icon as any} size={20} color={item.color} /></View>
                        <Text style={styles.serviceCardText}>{item.title}</Text>
                      </Pressable>
                    ))}
                  </View>
                </>
              )}

              {filteredCT.length > 0 && (
                <>
                  <Pressable onPress={() => setActiveTab("tools")}>
                    <Text style={styles.sectionTitle}>Calculators & Tools</Text>
                  </Pressable>
                  <View style={styles.calculatorsRow}>
                    {filteredCT.map((item, idx) => (
                      <Pressable key={idx} style={styles.calculatorSmallCard} onPress={() => {
                        const tool = ALL_SERVICES.find(s => s.title === item.searchTitle);
                        if (tool) openCalculatorSheet(tool);
                      }}>
                        <View style={styles.calcIconContainer}>
                          <Ionicons name={item.icon as any} size={22} color="#3b82f6" />
                        </View>
                        <Text style={styles.calculatorSmallText}>{item.title}</Text>
                        <Text style={styles.calculatorSmallSub}>{item.sub}</Text>
                      </Pressable>
                    ))}
                  </View>
                </>
              )}

              {!normalizedQuery && (
                <LinearGradient colors={['#3b82f6', '#6366f1', '#a855f7']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.itrBannerCard}>
                  <Ionicons name="rocket" size={40} color="#fff" />
                  <View style={styles.itrBannerTextContainer}>
                    <Text style={styles.itrBannerTitle}>File your ITR in just 3 minutes!</Text>
                    <Pressable style={styles.itrBannerButton} onPress={() => { blurActiveElement(); globalThis.requestAnimationFrame(() => router.navigate('/itr')); }}>
                      <Text style={styles.itrBannerButtonText}>Get Started</Text>
                    </Pressable>
                  </View>
                </LinearGradient>
              )}

              {normalizedQuery && filteredQA.length === 0 && filteredAS.length === 0 && filteredCT.length === 0 && (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateTitle}>No results found</Text>
                  <Text style={styles.emptyStateSub}>Try a different calculator or service name.</Text>
                </View>
              )}
            </>
          ) : null}

          {activeTab === "tools" ? (
            <>
              <Text style={styles.sectionTitle}>All Calculators & Tools</Text>
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
                      {item.title !== "Accounting" && item.title !== "ITR" && item.title !== "PDF Toolkit" && (
                        <Text style={styles.cardSub}>Calculator</Text>
                      )}
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

          {activeTab === "more" ? (
            <>
              <Text style={styles.sectionTitle}>More Options</Text>
              <View style={styles.moreSection}>
                {!normalizedQuery && (
                  <>
                    <Text style={styles.moreMenuName}>{fullName}</Text>
                    <Text style={styles.moreSectionSub}>
                      Manage your profile and session settings from here.
                    </Text>
                  </>
                )}

                {[
                  { title: "Help & Support", route: "/help-support" as any },
                  { title: "Privacy Policy", route: "/privacy-policy" as any },
                  { title: "About", route: "/about" as any },
                  { title: "PAN OCR Scan", route: "/pan-scan" as any },
                  { title: "Aadhaar OCR Scan", route: "/adhaar-scan" as any },
                  { title: "Export Excel", route: "/excel" as any },
                  { title: "Export CSV", route: "/csv" as any },
                  { title: "Profile", route: "/profile" as any },
                  { title: "Logout", action: () => { logout(); router.replace("/login"); } }
                ]
                  .filter(item => !normalizedQuery || item.title.toLowerCase().includes(normalizedQuery))
                  .map((item, index) => (
                    <Pressable
                      key={index}
                      onPress={() => {
                        blurActiveElement();
                        if (item.action) {
                          item.action();
                        } else if (item.route) {
                          router.navigate(item.route);
                        }
                      }}
                      style={[
                        styles.moreMenuButton,
                        item.title === "Logout" ? styles.moreMenuLogout : null
                      ]}
                    >
                      <Text
                        style={[
                          styles.moreMenuButtonText,
                          item.title === "Logout" ? styles.moreMenuLogoutText : null
                        ]}
                      >
                        {item.title}
                      </Text>
                    </Pressable>
                  ))}

                  {normalizedQuery && [
                    { title: "Help & Support", route: "/help-support" as any },
                    { title: "Privacy Policy", route: "/privacy-policy" as any },
                    { title: "About", route: "/about" as any },
                    { title: "PAN OCR Scan", route: "/pan-scan" as any },
                    { title: "Aadhaar OCR Scan", route: "/adhaar-scan" as any },
                    { title: "Export Excel", route: "/excel" as any },
                    { title: "Export CSV", route: "/csv" as any },
                    { title: "Profile", route: "/profile" as any },
                    { title: "Logout", action: () => { logout(); router.replace("/login"); } }
                  ].filter(item => item.title.toLowerCase().includes(normalizedQuery)).length === 0 && (
                    <View style={styles.emptyState}>
                      <Text style={styles.emptyStateTitle}>No results found</Text>
                      <Text style={styles.emptyStateSub}>No options match your search.</Text>
                    </View>
                  )}
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
                        router.navigate(route as never);
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
          style={[styles.bottomNav, { paddingBottom: Math.max(insets.bottom, 6) }]}
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
