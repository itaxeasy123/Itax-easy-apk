import DealVoucherCreateScreen from "./DealVoucherCreateScreen";

export default function SalesInvoiceCreateScreen() {
  return (
    <DealVoucherCreateScreen
      mode="sales"
      title="Create Sales Invoice"
      subtitle="Add items and record the sale against the selected party."
      invoicePrefix="SLS"
    />
  );
}
