import React from "react";
import { Redirect } from "expo-router";
import BusinessGate from "../../src/features/business/components/BusinessGate";

export default function GSTPage() {
  return (
    <BusinessGate require="gst" featureName="GST Return">
      <Redirect href="/gst/returns" />
    </BusinessGate>
  );
}
