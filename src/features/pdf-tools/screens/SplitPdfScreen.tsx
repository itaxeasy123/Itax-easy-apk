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
  TextInput,
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

async function getPdfBytes(uri: string) {
  if (Platform.OS === "web") {
    const response = await fetch(uri);
    const arrayBuffer = await response.arrayBuffer();
    return new Uint8Array(arrayBuffer);
  }

  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  if (!base64) {
    throw new Error("File read failed");
  }

  return base64ToBytes(base64);
}

export default function SplitPdfScreen() {
  const [file, setFile] = useState<DocumentPicker.DocumentPickerAsset | null>(
    null,
  );
  const [range, setRange] = useState("");
  const [loading, setLoading] = useState(false);
  const [pageCount, setPageCount] = useState(0);
  const [message, setMessage] = useState("");

  const showMessage = (text: string) => {
    setMessage(text);

    if (Platform.OS !== "web") {
      Alert.alert(text);
    }
  };

  const pickPDF = async () => {
    try {
      setMessage("");

      const result = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        type: "application/pdf",
      });

      if (result.canceled) {
        return;
      }

      const selected = result.assets?.[0];

      if (!selected?.uri) {
        showMessage("Invalid PDF file");
        return;
      }

      setFile(selected);

      const bytes = await getPdfBytes(selected.uri);
      const pdf = await PDFDocument.load(bytes);
      setPageCount(pdf.getPageCount());
    } catch (error) {
      console.log("SPLIT PICK ERROR:", error);
      setFile(null);
      setPageCount(0);
      showMessage("Failed to load PDF");
    }
  };

  const parseRange = (input: string, total: number) => {
    const pages = new Set<number>();

    if (!input.trim()) {
      throw new Error("Enter page range like 1-3,5");
    }

    const parts = input.split(",").map((part) => part.trim());

    for (const part of parts) {
      if (part.includes("-")) {
        const [start, end] = part.split("-").map(Number);

        if (!start || !end || start < 1 || end > total || start > end) {
          throw new Error(`Invalid range: ${part}`);
        }

        for (let page = start; page <= end; page += 1) {
          pages.add(page - 1);
        }
      } else {
        const page = Number(part);

        if (!page || page < 1 || page > total) {
          throw new Error(`Invalid page: ${part}`);
        }

        pages.add(page - 1);
      }
    }

    return [...pages];
  };

  const splitPDF = async () => {
    if (!file?.uri) {
      showMessage("Select PDF first");
      return;
    }

    if (!pageCount) {
      showMessage("Unable to read PDF pages. Please reselect the file.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const sourceBytes = await getPdfBytes(file.uri);
      const sourcePdf = await PDFDocument.load(sourceBytes);
      const selectedPages = parseRange(range, sourcePdf.getPageCount());
      const newPdf = await PDFDocument.create();
      const copiedPages = await newPdf.copyPages(sourcePdf, selectedPages);

      copiedPages.forEach((page) => newPdf.addPage(page));

      const newBytes = (await newPdf.save()) as Uint8Array;

      // if (Platform.OS === "web") {
      //   const arrayBuffer = new Uint8Array(newBytes).buffer as ArrayBuffer;
      //   const blob = new Blob([arrayBuffer], { type: "application/pdf" });
      //   const downloadUrl = URL.createObjectURL(blob);
      //   const link = document.createElement("a");
      //   link.href = downloadUrl;
      //   link.download = `split-${Date.now().toString()}.pdf`;
      //   document.body.appendChild(link);
      //   link.click();
      //   document.body.removeChild(link);
      //   setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
      //   showMessage("Split PDF downloaded successfully.");
      // }

      if (Platform.OS === "web") {
        const base64 = bytesToBase64(newBytes);

        const link = document.createElement("a");
        link.href = `data:application/pdf;base64,${base64}`;
        link.download = `split-${Date.now()}.pdf`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showMessage("Split PDF downloaded successfully.");
      }
      
      else {
        const uri =
          FileSystem.documentDirectory + `split-${Date.now().toString()}.pdf`;

        await FileSystem.writeAsStringAsync(uri, bytesToBase64(newBytes), {
          encoding: FileSystem.EncodingType.Base64,
        });
        showMessage("PDF split successfully");


        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri);
        }
      }
    } catch (error: any) {
      console.log("SPLIT PDF ERROR:", error);
      showMessage(error?.message || "Error splitting PDF");
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
        { label: "Total Pages", value: String(pageCount) },
        { label: "Selected Range", value: range.trim() || "Not entered" },
      ]}
      title="Split PDF"
    >
      <Pressable
        onPress={pickPDF}
        style={{
          backgroundColor: "#2563EB",
          borderRadius: 8,
          padding: 14,
        }}
      >
        <Text style={{ color: "#fff", textAlign: "center" }}>Select PDF</Text>
      </Pressable>

      {file ? (
        <View style={{ marginTop: 15 }}>
          <Text>{file.name}</Text>
          <Text>Total Pages: {pageCount}</Text>
        </View>
      ) : null}

      <TextInput
        onChangeText={setRange}
        placeholder="Enter pages (e.g. 1-3,5)"
        style={{
          borderColor: "#ccc",
          borderRadius: 8,
          borderWidth: 1,
          marginTop: 15,
          padding: 10,
        }}
        value={range}
      />

      <Pressable
        disabled={loading}
        onPress={splitPDF}
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
          <Text style={{ color: "#fff", textAlign: "center" }}>Split PDF</Text>
        )}
      </Pressable>
    </PdfToolLayout>
  );
}
