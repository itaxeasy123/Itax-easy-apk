import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { PDFDocument } from "pdf-lib/dist/pdf-lib.esm.min.js";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";
import PdfToolLayout from "../components/PdfToolLayout";

function base64ToBytes(base64: string) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
  const clean = base64.replace(/[^A-Za-z0-9+/=]/g, "");
  const output: number[] = [];

  for (let i = 0; i < clean.length; i += 4) {
    const enc1 = chars.indexOf(clean[i]);
    const enc2 = chars.indexOf(clean[i + 1]);
    const enc3 = chars.indexOf(clean[i + 2]);
    const enc4 = chars.indexOf(clean[i + 3]);

    const chr1 = (enc1 << 2) | (enc2 >> 4);
    const chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
    const chr3 = ((enc3 & 3) << 6) | enc4;

    output.push(chr1);

    if (enc3 !== 64) {
      output.push(chr2);
    }

    if (enc4 !== 64) {
      output.push(chr3);
    }
  }

  return Uint8Array.from(output);
}

function bytesToBase64(bytes: Uint8Array) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  let output = "";

  for (let i = 0; i < bytes.length; i += 3) {
    const byte1 = bytes[i];
    const byte2 = i + 1 < bytes.length ? bytes[i + 1] : 0;
    const byte3 = i + 2 < bytes.length ? bytes[i + 2] : 0;

    const enc1 = byte1 >> 2;
    const enc2 = ((byte1 & 3) << 4) | (byte2 >> 4);
    const enc3 = ((byte2 & 15) << 2) | (byte3 >> 6);
    const enc4 = byte3 & 63;

    output += chars[enc1];
    output += chars[enc2];
    output += i + 1 < bytes.length ? chars[enc3] : "=";
    output += i + 2 < bytes.length ? chars[enc4] : "=";
  }

  return output;
}

export default function MergePdfScreen() {
  const [files, setFiles] = useState<DocumentPicker.DocumentPickerAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const showMessage = (text: string) => {
    setMessage(text);

    if (Platform.OS !== "web") {
      Alert.alert(text);
    }
  };

  const pickPDFs = async () => {
    try {
      setMessage("");
      const result = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        multiple: true,
        type: "application/pdf",
      });

      if (result.canceled || !result.assets?.length) {
        return;
      }

      setFiles((prev) => {
        const next = [...prev];

        result.assets.forEach((asset) => {
          const exists = next.some(
            (item) => item.name === asset.name && item.uri === asset.uri,
          );

          if (!exists) {
            next.push(asset);
          }
        });

        return next;
      });
    } catch (error) {
      console.log("PICK PDF ERROR:", error);
      showMessage("Unable to select PDFs");
    }
  };

  const removeFile = (index: number) => {
    setFiles((current) =>
      current.filter((_, itemIndex) => itemIndex !== index),
    );
  };

  const mergePDFs = async () => {
    if (files.length === 0) {
      showMessage("Please select PDF files first.");
      return;
    }

    if (files.length === 1) {
      showMessage("Please select at least 2 PDF files to merge.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const mergedDoc = await PDFDocument.create();

      for (const file of files) {
        let sourceBytes: Uint8Array;

        if (Platform.OS === "web") {
          const response = await fetch(file.uri);
          const arrayBuffer = await response.arrayBuffer();
          sourceBytes = new Uint8Array(arrayBuffer);
        } else {
          if (!file.uri) {
            throw new Error(
              `Missing file URI for ${file.name || "selected PDF"}.`,
            );
          }

          const base64 = await FileSystem.readAsStringAsync(file.uri, {
            encoding: FileSystem.EncodingType.Base64,
          });

          if (!base64) {
            throw new Error(`Unable to read ${file.name || "PDF file"}.`);
          }

          sourceBytes = base64ToBytes(base64);
        }

        const pdf = await PDFDocument.load(sourceBytes);
        const pages = await mergedDoc.copyPages(pdf, pdf.getPageIndices());
        pages.forEach((page) => mergedDoc.addPage(page));
      }

      const mergedBytes = (await mergedDoc.save()) as Uint8Array;

      if (Platform.OS === "web") {
        const arrayBuffer = new Uint8Array(mergedBytes).buffer as ArrayBuffer;
        const blob = new Blob([arrayBuffer], { type: "application/pdf" });
        const downloadUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = `merged-${Date.now().toString()}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(downloadUrl);
        showMessage("Merged PDF downloaded successfully.");
      } else {
        const fileUri =
          FileSystem.documentDirectory +
          `merged-${Date.now().toString()}-${files.length}.pdf`;

        await FileSystem.writeAsStringAsync(
          fileUri,
          bytesToBase64(mergedBytes),
          {
            encoding: FileSystem.EncodingType.Base64,
          },
        );

        showMessage("PDF merged successfully");

        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri);
        } else {
          showMessage("Sharing is not available on this device.");
        }
      }
    } catch (error: any) {
      console.log("MERGE PDF ERROR:", error);
      showMessage(error?.message || "Error merging PDFs");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PdfToolLayout
      message={message}
      messageTone={
        message.toLowerCase().includes("success") ||
        message.toLowerCase().includes("downloaded")
          ? "success"
          : "error"
      }
      summaryItems={[
        { label: "Selected PDFs", value: String(files.length) },
        {
          label: "Status",
          value: files.length > 1 ? "Ready to merge" : "Waiting",
        },
      ]}
      title="Merge PDF"
    >
      <Pressable
        onPress={pickPDFs}
        style={{
          backgroundColor: "#2563EB",
          borderRadius: 8,
          padding: 14,
        }}
      >
        <Text style={{ color: "#fff", textAlign: "center" }}>
          Select PDF Files
        </Text>
      </Pressable>

      <View style={{ marginTop: 15 }}>
        {files.map((file, index) => (
          <View
            key={`${file.name || "pdf"}-${index}`}
            style={{
              borderColor: "#ddd",
              borderRadius: 8,
              borderWidth: 1,
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 10,
              padding: 10,
            }}
          >
            <Text style={{ flex: 1 }}>{file.name || `PDF ${index + 1}`}</Text>

            <Pressable onPress={() => removeFile(index)}>
              <Text style={{ color: "red" }}>Remove</Text>
            </Pressable>
          </View>
        ))}
      </View>

      <Pressable
        disabled={loading}
        onPress={mergePDFs}
        style={{
          backgroundColor: loading ? "#999" : "#16A34A",
          borderRadius: 8,
          marginTop: 10,
          padding: 14,
        }}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={{ color: "#fff", textAlign: "center" }}>Merge PDFs</Text>
        )}
      </Pressable>
    </PdfToolLayout>
  );
}

