import axios from "axios";
import { Platform } from "react-native";
import { OCR_API_URL } from "../config/env";

const API_URL = OCR_API_URL;

export const scanPAN = async (file: any) => {
  const formData = new FormData();

  if (Platform.OS === "web") {
    const blob = await fetch(file.uri).then((r) => r.blob());
    formData.append("file", blob, "pan.jpg");
  } else {
    formData.append("file", {
      uri: file.uri,
      name: "pan.jpg",
      type: "image/jpeg",
    } as any);
  }

  const res = await axios.post(`${API_URL}/pan`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
};