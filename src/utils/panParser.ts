export interface PanDetails {
  panNumber: string;
  name: string;
  fatherName: string;
  dob: string;
}

export const extractPanDetails = (data: any[]): PanDetails => {
  const result: PanDetails = {
    panNumber: "",
    name: "",
    fatherName: "",
    dob: "",
  };

  data.forEach((item) => {
    const label = item.label.toLowerCase();
    const text = item.text;

    // 🔥 CLEAN TEXT
    const cleanText = text.replace(/\n/g, " ").trim();

    // ✅ PAN NUMBER (EXTRACT FROM TEXT)
    if (label.includes("pan")) {
      const match = cleanText.match(/[A-Z]{5}[0-9]{4}[A-Z]/);
      if (match) result.panNumber = match[0];
    }

    // ✅ NAME (REMOVE NOISE)
    if (label === "name") {
      result.name = cleanText
        .replace(/[^A-Z\s]/g, "")
        .replace(/\b(NAME|INCOME|TAX)\b/g, "")
        .trim();
    }

    // ✅ FATHER NAME (REMOVE PREFIX)
    if (label.includes("father")) {
      result.fatherName = cleanText
        .replace(/father'?s name/i, "")
        .replace(/[^A-Z\s]/g, "")
        .trim();
    }

    // ✅ DOB (EXTRACT DATE)
    if (label.includes("dob")) {
      const match = cleanText.match(/\d{2}\/\d{2}\/\d{4}/);
      if (match) result.dob = match[0];
    }
  });

  console.log("FINAL PARSED:", result); // DEBUG

  return result;
};