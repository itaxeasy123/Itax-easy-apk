import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  ScrollView,
  ActivityIndicator,
  Platform,
} from "react-native";

import * as ImagePicker from "expo-image-picker";
import { convertImagesToPdf } from "../../../services/pdf/imageToPdfService";

export default function ImageToPdfScreen() {
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const showMessage = (msg: string) => {
    alert(msg);
  };

  // ✅ FIXED picker (web safe)
  const pickImages = async () => {
    try {
      if (Platform.OS !== "web") {
        const permission =
          await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permission.granted) {
          showMessage("Permission required");
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsMultipleSelection: true,
        quality: 1,
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
      });

      if (!result.canceled && result.assets) {
        const uris = result.assets.map((a) => a.uri);
        setImages(uris);
      }
    } catch (err) {
      console.error(err);
      showMessage("Image picker failed");
    }
  };

  const handleConvert = async () => {
    if (images.length === 0) {
      showMessage("Select images first");
      return;
    }

    setLoading(true);

    await convertImagesToPdf(
      images,
      (msg) => showMessage(msg),
      (err) => showMessage(err)
    );

    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Image to PDF Converter</Text>

      <Pressable style={styles.button} onPress={pickImages}>
        <Text style={styles.btnText}>Select Images</Text>
      </Pressable>

      <Pressable style={styles.button} onPress={handleConvert}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.btnText}>Convert to PDF</Text>
        )}
      </Pressable>

      {/* ✅ PREVIEW */}
      <ScrollView>
        {images.length === 0 ? (
          <Text style={styles.empty}>No images selected</Text>
        ) : (
          images.map((uri, index) => (
            <Image
              key={index}
              source={{ uri }}
              style={styles.image}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

// ================= STYLES =================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#2563EB",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  btnText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
  },
  image: {
    width: "100%",
    height: 200,
    marginBottom: 10,
    borderRadius: 10,
  },
  empty: {
    textAlign: "center",
    marginTop: 20,
    color: "#666",
  },
});