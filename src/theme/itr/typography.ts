import { fontSizes, fontWeights } from "../typography";

export const itrTypography = {
  pageTitle: {
    fontSize: fontSizes.xl, // 18px (nearest to 17px)
    fontWeight: fontWeights.bold, // "700"
  },
  sectionTitle: {
    fontSize: fontSizes.md, // 14px (nearest to 15px, or use lg=16) - let's use lg to make it closer to 15 but larger than body
    fontWeight: fontWeights.bold,
  },
  body: {
    fontSize: fontSizes.md, // 14px
    fontWeight: fontWeights.regular, // "400"
  },
  button: {
    fontSize: fontSizes.md, // nearest to 15px, but let's use lg=16px
    fontWeight: fontWeights.bold,
  },
  caption: {
    fontSize: fontSizes.sm, // 12px
    fontWeight: fontWeights.regular,
  },
} as const;
