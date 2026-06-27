import AccountingDashboardScreen from "../../src/features/accounting/screens/AccountingDashboardScreen";
import BusinessGate from "../../src/features/business/components/BusinessGate";

export default function AccountingIndex() {
  return (
    <BusinessGate require="business" featureName="Accounting">
      <AccountingDashboardScreen />
    </BusinessGate>
  );
}
