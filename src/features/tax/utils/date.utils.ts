export const getFinancialYears = () => {
  const year = new Date().getFullYear();
  return [
    `${year - 1}-${year.toString().slice(2)}`,
    `${year}-${(year + 1).toString().slice(2)}`,
  ];
};

export const getAssessmentYears = () => {
  const fy = getFinancialYears();
  return fy.map((y) => {
    const [start, end] = y.split("-");
    return `${Number(start) + 1}-${Number(end) + 1}`;
  });
};

export const getCurrentQuarter = () => {
  const m = new Date().getMonth() + 1;

  if (m >= 4 && m <= 6) return "Q1";
  if (m >= 7 && m <= 9) return "Q2";
  if (m >= 10 && m <= 12) return "Q3";
  return "Q4";
};