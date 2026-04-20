import AsyncStorage from "@react-native-async-storage/async-storage";

// ==============================
// 🔑 STORAGE KEYS (Centralized)
// ==============================
export const STORAGE_KEYS = {
  TAX_DATA: "tax_data",
  USER_PROFILE: "user_profile",
  TOKEN: "auth_token",
};

// ==============================
// 🧠 GENERIC SET ITEM
// ==============================
export const setItem = async (key: string, value: any) => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (error) {
    console.error("Storage SET Error:", error);
    throw error;
  }
};

// ==============================
// 📦 GENERIC GET ITEM
// ==============================
export const getItem = async (key: string) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error("Storage GET Error:", error);
    return null;
  }
};

// ==============================
// ❌ REMOVE ITEM
// ==============================
export const removeItem = async (key: string) => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error("Storage REMOVE Error:", error);
  }
};

// ==============================
// 🧹 CLEAR ALL STORAGE
// ==============================
export const clearStorage = async () => {
  try {
    await AsyncStorage.clear();
  } catch (error) {
    console.error("Storage CLEAR Error:", error);
  }
};


// =====================================
// 💰 TAX DATA (SPECIALIZED METHODS)
// =====================================

export const saveTaxData = async (data: any) => {
  await setItem(STORAGE_KEYS.TAX_DATA, data);
};

export const getTaxData = async () => {
  return await getItem(STORAGE_KEYS.TAX_DATA);
};


// =====================================
// 👤 USER PROFILE (OCR AUTO-FILL)
// =====================================

export const saveUserProfile = async (data: any) => {
  await setItem(STORAGE_KEYS.USER_PROFILE, data);
};

export const getUserProfile = async () => {
  return await getItem(STORAGE_KEYS.USER_PROFILE);
};


// =====================================
// 🔐 TOKEN MANAGEMENT (LOGIN)
// =====================================

export const saveToken = async (token: string) => {
  await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token);
};

export const getToken = async () => {
  return await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
};

export const removeToken = async () => {
  await AsyncStorage.removeItem(STORAGE_KEYS.TOKEN);
};