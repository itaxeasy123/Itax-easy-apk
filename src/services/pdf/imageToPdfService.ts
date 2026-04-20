import { Platform } from "react-native";
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from "expo-sharing";
import { PDFDocument } from "pdf-lib";

// ✅ Safe base64 (mobile only)
const bytesToBase64 = (bytes: Uint8Array) => {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

export const convertImagesToPdf = async (
  imageUris: string[],
  onSuccess?: (msg: string) => void,
  onError?: (msg: string) => void
) => {
  try {
    if (!imageUris || imageUris.length === 0) {
      throw new Error("No images selected");
    }

    const pdfDoc = await PDFDocument.create();

    // ✅ CRITICAL: sequential loop (no map)
    for (const uri of imageUris) {
      const response = await fetch(uri);
      const imageBytes = await response.arrayBuffer();

      let image;

      if (uri.toLowerCase().endsWith(".png")) {
        image = await pdfDoc.embedPng(imageBytes);
      } else {
        image = await pdfDoc.embedJpg(imageBytes);
      }

      const { width, height } = image.scale(1);

      // ✅ NO BLANK PAGE
      const page = pdfDoc.addPage([width, height]);

      page.drawImage(image, {
        x: 0,
        y: 0,
        width,
        height,
      });
    }

    const pdfBytes: Uint8Array = await pdfDoc.save();

    // 🌐 WEB
    if (Platform.OS === "web") {
      const buffer = new Uint8Array(pdfBytes).buffer;

      const blob = new Blob([buffer], {
        type: "application/pdf",
      });

      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `images-${Date.now()}.pdf`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);

      onSuccess?.("PDF downloaded");
    }

    // 📱 MOBILE
    else {
      const fileUri =
        FileSystem.documentDirectory +
        `images-${Date.now()}.pdf`;

      await FileSystem.writeAsStringAsync(
        fileUri,
        bytesToBase64(pdfBytes),
        { encoding: FileSystem.EncodingType.Base64 }
      );

      await Sharing.shareAsync(fileUri);

      onSuccess?.("PDF saved & shared");
    }
  } catch (err: any) {
    console.error("PDF ERROR:", err);
    onError?.(err.message || "PDF creation failed");
  }
};