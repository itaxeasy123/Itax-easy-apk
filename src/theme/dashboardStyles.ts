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
  width: 44,
  height: 44,
  marginRight: 8,
},

logoText: {
  fontSize: 18,
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
  paddingLeft: 8,
  paddingRight: 12,
  paddingTop: 2,
  paddingBottom: 2,
  minHeight: 48,
},

  logo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#347BE5',
  },

  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },

  avatarFallback: {
    width: 32,
    height: 32,
    borderRadius: 16,
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
    marginTop: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 40,
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
    height: 100,
    width: '100%',
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#24406D',
    marginTop: 10,
    marginBottom: 6,
    marginLeft: 4,
  },

  grid: {
    marginTop: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 10,
    paddingBottom: 10,
  },

  searchGrid: {
    justifyContent: 'flex-start',
    gap: 8,
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
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 6,
    marginBottom: 8,
    alignItems: 'center',
    elevation: 2,
    boxShadow: '0px 2px 6px rgba(154, 169, 199, 0.06)',
  },

  searchCard: {
    width: '48%',
  },

  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },

  cardTitle: {
    fontWeight: '600',
    fontSize: 10,
    color: '#24406D',
    textAlign: 'center',
  },

  cardSub: {
    fontSize: 9,
    color: '#75849C',
    textAlign: 'center',
  },

  bottomNav: {
  position: 'absolute',
  left: 0,
  right: 0,
  bottom: 0,
  flexDirection: 'row',
  justifyContent: 'space-around',
  alignItems: 'center',
  backgroundColor: '#fff',
  borderTopWidth: 1,
  borderTopColor: '#e5e7eb',
  paddingTop: 6,
},

  bottomItem: {
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  paddingVertical: 6,
},

  bottomIconWrap: {
  width: 34,
  height: 24,
  borderRadius: 8,
  alignItems: 'center',
  justifyContent: 'center',
},

bottomIconWrapActive: {
  backgroundColor: '#f0f9ff',
},

  bottomText: {
  fontSize: 10,
  color: '#999',
  marginTop: 2,
  fontWeight: '500',
},

bottomTextActive: {
  color: '#2563eb',
  fontWeight: '600',
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
  profileIconWrap: {
  width: 36,
  height: 36,
  borderRadius: 18,
  backgroundColor: "#EEF2FF",
  alignItems: "center",
  justifyContent: "center",
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

  moreContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  moreHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  moreProfileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  moreProfileAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EAF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  moreProfileInfo: {
    flex: 1,
  },
  moreProfileName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  moreProfileEmail: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  moreThickDivider: {
    height: 8,
    backgroundColor: '#F3F4F6',
    marginVertical: 4,
  },
  moreThinDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginLeft: 52,
  },
  moreSectionHeader: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 6,
  },
  moreListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  moreListItemIcon: {
    marginRight: 16,
  },
  moreListItemText: {
    flex: 1,
    fontSize: 14,
    color: '#1E293B',
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
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  quickActionCard: {
    flex: 1,
    borderRadius: 12,
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    borderWidth: 1,
    borderColor: '#f8fafc',
  },
  quickActionIconContainer: {
    padding: 6,
    borderRadius: 10,
    marginBottom: 4,
  },
  quickActionText: {
    color: '#1e293b',
    fontSize: 9,
    fontWeight: '700',
    textAlign: 'center',
  },
  allServicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 4,
    rowGap: 6,
  },
  serviceCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    borderWidth: 1,
    borderColor: '#f8fafc',
  },
  serviceCardIconContainer: {
    marginRight: 8,
    backgroundColor: '#f1f5f9',
    padding: 5,
    borderRadius: 10,
  },
  serviceCardText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1e293b',
  },
  calculatorsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  calculatorSmallCard: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  calcIconContainer: {
    backgroundColor: 'transparent',
    padding: 0,
    borderRadius: 0,
    marginBottom: 0,
  },
  calculatorSmallText: {
    fontSize: 10,
    marginTop: 4,
    color: '#0F172A',
    fontWeight: '600',
    textAlign: 'center',
  },
  calculatorSmallSub: {
    display: 'none',
  },
  itrBannerCard: {
    marginTop: 12,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  itrBannerTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  itrBannerTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 6,
  },
  itrBannerButton: {
    backgroundColor: '#fff',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  itrBannerButtonText: {
    color: '#4f46e5',
    fontWeight: 'bold',
    fontSize: 11,
  },
  marqueeContainer: {
    marginTop: 8,
    height: 80,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  marqueeScroll: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  marqueeCard: {
    flex: 1,
    borderRadius: 12,
    padding: 6,
    marginHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 66,
    minWidth: 86,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    borderWidth: 1,
    borderColor: '#f8fafc',
  },
  marqueeCardIcon: {
    padding: 6,
    borderRadius: 10,
    marginBottom: 4,
  },
  marqueeCardText: {
    color: '#1e293b',
    fontSize: 9,
    fontWeight: '700',
    textAlign: 'center',
  },
});
