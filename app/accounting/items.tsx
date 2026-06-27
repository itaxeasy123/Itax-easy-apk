import ItemsScreen from "../../src/features/accounting/screens/ItemsScreen";
import BusinessGate from "../../src/features/business/components/BusinessGate";

export default function Items() {
  return (
    <BusinessGate require="inventory" featureName="Inventory">
      <ItemsScreen />
    </BusinessGate>
  );
}
