import axios from "axios";

export const scanPAN = async (file: any) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await axios.post(
    "https://ocr.itaxeasy.com/api/pan",
    formData
  );

  return res.data;
};