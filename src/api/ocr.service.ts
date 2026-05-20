import axios from "axios";
import { Platform } from "react-native";

/* =========================
   PAN OCR
========================= */

export const scanPAN = async (
  file: any
): Promise<any> => {
  try {
    const formData = new FormData();

    /*
      WEB SUPPORT
    */

    if (Platform.OS === "web") {
      const fileResponse =
        await fetch(file.uri);

      const blob =
        await fileResponse.blob();

      formData.append(
        "file",
        blob,
        file.name
      );
    }

    /*
      ANDROID + IOS SUPPORT
    */

    else {
      formData.append(
        "file",
        {
          uri: file.uri,
          name: file.name,
          type:
            file.mimeType ||
            "image/jpeg",
        } as any
      );
    }

    const res = await axios.post(
      "https://ocr.itaxeasy.com/api/pan",
      formData,
      {
        headers: {
          "Content-Type":
            "multipart/form-data",
        },
      }
    );

    return res.data;
  } catch (error: any) {
    console.log(
      "PAN OCR ERROR:",
      error?.response?.data ||
        error?.message
    );

    throw error;
  }
};

/* =========================
   AADHAAR OCR
========================= */

export const scanAadhaar =
  async (
    file: any
  ): Promise<any> => {
    try {
      const formData =
        new FormData();

      /*
        WEB SUPPORT
      */

      if (
        Platform.OS === "web"
      ) {
        const fileResponse =
          await fetch(file.uri);

        const blob =
          await fileResponse.blob();

        formData.append(
          "file",
          blob,
          file.name
        );
      }

      /*
        ANDROID + IOS SUPPORT
      */

      else {
        formData.append(
          "file",
          {
            uri: file.uri,
            name: file.name,
            type:
              file.mimeType ||
              "image/jpeg",
          } as any
        );
      }

      const res =
        await axios.post(
          "https://ocr.itaxeasy.com/api/aadhar",
          formData,
          {
            headers: {
              "Content-Type":
                "multipart/form-data",
            },
          }
        );

      return res.data;
    } catch (error: any) {
      console.log(
        "AADHAAR OCR ERROR:",
        error?.response?.data ||
          error?.message
      );

      throw error;
    }
  };

/* =========================
   BANK STATEMENT OCR
========================= */

export const uploadBankStatementOCR =
  async (
    file: any
  ): Promise<any> => {
    try {
      const formData =
        new FormData();

      /*
        WEB SUPPORT
      */

      if (
        Platform.OS === "web"
      ) {
        const fileResponse =
          await fetch(file.uri);

        const blob =
          await fileResponse.blob();

        formData.append(
          "file",
          blob,
          file.name
        );
      }

      /*
        ANDROID + IOS SUPPORT
      */

      else {
        formData.append(
          "file",
          {
            uri: file.uri,
            name: file.name,
            type:
              "application/pdf",
          } as any
        );
      }

      const response =
        await axios.post(
          "https://ocr.itaxeasy.com/api/process-bank-statement",
          formData,
          {
            headers: {
              "Content-Type":
                "multipart/form-data",
            },
          }
        );

      return response.data;
    } catch (error: any) {
      console.log(
        "BANK OCR ERROR:",
        error?.response?.data ||
          error?.message
      );

      throw error;
    }
  };

  /* =========================
   DRIVING LICENCE OCR
========================= */ 

  export const scanDrivingLicence =
  async (
    file: any
  ): Promise<any> => {
    try {
      const formData =
        new FormData();

      if (
        Platform.OS === 'web'
      ) {
        const fileResponse =
          await fetch(file.uri);

        const blob =
          await fileResponse.blob();

        formData.append(
          'file',
          blob,
          file.name
        );
      } else {
        formData.append(
          'file',
          {
            uri: file.uri,
            name: file.name,
            type:
              file.mimeType ||
              'application/pdf',
          } as any
        );
      }

      const response =
        await axios.post(
          'https://ocr.itaxeasy.com/api/driving_licence',
          formData,
          {
            headers: {
              'Content-Type':
                'multipart/form-data',
            },
          }
        );

      return response.data;
    } catch (error: any) {
      console.log(
        'DL OCR ERROR:',
        error?.response?.data ||
          error?.message
      );

      throw error;
    }
  };

  /* =========================
   INVOICE OCR
========================= */

export const uploadInvoiceOCR =
  async (
    file: any
  ): Promise<any> => {
    try {
      const formData = new FormData();

      /*
       ===================================
       WEB SUPPORT
       ===================================
      */

      if (Platform.OS === 'web') {
        formData.append(
          'file',
          file.file
        );
      } else {
        /*
         ===================================
         ANDROID / IOS SUPPORT
         ===================================
        */

        formData.append(
          'file',
          {
            uri: file.uri,
            name:
              file.name ||
              'invoice.pdf',
            type:
              file.mimeType ||
              'application/pdf',
          } as any
        );
      }

      const response = await axios.post(
        'https://ocr.itaxeasy.com/api/invoice',
        formData,
        {
          headers: {
            Accept:
              'application/json',
            'Content-Type':
              'multipart/form-data',
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.log(
        'INVOICE OCR ERROR:',
        error?.response?.data ||
          error?.message
      );

      throw error;
    }
  };

  /* =========================
   GST OCR
========================= */

export const uploadGSTOCR =
  async (
    file: any
  ): Promise<any> => {
    try {
      const formData =
        new FormData();

      /*
       =========================
       WEB
      =========================
      */

      if (
        Platform.OS === 'web'
      ) {
        formData.append(
          'file',
          file.file
        );
      } else {
        /*
         =========================
         ANDROID / IOS
        =========================
        */

        formData.append(
          'file',
          {
            uri: file.uri,
            name:
              file.name ||
              'gst.pdf',
            type:
              file.mimeType ||
              'application/pdf',
          } as any
        );
      }

      const response =
        await axios.post(
          'https://ocr.itaxeasy.com/api/process-gst',
          formData,
          {
            headers: {
              Accept:
                'application/json',
              'Content-Type':
                'multipart/form-data',
            },
          }
        );

      return response.data;
    } catch (error: any) {
      console.log(
        'GST OCR ERROR:',
        error?.response?.data ||
          error?.message
      );

      throw error;
    }
  };