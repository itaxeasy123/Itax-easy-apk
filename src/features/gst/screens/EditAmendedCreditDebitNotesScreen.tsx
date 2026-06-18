import DynamicForm from "../components/DynamicForm";
import { FormField } from "../types/form.types";
import React, {
  useEffect,
  useState,
} from "react";

import { SafeAreaView,  
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  } from "react-native";
import GSTHeader from "../components/GSTHeader";

import {
  ArrowLeft,
  Check,
} from "lucide-react-native";

import {
  router,
  useLocalSearchParams,
} from "expo-router";

import GSTBottomBar from "../components/GSTBottomBar";

export default function EditAmendedCreditDebitNotesScreen() {
  const formSchema: FormField[] = [
    { key: 'deemedExports', label: 'Deemed Exports', type: 'checkbox' },
    { key: 'sezSupplyWithPayment', label: 'SEZ Supplies with payment', type: 'checkbox' },
    { key: 'sezSupplyWithoutPayment', label: 'SEZ Supplies without payment', type: 'checkbox' },
    { key: 'reverseCharge', label: 'Supply attract reverse charge', type: 'checkbox' },
    { key: 'intraStateSupply', label: 'Intra-State Supplies attracting IGST', type: 'checkbox' },
    { key: 'recipientGSTIN', label: 'Recipient GSTIN', type: 'text' },
    { key: 'recipientName', label: 'Recipient Name', type: 'text' },
    { key: 'revisedInvoiceNo', label: 'Revised Invoice No', type: 'text' },
    { key: 'revisedInvoiceDate', label: 'Revised Invoice Date', type: 'date' },
    { key: 'totalInvoiceValue', label: 'Total Invoice Value', type: 'number' },
    { key: 'taxableValue', label: 'Taxable Value', type: 'number' },
    { key: 'integratedTax', label: 'Integrated Tax', type: 'number' },
    { key: 'centralTax', label: 'Central Tax', type: 'number' },
    { key: 'stateTax', label: 'State Tax', type: 'number' },
    { key: 'cess', label: 'Cess', type: 'number' },
  ];

  const onSubmit = (formData: any) => {
    console.log("Saving Data:", formData);
    router.back();
  };


  // ROUTE PARAMS
  const params =
    useLocalSearchParams();

  // GET TABLE DATA
  const editData = JSON.parse(
    params?.invoiceData as string
  );

  // CHECKBOX STATES
  const [
    deemedExports,
    setDeemedExports,
  ] = useState(false);

  const [
    sezSupplyWithPayment,
    setSezSupplyWithPayment,
  ] = useState(false);

  const [
    sezSupplyWithoutPayment,
    setSezSupplyWithoutPayment,
  ] = useState(false);

  const [
    reverseCharge,
    setReverseCharge,
  ] = useState(false);

  const [
    intraStateSupply,
    setIntraStateSupply,
  ] = useState(false);

  // FORM STATES
  const [
    recipientGSTIN,
    setRecipientGSTIN,
  ] = useState("");

  const [
    recipientName,
    setRecipientName,
  ] = useState("");

  const [
    revisedInvoiceNo,
    setRevisedInvoiceNo,
  ] = useState("");

  const [
    revisedInvoiceDate,
    setRevisedInvoiceDate,
  ] = useState("");

  const [
    revisedOriginalInvoiceDate,
    setRevisedOriginalInvoiceDate,
  ] = useState("");

  const [
    totalInvoiceValue,
    setTotalInvoiceValue,
  ] = useState("");

  const [
    taxableValue,
    setTaxableValue,
  ] = useState("");

  const [
    integratedTax,
    setIntegratedTax,
  ] = useState("");

  const [
    centralTax,
    setCentralTax,
  ] = useState("");

  const [
    stateTax,
    setStateTax,
  ] = useState("");

  const [cess, setCess] =
    useState("");

  // AUTO FILL DATA
  useEffect(() => {

    if (editData) {

      setRecipientGSTIN(
        "23BPLM0446C1D4"
      );

      setRecipientName(
        "MUNICIPAL CORPORATION GWALIOR"
      );

      setRevisedInvoiceNo(
        editData.invoiceNo || ""
      );

      setRevisedInvoiceDate(
        editData.invoiceDate || ""
      );

      setRevisedOriginalInvoiceDate(
        editData.invoiceDate || ""
      );

      setTotalInvoiceValue(
        String(
          editData.totalInvoiceValue || ""
        )
      );

      setTaxableValue(
        String(
          editData.taxableValue || ""
        )
      );

      setIntegratedTax(
        String(
          editData.integratedTax || ""
        )
      );

      setCentralTax(
        String(
          editData.centralTax || ""
        )
      );

      setStateTax(
        String(
          editData.stateTax || ""
        )
      );

      setCess(
        String(
          editData.cess || ""
        )
      );

    }

  }, []);

  // SAVE
  const handleSave = () => {

    const updatedInvoice = {

      id: editData.id,

      invoiceNo:
        revisedInvoiceNo,

      invoiceDate:
        revisedInvoiceDate,

      totalInvoiceValue:
        Number(
          totalInvoiceValue
        ),

      taxableValue:
        Number(
          taxableValue
        ),

      integratedTax:
        Number(
          integratedTax
        ),

      centralTax:
        Number(
          centralTax
        ),

      stateTax:
        Number(
          stateTax
        ),

      cess:
        Number(cess),

    };

    // UPDATE TABLE
    router.push({
      pathname:
        "/gst/amended-credit-debit-notes",

      params: {
        updatedInvoice:
          JSON.stringify(
            updatedInvoice
          ),
      },
    });

    Alert.alert(
      "Success",
      "Record Updated Successfully"
    );

  };

  // CUSTOM CHECKBOX
  const renderCheckbox = (
    label: string,
    value: boolean,
    setValue: any
  ) => {

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        style={
          styles.checkboxRow
        }
        onPress={() =>
          setValue(!value)
        }
      >

        <View
          style={[
            styles.checkbox,
            value &&
              styles.checkboxActive,
          ]}
        >

          {value && (
            <Check
              size={10}
              color="#ffffff"
              strokeWidth={3}
            />
          )}

        </View>

        <Text
          style={
            styles.checkboxLabel
          }
        >
          {label}
        </Text>

      </TouchableOpacity>
    );

  };

    const initialFormData = editData ? {
    recipientGSTIN: "23BPLM0446C1D4",
    recipientName: "MUNICIPAL CORPORATION GWALIOR",
    revisedInvoiceNo: editData.invoiceNo || "",
    revisedInvoiceDate: editData.invoiceDate || "",
    revisedOriginalInvoiceDate: editData.invoiceDate || "",
    totalInvoiceValue: String(
          editData.totalInvoiceValue || ""
        ),
    taxableValue: String(
          editData.taxableValue || ""
        ),
    integratedTax: String(
          editData.integratedTax || ""
        ),
    centralTax: String(
          editData.centralTax || ""
        ),
    stateTax: String(
          editData.stateTax || ""
        ),
    cess: String(
          editData.cess || ""
        ),
  } : {};

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: "#f0f2f5"}}>
      <View style={styles.container}>
        <GSTHeader title="9C-Amended Credit/Debit Notes (Registered)" />

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <DynamicForm schema={formSchema} onSubmit={onSubmit} submitLabel="Save" initialData={initialFormData} />
        </ScrollView>

      {/* BOTTOM BAR */}
      <GSTBottomBar />

    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#efefef",
  },

  header: {
    height: 72,
    backgroundColor: "#4d84dc",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    paddingTop: 10,
  },

  backButton: {
    position: "absolute",
    left: 14,
    top: 28,
  },

  headerTitle: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 18,
  },

  topBox: {
    paddingHorizontal: 14,
    paddingTop: 14,
  },

  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  checkbox: {
    width: 14,
    height: 14,
    borderWidth: 1,
    borderColor: "#777",
    backgroundColor: "#ffffff",
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
  },

  checkboxActive: {
    backgroundColor: "#4d84dc",
    borderColor: "#4d84dc",
  },

  checkboxLabel: {
    fontSize: 11,
    color: "#333333",
  },

  noteText: {
    fontSize: 10,
    color: "#555",
    lineHeight: 14,
    marginLeft: 22,
    marginTop: 2,
  },

  formContainer: {
    paddingHorizontal: 14,
    marginTop: 12,
  },

  inputBox: {
    marginBottom: 14,
  },

  label: {
    fontSize: 11,
    color: "#333",
    marginBottom: 5,
    fontWeight: "500",
  },

  input: {
    height: 40,
    borderWidth: 1,
    borderColor: "#bdbdbd",
    backgroundColor: "#f4f4f4",
    borderRadius: 2,
    paddingHorizontal: 10,
    fontSize: 11,
    color: "#000",
  },

  saveButton: {
    height: 42,
    backgroundColor: "#4d84dc",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
  },

  saveButtonText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "600",
  },

});
