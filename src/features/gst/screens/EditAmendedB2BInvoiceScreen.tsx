import React, {
  useEffect,
  useState,
} from "react";
import { Datepicker } from '@ui-kitten/components';
import { CalendarIcon } from '../../../components/ui/icon';

const parseDateString = (val: string | undefined) => {
  if (!val) return undefined;
  let d = new Date(val);
  if (isNaN(d.getTime()) && typeof val === 'string') {
    const parts = val.split(/[\/\-]/);
    if (parts.length === 3) {
      d = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
    }
  }
  return isNaN(d.getTime()) ? undefined : d;
};


import GSTHeader from "../components/GSTHeader";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";

import {
  ArrowLeft,
  Check,
} from "lucide-react-native";

import {
  router,
  useLocalSearchParams,
} from "expo-router";

import GSTBottomBar from "../components/GSTBottomBar";

export default function EditAmendedB2BInvoiceScreen() {

  // PARAMS
  const params =
    useLocalSearchParams();

  // TABLE DATA
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

  }, [params?.invoiceData]);

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
        "/gst/amended-b2b-invoices",

      params: {
        updatedInvoice:
          JSON.stringify(
            updatedInvoice
          ),
      },
    });

    Alert.alert(
      "Success",
      "Invoice Updated Successfully"
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

  return (
    <View style={styles.container}>

      {/* HEADER */}
      <GSTHeader title="9A-Amended B2B Invoices" />

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={{
          paddingBottom: 120,
        }}
      >

        {/* CHECKBOX AREA */}
        <View style={styles.topBox}>

          {renderCheckbox(
            "Deemed Exports",
            deemedExports,
            setDeemedExports
          )}

          {renderCheckbox(
            "SEZ Supplies with payment",
            sezSupplyWithPayment,
            setSezSupplyWithPayment
          )}

          {renderCheckbox(
            "SEZ Supplies without payment",
            sezSupplyWithoutPayment,
            setSezSupplyWithoutPayment
          )}

          {renderCheckbox(
            "Supply attract reverse charge",
            reverseCharge,
            setReverseCharge
          )}

          {renderCheckbox(
            "Intra-State Supplies attracting IGST",
            intraStateSupply,
            setIntraStateSupply
          )}

          <Text style={styles.noteText}>
            Is the supply eligible to be taxed at a
            differential percentage (%) of the
            existing rate of tax, as notified by
            the Government?
          </Text>

        </View>

        {/* FORM */}
        <View
          style={
            styles.formContainer
          }
        >

          {/* GSTIN */}
          <View
            style={
              styles.inputBox
            }
          >

            <Text
              style={styles.label}
            >
              Recipient GSTIN/UIN
            </Text>

            <Datepicker
                date={parseDateString(revisedInvoiceDate)}
                onSelect={(nextDate) => setRevisedInvoiceDate(nextDate.toISOString().split('T')[0])}
                placeholder="Select Date"
                style={styles.input}
                min={new Date(1990, 0, 1)} max={new Date(2050, 11, 31)} accessoryRight={() => (<View style={{ paddingRight: 8 }}><CalendarIcon size={20} color="#64748b" /></View>)}
              />

          </View>

          {/* ORIGINAL DATE */}
          <View
            style={
              styles.inputBox
            }
          >

            <Text
              style={styles.label}
            >
              Revised/Original Invoice Date
            </Text>

            <Datepicker
                date={parseDateString(revisedOriginalInvoiceDate)}
                onSelect={(nextDate) => setRevisedOriginalInvoiceDate(nextDate.toISOString().split('T')[0])}
                placeholder="Select Date"
                style={styles.input}
                min={new Date(1990, 0, 1)} max={new Date(2050, 11, 31)} accessoryRight={() => (<View style={{ paddingRight: 8 }}><CalendarIcon size={20} color="#64748b" /></View>)}
              />

          </View>

          {/* TOTAL */}
          <View
            style={
              styles.inputBox
            }
          >

            <Text
              style={styles.label}
            >
              Total Invoice Value
            </Text>

            <TextInput
              value={
                totalInvoiceValue
              }
              onChangeText={
                setTotalInvoiceValue
              }
              style={
                styles.input
              }
              keyboardType="numeric"
            />

          </View>

          {/* TAXABLE */}
          <View
            style={
              styles.inputBox
            }
          >

            <Text
              style={styles.label}
            >
              Taxable Value
            </Text>

            <TextInput
              value={
                taxableValue
              }
              onChangeText={
                setTaxableValue
              }
              style={
                styles.input
              }
              keyboardType="numeric"
            />

          </View>

          {/* IGST */}
          <View
            style={
              styles.inputBox
            }
          >

            <Text
              style={styles.label}
            >
              Integrated Tax
            </Text>

            <TextInput
              value={
                integratedTax
              }
              onChangeText={
                setIntegratedTax
              }
              style={
                styles.input
              }
              keyboardType="numeric"
            />

          </View>

          {/* CGST */}
          <View
            style={
              styles.inputBox
            }
          >

            <Text
              style={styles.label}
            >
              Central Tax
            </Text>

            <TextInput
              value={
                centralTax
              }
              onChangeText={
                setCentralTax
              }
              style={
                styles.input
              }
              keyboardType="numeric"
            />

          </View>

          {/* SGST */}
          <View
            style={
              styles.inputBox
            }
          >

            <Text
              style={styles.label}
            >
              State/UT Tax
            </Text>

            <TextInput
              value={
                stateTax
              }
              onChangeText={
                setStateTax
              }
              style={
                styles.input
              }
              keyboardType="numeric"
            />

          </View>

          {/* CESS */}
          <View
            style={
              styles.inputBox
            }
          >

            <Text
              style={styles.label}
            >
              Cess
            </Text>

            <TextInput
              value={cess}
              onChangeText={
                setCess
              }
              style={
                styles.input
              }
              keyboardType="numeric"
            />

          </View>

          {/* SAVE */}
          <TouchableOpacity
            style={
              styles.saveButton
            }
            onPress={handleSave}
          >

            <Text
              style={
                styles.saveButtonText
              }
            >
              Save
            </Text>

          </TouchableOpacity>

        </View>

      </ScrollView>

      {/* BOTTOM BAR */}
      <GSTBottomBar />

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#efefef",
  },

  header: {
    height: 58,
    backgroundColor: "#4d84dc",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },

  backButton: {
    position: "absolute",
    left: 14,
  },

  headerTitle: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
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
