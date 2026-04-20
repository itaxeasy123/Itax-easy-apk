import axios from "axios";

const API_URL = "https://ocr.itaxeasy.com/api/aadhar";

export const scanAadhaar = async (image: any) => {
  const formData = new FormData();

  // 🔥 WEB FIX
  if (image.uri.startsWith("blob:")) {
    const response = await fetch(image.uri);
    const blob = await response.blob();

    formData.append("file", blob, "aadhaar.jpg");
  } else {
    // 📱 MOBILE FIX
    formData.append("file", {
      uri: image.uri,
      name: "aadhaar.jpg",
      type: "image/jpeg",
    } as any);
  }

  const res = await axios.post(API_URL, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
};