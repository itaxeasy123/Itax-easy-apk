import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F9FF',
  },
  logoContainer: {
  flexDirection: "row",
  alignItems: "center",
},

logoImage: {
  width: 60,     // 🔥 bigger logo
  height: 60,
  marginRight: 10,
},

logoText: {
  fontSize: 20,
  fontWeight: "800",
  color: "#0F172A",
},
  container: {
    flex: 1,
    backgroundColor: '#F5F9FF',
    paddingHorizontal: 16,
  },

  scrollContent: {
    paddingBottom: 96,
  },

  // header: {
  //   flexDirection: 'row',
  //   justifyContent: 'space-between',
  //   alignItems: 'center',
  // },
 
header: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  paddingHorizontal: 14,
  paddingTop: 2,
  paddingBottom: 4,
  // marginTop: -2, // 🔥 THIS FIXES YOUR GAP
},

  logo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#347BE5',
  },

  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },

  avatarFallback: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EAF2FF',
  },

  avatarFallbackText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#347BE5',
  },

  searchBox: {
    marginTop: 16,
    backgroundColor: '#fff',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 1,
    borderColor: '#DDE5EF',
    elevation: 3,
    boxShadow: '0px 3px 8px rgba(154, 169, 199, 0.05)',
  },

  searchInput: {
    marginLeft: 10,
    flex: 1,
    color: '#111',
  },

  banner: {
    marginTop: 16,
    borderRadius: 18,
    overflow: 'hidden',
  },

  bannerImage: {
    height: 116,
    width: '100%',
  },

  sectionTitle: {
    marginTop: 20,
    fontSize: 16,
    fontWeight: '600',
    color: '#24406D',
  },

  grid: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 20,
  },

  searchGrid: {
    justifyContent: 'flex-start',
    gap: 12,
  },

  emptyState: {
    backgroundColor: '#FFFFFF',
    borderColor: '#DDE5EF',
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 18,
    width: '100%',
    elevation: 4,
    boxShadow: '0px 6px 16px rgba(154, 169, 199, 0.08)',
  },

  emptySheetState: {
    alignItems: 'center',
    paddingVertical: 20,
  },

  emptyStateTitle: {
    color: '#24406D',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },

  emptyStateSub: {
    color: '#75849C',
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
  },

  card: {
    width: '31%',
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 10,
    marginBottom: 12,
    alignItems: 'center',
    elevation: 4,
    boxShadow: '0px 6px 16px rgba(154, 169, 199, 0.08)',
  },

  searchCard: {
    width: '48%',
  },

  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },

  cardTitle: {
    fontWeight: '600',
    fontSize: 13,
    color: '#24406D',
    textAlign: 'center',
  },

  cardSub: {
    fontSize: 11,
    color: '#75849C',
    textAlign: 'center',
  },

  bottomNav: {
    position:'static',
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#DDE5EF',
    elevation: 6,
    boxShadow: '0px 6px 16px rgba(154, 169, 199, 0.08)',
  },

  bottomItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  bottomIconWrap: {
    width: 38,
    height: 28,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  bottomIconWrapActive: {
    backgroundColor: '#EAF2FF',
  },

  bottomText: {
    marginTop: 4,
    fontSize: 10,
    color: '#75849C',
    fontWeight: '500',
  },

  bottomTextActive: {
    color: '#111111',
  },

  calculatorSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    borderWidth: 1,
    borderColor: '#DDE5EF',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 16,
    elevation: 8,
    boxShadow: '0px 10px 24px rgba(154, 169, 199, 0.12)',
  },

  calculatorSheetHandle: {
    alignSelf: 'center',
    width: 42,
    height: 4,
    borderRadius: 999,
    backgroundColor: '#D7E1F0',
    marginBottom: 12,
  },

  calculatorSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },

  calculatorSheetTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#24406D',
  },

  calculatorSheetSubtitle: {
    marginTop: 4,
    fontSize: 11,
    color: '#75849C',
  },

  calculatorSheetClose: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F6FAFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  calculatorSheetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DDE5EF',
    paddingHorizontal: 12,
    paddingVertical: 11,
    marginTop: 10,
    backgroundColor: '#FFFFFF',
  },

  calculatorSheetItemIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#EAF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  calculatorSheetItemContent: {
    flex: 1,
  },

  calculatorSheetItemTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#24406D',
  },

  calculatorSheetItemSub: {
    marginTop: 3,
    fontSize: 10,
    color: '#75849C',
  },

  moreMenu: {
    width: 152,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DDE5EF',
    padding: 10,
    elevation: 6,
    boxShadow: '0px 6px 16px rgba(154, 169, 199, 0.08)',
  },

  moreSection: {
    marginTop: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#DDE5EF',
    padding: 16,
    elevation: 4,
    boxShadow: '0px 6px 16px rgba(154, 169, 199, 0.08)',
  },

  moreMenuName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#24406D',
    marginBottom: 6,
  },

  moreSectionSub: {
    color: '#75849C',
    fontSize: 12,
    marginBottom: 8,
  },

  moreMenuButton: {
    backgroundColor: '#EAF2FF',
    borderRadius: 10,
    paddingVertical: 9,
    marginTop: 6,
  },

  moreMenuButtonText: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#347BE5',
  },

  moreMenuLogout: {
    backgroundColor: '#FEF2F2',
  },

  moreMenuLogoutText: {
    color: '#DC2626',
  },

  listSection: {
    marginTop: 12,
    gap: 12,
  },

  listCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#DDE5EF',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 4,
    boxShadow: '0px 6px 16px rgba(154, 169, 199, 0.08)',
  },

  listIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EAF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  listContent: {
    flex: 1,
  },

  listTitle: {
    color: '#24406D',
    fontSize: 14,
    fontWeight: '600',
  },

  listSubtitle: {
    color: '#75849C',
    fontSize: 11,
    marginTop: 4,
  },
});
