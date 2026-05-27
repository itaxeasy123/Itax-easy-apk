export const getAssessmentYears = () => {
  const currentYear = new Date().getFullYear();

  const years = [];

  for (let i = 0; i < 8; i++) {
    const start = currentYear - i;
    const end = String(start + 1).slice(-2);

    years.push(`${start}-${end}`);
  }

  return years;
};

export const quarterData = [
  {
    id: "Q1",
    label: "Q1",
    months: ["April", "May", "June"],
  },

  {
    id: "Q2",
    label: "Q2",
    months: ["July", "August", "September"],
  },

  {
    id: "Q3",
    label: "Q3",
    months: ["October", "November", "December"],
  },

  {
    id: "Q4",
    label: "Q4",
    months: ["January", "February", "March"],
  },
];