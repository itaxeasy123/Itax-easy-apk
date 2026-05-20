import { Platform, Alert } from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

type ExportableData = Record<string, unknown>;

function buildFilename() {
  return `ITR_Calculation_${Date.now()}.json`;
}

function buildJsonPayload(data: ExportableData) {
  return JSON.stringify(data, null, 2);
}

function triggerWebDownload(filename: string, jsonString: string) {
  if (typeof document === "undefined") {
    throw new Error("Web download is not available in this environment.");
  }

  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.style.display = "none";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function saveToAppStorage(filename: string, jsonString: string) {
  const dir = FileSystem.documentDirectory || FileSystem.cacheDirectory;

  if (!dir) {
    throw new Error("Device storage is not available.");
  }

  const fileUri = `${dir}${filename}`;
  await FileSystem.writeAsStringAsync(fileUri, jsonString, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  return fileUri;
}

async function saveOnAndroid(filename: string, jsonString: string) {
  try {
    const permission = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

    if (permission.granted && permission.directoryUri) {
      const targetUri = await FileSystem.StorageAccessFramework.createFileAsync(
        permission.directoryUri,
        filename.replace(/\.json$/i, ""),
        "application/json",
      );

      await FileSystem.writeAsStringAsync(targetUri, jsonString, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      return targetUri;
    }
  } catch (error) {
    console.warn("SAF export failed, falling back to app storage:", error);
  }

  const fallbackUri = await saveToAppStorage(filename, jsonString);

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(fallbackUri, {
      mimeType: "application/json",
      dialogTitle: "Export ITR JSON",
      UTI: "public.json",
    });
  }

  return fallbackUri;
}

async function saveOnIOS(filename: string, jsonString: string) {
  const fileUri = await saveToAppStorage(filename, jsonString);

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(fileUri, {
      mimeType: "application/json",
      dialogTitle: "Export ITR JSON",
      UTI: "public.json",
    });
  }

  return fileUri;
}

export const exportITRData = async (data: ExportableData) => {
  try {
    const filename = buildFilename();
    const jsonString = buildJsonPayload(data);

    if (Platform.OS === "web") {
      triggerWebDownload(filename, jsonString);
      return;
    }

    if (Platform.OS === "android") {
      await saveOnAndroid(filename, jsonString);
      Alert.alert("Export complete", "JSON file saved successfully.");
      return;
    }

    await saveOnIOS(filename, jsonString);
    Alert.alert("Export complete", "JSON file saved successfully.");
  } catch (error) {
    console.error("Export Error:", error);
    Alert.alert("Error", "Failed to export JSON file.");
    throw error;
  }
};
