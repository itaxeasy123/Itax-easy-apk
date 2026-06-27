import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

export const getStorage = () => {
  if (Platform.OS === "web") {
    if (typeof window !== "undefined" && window.localStorage) {
      return window.localStorage as any;
    }
  }
  return AsyncStorage;
};
