import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, Platform, StyleSheet } from 'react-native';
import { FormControl } from '../../../components/ui/form-control';
import { Input, InputField, InputSlot } from '../../../components/ui/input';

import { fontSizes, fontWeights } from "../../../theme/typography";
interface GstinAutoFillInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onDataFetch: (data: { purchaserName: string; state: string; supplyType: string }) => void;
  baseStateCode?: number; // E.g., 7 for Delhi (used to calculate Inter/Intra state)
}

const STATE_MAPPING: Record<string, string> = {
  "01": "Jammu and Kashmir", "02": "Himachal Pradesh", "03": "Punjab", "04": "Chandigarh", "05": "Uttarakhand",
  "06": "Haryana", "07": "Delhi", "08": "Rajasthan", "09": "Uttar Pradesh", "10": "Bihar",
  "11": "Sikkim", "12": "Arunachal Pradesh", "13": "Nagaland", "14": "Manipur", "15": "Mizoram",
  "16": "Tripura", "17": "Meghalaya", "18": "Assam", "19": "West Bengal", "20": "Jharkhand",
  "21": "Odisha", "22": "Chhattisgarh", "23": "Madhya Pradesh", "24": "Gujarat", "25": "Daman and Diu",
  "26": "Dadra and Nagar Haveli", "27": "Maharashtra", "28": "Andhra Pradesh", "29": "Karnataka", "30": "Goa",
  "31": "Lakshadweep", "32": "Kerala", "33": "Tamil Nadu", "34": "Puducherry", "35": "Andaman and Nicobar Islands",
  "36": "Telangana", "37": "Andhra Pradesh", "38": "Ladakh"
};

export default function GstinAutoFillInput({ value, onChangeText, onDataFetch, baseStateCode = 7 }: GstinAutoFillInputProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTextChange = async (text: string) => {
    const upperText = text.toUpperCase();
    onChangeText(upperText);
    setError("");

    // 1. LOCAL LOGIC: Instant State & Supply Type detection from first 2 digits
    if (upperText.length >= 2) {
      const stateCodeStr = upperText.substring(0, 2);
      const stateName = STATE_MAPPING[stateCodeStr];
      if (stateName) {
        const stateCodeInt = parseInt(stateCodeStr, 10);
        const supplyType = stateCodeInt === baseStateCode ? "Intrastate" : "Interstate";
        
        // Push local updates immediately (purchaser name remains empty for now)
        onDataFetch({ purchaserName: "", state: stateName, supplyType });
      }
    } else {
      // Clear data if user deletes
      onDataFetch({ purchaserName: "", state: "", supplyType: "" });
    }

    // 2. API LOGIC: Fetch Purchaser Name when length is exactly 15
    if (upperText.length === 15) {
      setIsLoading(true);
      try {
        const proxyUrl = Platform.OS === 'web' ? 'https://corsproxy.io/?' : '';
        
        // For testing UX, we hit Sandbox directly
        const authResponse = await fetch(`${proxyUrl}https://api.sandbox.co.in/authenticate`, {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'x-api-key': 'key_live_e465abd2addc43b38ac784173851898e',
            'x-api-secret': 'secret_live_f69f065858f442eaac31f8c3bd6e8601',
            'x-api-version': '1.0.0'
          }
        });
        const authData = await authResponse.json();
        const token = authData.data?.access_token || authData.access_token;
        
        if (!token) {
           setError("Authentication Failed. Check Sandbox Keys.");
           setIsLoading(false);
           return;
        }

        const response = await fetch(`${proxyUrl}https://api.sandbox.co.in/gst/compliance/public/gstin/search`, {
          method: 'POST',
          headers: {
            'x-api-key': 'key_live_e465abd2addc43b38ac784173851898e',
            'authorization': token, 
            'x-api-version': '1.0.0',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ gstin: upperText })
        });
        
        const result = await response.json();
        
        if (result.code === 200 && result.data) {
           const details = result.data;
           const legalName = details.lgnm || details.tradeNam || "Name not available";
           
           // State is already local-filled, but we can verify it or just push the name
           const stateCodeStr = upperText.substring(0, 2);
           const stateName = STATE_MAPPING[stateCodeStr] || "";
           const supplyType = parseInt(stateCodeStr, 10) === baseStateCode ? "Intrastate" : "Interstate";
           
           onDataFetch({ purchaserName: legalName, state: stateName, supplyType });
        } else {
           setError(result.message || "Invalid GSTIN or details not found.");
        }
      } catch (err) {
        setError("Network Error. You can manually enter the name.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <FormControl style={{ marginBottom: 16 }}>
      <View style={styles.wrapper}>
        <Input style={[styles.inputBox, error ? { borderColor: 'red' } : {}]}>
          <InputField 
            value={value} 
            onChangeText={handleTextChange} 
            placeholder="Enter Purchaser's GSTIN" 
            placeholderTextColor="#9b9b9b" 
            style={styles.inputText}
            maxLength={15}
            autoCapitalize="characters"
          />
          {isLoading && (
            <InputSlot style={{ paddingRight: 10 }}>
              <ActivityIndicator size="small" color="#3D7BEA" />
            </InputSlot>
          )}
        </Input>
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </FormControl>
  );
}

const styles = StyleSheet.create({
  wrapper: { width: '100%' },
  inputBox: { height: 48, borderWidth: 1, borderColor: "#B0B5C1", borderRadius: 8, paddingHorizontal: 0, backgroundColor: "#fff" },
  inputText: { fontSize: fontSizes.md, color: "#333", height: "100%", paddingHorizontal: 14 },
  errorText: { color: 'red', fontSize: fontSizes.sm, marginTop: 4 }
});
