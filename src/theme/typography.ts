// export const typography = {
//   title: {
//     fontSize: 22,
//     fontWeight: "700" as const,
//   },

//   subtitle: {
//     fontSize: 14,
//     fontWeight: "400" as const,
//   },

//   body: {
//     fontSize: 14,
//     fontWeight: "400" as const,
//   },

//   button: {
//     fontSize: 16,
//     fontWeight: "600" as const,
//   },

//   caption: {
//     fontSize: 12,
//     fontWeight: "400" as const,
//   },
// };

export const fontSizes = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 22,
} as const;

export const fontWeights = {
  regular: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
} as const;

export const typography = {
  title: {
    fontSize: fontSizes.xxl,
    fontWeight: fontWeights.bold,
  },

  subtitle: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.regular,
  },

  body: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.regular,
  },

  button: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
  },

  caption: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.regular,
  },
} as const;