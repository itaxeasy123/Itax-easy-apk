import React, { useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, TextInput
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import GSTBottomBar from "../components/GSTBottomBar";

const STATES = ["Madhya Pradesh","Maharashtra","Delhi","Gujarat","Uttar Pradesh"];

type RowType = {
  id: string;
  state: string;
  taxableValue: string;
  integratedTax: string;
};

const createRow = (): RowType => ({

  id: Date.now().toString() + Math.random(),
  state: "",
  taxableValue: "",
  integratedTax: "",
});

export default function GSTR3B2Screen() {

  const [open, setOpen] = useState("unregistered");
  const [unregistered, setUnregistered] = useState([createRow()]);
  const [composition, setComposition] = useState([createRow()]);
  const [uin, setUin] = useState([createRow()]);

  const CURRENT_YEAR = new Date().getFullYear();

const YEARS = Array.from(
  { length: 10 },
  (_, i) => (CURRENT_YEAR - 5 + i).toString()
);

 const renderSection = (
  title: string,
  sectionKey: string,
  rows: RowType[],
  setRows: React.Dispatch<React.SetStateAction<RowType[]>>
) => (
    <View style={styles.section}>
      <TouchableOpacity style={styles.accordion} onPress={() => setOpen(open === sectionKey ? "" : sectionKey)}>
        <Text style={styles.accText}>{title}</Text>
        <Ionicons name={open === sectionKey ? "chevron-up" : "chevron-down"} size={18} color="#555" />
      </TouchableOpacity>

      {open === sectionKey && (
        <View style={styles.formBox}>
          {rows.map((row, idx) => (
            <View key={row.id}>
              <View style={styles.table}>
                <View style={styles.left}>
                  <Text style={styles.label}>Place of Supply (State/UT)</Text>
                  <Text style={styles.label}>Total Taxable Value</Text>
                  <Text style={styles.label}>Amount of Integrated Tax (₹)</Text>
                </View>
                <View style={styles.right}>
                  <TextInput style={styles.input} value={row.state} placeholder="Select year" onChangeText={(t)=>{
                    const r=[...rows]; r[idx].state=t; setRows(r);
                  }}/>
                  <TextInput style={styles.input} value={row.taxableValue} onChangeText={(t)=>{
                    const r=[...rows]; r[idx].taxableValue=t; setRows(r);
                  }}/>
                  <TextInput style={styles.input} value={row.integratedTax} onChangeText={(t)=>{
                    const r=[...rows]; r[idx].integratedTax=t; setRows(r);
                  }}/>
                </View>
              </View>

              <View style={styles.btnRow}>
                <TouchableOpacity style={styles.removeBtn} onPress={()=>setRows(rows.filter(x=>x.id!==row.id))}>
                  <Text style={styles.btnTxt}>Remove</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.addBtn} onPress={()=>setRows([...rows, createRow()])}>
                  <Text style={styles.btnTxt}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={()=>router.push("/gst/gstr3b-online")}>
          <Ionicons name="chevron-back" size={18} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>GSTR 3B - 3.2 (Inter State Supplies)</Text>
      </View>

      <ScrollView contentContainerStyle={{paddingBottom:120}}>
        <Text style={styles.desc}>
          3.2 Details of inter-state supplies from 3.1(a) and 3.1.1 made to unregistered persons, composition taxpayers, and UIN holders.
        </Text>

        {renderSection("Supplies made to Unregistered Person","unregistered",unregistered,setUnregistered)}
        {renderSection("Supplies made to Composition Person","composition",composition,setComposition)}
        {renderSection("Supplies made to UIN holder","uin",uin,setUin)}
      </ScrollView>

      <GSTBottomBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container:{flex:1,backgroundColor:"#f5f5f5"},
  header:{height:56,backgroundColor:"#447FF4",flexDirection:"row",alignItems:"center",paddingHorizontal:12},
  headerTitle:{color:"#fff",fontSize:13,fontWeight:"600",marginLeft:8},
  desc:{fontSize:13,lineHeight:18,textAlign:"center",padding:14,color:"#333"},
  section:{marginHorizontal:12,marginBottom:10},
  accordion:{backgroundColor:"#EEF2F7",height:42,borderRadius:6,paddingHorizontal:12,flexDirection:"row",justifyContent:"space-between",alignItems:"center"},
  accText:{fontSize:12,color:"#333"},
  formBox:{backgroundColor:"#fff",marginTop:8,padding:8,borderWidth:1,borderColor:"#ddd"},
  table:{flexDirection:"row"},
  left:{flex:1,backgroundColor:"#447FF4"},
  right:{width:120},
  label:{color:"#fff",fontSize:11,padding:10,borderBottomWidth:1,borderBottomColor:"#7ea4ff"},
  input:{height:39,borderWidth:1,borderColor:"#ddd",paddingHorizontal:8},
  btnRow:{flexDirection:"row",gap:10,marginTop:10},
  removeBtn:{flex:1,height:36,backgroundColor:"#ef4444",justifyContent:"center",alignItems:"center",borderRadius:5},
  addBtn:{flex:1,height:36,backgroundColor:"#447FF4",justifyContent:"center",alignItems:"center",borderRadius:5},
  btnTxt:{color:"#fff",fontWeight:"600"},
});
