import { create } from "zustand";

import {
  GSTBusinessProfile,
} from "../types/gstProfile.types";

interface GSTBusinessProfileStore {
  businessProfile: GSTBusinessProfile;

  setBusinessProfile: (
    profile: GSTBusinessProfile
  ) => void;
}

export const useGSTBusinessProfileStore =
  create<GSTBusinessProfileStore>(
    (set) => ({
      businessProfile: {
        id: "",
        gstin: "",
        financialYear: "",
      },

      setBusinessProfile: (
        profile
      ) =>
        set({
          businessProfile: profile,
        }),
    })
  );