import { useMemo, useState } from "react";

import {
  getAssessmentYears,
  quarterData,
} from "../constants/gstData";

export default function useGSTDashboard() {
  const assessmentYears = getAssessmentYears();

  const { defaultFY, defaultQuarter, defaultMonth } = useMemo(() => {
    const now = new Date();
    // Default to the previous month, as GST returns are filed in the subsequent month
    now.setMonth(now.getMonth() - 1);

    const currentMonthIndex = now.getMonth();
    let startYear = now.getFullYear();
    // Jan, Feb, Mar (0, 1, 2) belong to the previous Financial Year
    if (currentMonthIndex < 3) {
      startYear = startYear - 1;
    }
    const endYearStr = String(startYear + 1).slice(-2);
    const calculatedFY = `${startYear}-${endYearStr}`;
    
    // Ensure the calculated FY is in the available options, else fallback to first option
    const finalFY = assessmentYears.includes(calculatedFY) ? calculatedFY : assessmentYears[0];

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const monthName = monthNames[currentMonthIndex];

    let quarterId = "Q1";
    for (const q of quarterData) {
      if (q.months.includes(monthName)) {
        quarterId = q.id;
        break;
      }
    }

    return { defaultFY: finalFY, defaultQuarter: quarterId, defaultMonth: monthName };
  }, [assessmentYears]);

  const [assessmentYear, setAssessmentYear] = useState(defaultFY);
  const [quarter, setQuarter] = useState(defaultQuarter);
  const [month, setMonth] = useState(defaultMonth);

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