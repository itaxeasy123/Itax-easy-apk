import React, { memo } from "react";

import {
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  Ionicons,
} from "@expo/vector-icons";

import {
  GSTBusinessProfile,
} from "../types/gstProfile.types";

interface GSTBusinessProfileCardProps {
  profile: GSTBusinessProfile;

  onPress?: () => void;
}

const GSTBusinessProfileCard = ({
  profile,
  onPress,
}: GSTBusinessProfileCardProps) => {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      className="
        mx-4
        mt-4
        rounded-[24px]
        bg-[#DDE9D8]
        p-4
      "
    >
      <View
        className="
          flex-row
          items-center
          justify-between
        "
      >
        {/* LEFT SECTION */}

        <View
          className="
            flex-1
            flex-row
            items-center
          "
        >
          {/* PROFILE ICON */}

          <View
            className="
              h-[72px]
              w-[72px]
              items-center
              justify-center
              rounded-full
              bg-[#3E7BFA]
            "
          >
            <Ionicons
              name="person"
              size={34}
              color="#FFFFFF"
            />
          </View>

          {/* PROFILE CONTENT */}

          <View className="ml-4 flex-1">
            {/* ID */}

            <View
              className="
                mb-1
                flex-row
                items-center
              "
            >
              <Text
                className="
                  w-[80px]
                  text-[18px]
                  font-bold
                  text-[#1F2937]
                "
              >
                ID
              </Text>

              <Text
                numberOfLines={1}
                className="
                  flex-1
                  text-[18px]
                  font-semibold
                  text-[#374151]
                "
              >
                : {profile?.id || "N/A"}
              </Text>
            </View>

            {/* GSTIN */}

            <View
              className="
                mb-2
                flex-row
                items-center
              "
            >
              <Text
                className="
                  w-[80px]
                  text-[18px]
                  font-bold
                  text-[#1F2937]
                "
              >
                GSTIN
              </Text>

              <Text
                numberOfLines={1}
                className="
                  flex-1
                  text-[18px]
                  font-semibold
                  text-[#374151]
                "
              >
                : {profile?.gstin || "N/A"}
              </Text>
            </View>

            {/* FINANCIAL YEAR */}

            <Text
              className="
                text-[18px]
                font-bold
                text-[#1F2937]
              "
            >
              Financial year :
              <Text
                className="
                  font-semibold
                  text-[#374151]
                "
              >
                {" "}
                {profile?.financialYear ||
                  "N/A"}
              </Text>
            </Text>
          </View>
        </View>

        {/* RIGHT ARROW */}

        <Ionicons
          name="chevron-forward"
          size={28}
          color="#111827"
        />
      </View>
    </TouchableOpacity>
  );
};

export default memo(
  GSTBusinessProfileCard
);