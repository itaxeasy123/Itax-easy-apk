import {
  BusinessProfileResponse,
  GSTBusinessProfile,
} from "../types/gstProfile.types";

export const mapBusinessProfileToGSTProfile = (
  businessProfile: BusinessProfileResponse
): GSTBusinessProfile => {
  return {
    id:
      businessProfile?.businessName?.trim() ||
      "N/A",

    gstin:
      businessProfile?.gstinNumber?.trim() ||
      "N/A",

    financialYear:
      businessProfile?.financialYear ||
      "2024-25",
  };
};