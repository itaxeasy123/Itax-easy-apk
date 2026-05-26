import { useMemo, useState } from "react";

import {
  getAssessmentYears,
  quarterData,
} from "../constants/gstData";

export default function useGSTDashboard() {
  const [assessmentYear, setAssessmentYear] =
    useState("");

  const [quarter, setQuarter] =
    useState("");

  const [month, setMonth] =
    useState("");

  const assessmentYears =
    getAssessmentYears();

  const availableMonths = useMemo(() => {
    const selectedQuarter =
      quarterData.find(
        item => item.id === quarter
      );

    return selectedQuarter?.months || [];
  }, [quarter]);

  const selectQuarter = (value: string) => {
    setQuarter(value);
    setMonth("");
  };

  return {
    assessmentYears,

    quarterData,

    assessmentYear,
    setAssessmentYear,

    quarter,
    selectQuarter,

    month,
    setMonth,

    availableMonths,
  };
}