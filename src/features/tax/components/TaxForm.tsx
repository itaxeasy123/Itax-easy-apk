import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useForm, Controller } from "react-hook-form";

import SelectField from "./SelectField";
import { calculatorStyles } from "../../../theme";
import {
  getCurrentQuarter,
  getFinancialYears,
  getAssessmentYears,
} from "../utils/date.utils";

export default function TaxForm({ onSubmit }: any) {
  const fyList = getFinancialYears();
  const ayList = getAssessmentYears();

  const { control, handleSubmit, setValue, watch } = useForm({
    defaultValues: {
      financialYear: fyList[1],
      assessmentYear: ayList[1],
      assesseeType: "Individual",
      residentialStatus: "Resident",
      gender: "Male",
      quarter: getCurrentQuarter(),
      age: "Normal",

      salary: 0,
      business: 0,
      stcg: 0,
      ltcg: 0,
      otherIncome: 0,
      deductions: 0,
      tds: 0,
      advancePaid: 0,
    },
  });

  const Input = (name: string, label: string) => (
    <Controller
      control={control}
      name={name as any}
      render={({ field }) => {
        return (
          <View style={calculatorStyles.fieldGroup}>
            <Text style={calculatorStyles.fieldLabel}>{label}</Text>

            <TextInput
              keyboardType="numeric"
              value={field.value === 0 && name !== 'deductions' && name !== 'tds' && name !== 'advancePaid' && name !== 'salary' && name !== 'business' && name !== 'stcg' && name !== 'ltcg' && name !== 'otherIncome' ? '0' : String(field.value)}
              onChangeText={(v) => {
                if (v === '') {
                  field.onChange('');
                } else {
                  field.onChange(Number(v) || 0);
                }
              }}
              placeholder={`Enter ${label}`}
              style={calculatorStyles.inputField}
            />
          </View>
        );
      }}
    />
  );

  const watchSalary = Number(watch("salary")) || 0;
  const watchBusiness = Number(watch("business")) || 0;
  const watchStcg = Number(watch("stcg")) || 0;
  const watchLtcg = Number(watch("ltcg")) || 0;
  const watchOtherIncome = Number(watch("otherIncome")) || 0;

  const totalIncome = watchSalary + watchBusiness + watchStcg + watchLtcg + watchOtherIncome;
  const isIncomeZero = totalIncome <= 0;

  return (
    <ScrollView
      contentContainerStyle={{ paddingBottom: 20 }}
      style={{ backgroundColor: "#fff" }}
      showsVerticalScrollIndicator={false}
    >
      <View>
        <Text style={{ fontWeight: "bold", marginBottom: 6 }}>
          📊 Basic Details
        </Text>

        <SelectField
          label="Financial Year"
          value={watch("financialYear")}
          options={fyList}
          onChange={(v) => setValue("financialYear", v)}
        />

        <SelectField
          label="Assessment Year"
          value={watch("assessmentYear")}
          options={ayList}
          onChange={(v) => setValue("assessmentYear", v)}
        />

        <SelectField
          label="Assessee Type"
          value={watch("assesseeType")}
          options={["Individual", "HUF", "Company", "Firm", "LLP"]}
          onChange={(v) => setValue("assesseeType", v)}
        />

        <SelectField
          label="Residential Status"
          value={watch("residentialStatus")}
          options={["Resident", "NRI"]}
          onChange={(v) => setValue("residentialStatus", v)}
        />

        <SelectField
          label="Gender"
          value={watch("gender")}
          options={["Male", "Female", "Other"]}
          onChange={(v) => setValue("gender", v)}
        />

        <SelectField
          label="Quarter"
          value={watch("quarter")}
          options={["Q1", "Q2", "Q3", "Q4"]}
          onChange={(v) => setValue("quarter", v)}
        />

        <SelectField
          label="Age Category"
          value={watch("age")}
          options={["Normal", "Senior", "Super Senior"]}
          onChange={(v) => setValue("age", v)}
        />

        <Text style={{ fontWeight: "bold", marginTop: 10 }}>
          💰 Income Details
        </Text>

        {Input("salary", "Salary")}
        {Input("business", "Business")}
        {Input("stcg", "Short Term Capital Gain")}
        {Input("ltcg", "Long Term Capital Gain")}
        {Input("otherIncome", "Other Income")}

        <Text style={{ fontWeight: "bold", marginTop: 10 }}>
          📉 Deductions
        </Text>

        {Input("deductions", "Total Deductions")}

        <Text style={{ fontWeight: "bold", marginTop: 10 }}>
          🏦 Tax Paid
        </Text>

        {Input("tds", "TDS")}
        {Input("advancePaid", "Advance Paid")}

        {isIncomeZero && (
          <Text style={{ color: '#ef4444', textAlign: 'center', marginTop: 12, fontWeight: '500' }}>
            Please enter at least one source of income to calculate tax.
          </Text>
        )}

        <TouchableOpacity
          onPress={() => {
            if (isIncomeZero) return;
            handleSubmit(onSubmit)();
          }}
          style={{
            backgroundColor: isIncomeZero ? "#9ca3af" : "#2563eb",
            borderRadius: 12,
            marginTop: isIncomeZero ? 8 : 18,
            padding: 16,
          }}
          activeOpacity={isIncomeZero ? 1 : 0.7}
        >
          <Text
            style={{
              color: "#fff",
              textAlign: "center",
              fontWeight: "bold",
              fontSize: 16,
            }}
          >
            Calculate Tax
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
