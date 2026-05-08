import DealVoucherCreateScreen from "./DealVoucherCreateScreen";

export default function PurchaseInvoiceCreateScreen() {
  return (
    <DealVoucherCreateScreen
      mode="purchase"
      title="Create Purchase Invoice"
      subtitle="Add items and record the purchase against the selected party."
      invoicePrefix="PUR"
    />
  );
}
