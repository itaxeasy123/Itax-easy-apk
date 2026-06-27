import { Text, View } from 'react-native';

import { calculatorStyles } from '../../../theme';

type SummaryItem = {
  label: string;
  value: string;
};

type CalculatorSummaryCardProps = {
  items: SummaryItem[];
};

function SummaryRow({ label, value }: SummaryItem) {
  return (
    <View style={calculatorStyles.summaryRow}>
      <Text style={calculatorStyles.summaryLabel}>{label}</Text>
      <Text style={calculatorStyles.summaryValue}>{value}</Text>
    </View>
  );
}

export default function CalculatorSummaryCard({
  items,
}: CalculatorSummaryCardProps) {
  return (
    <View style={calculatorStyles.summaryCard}>
      {items.map((item) => (
        <SummaryRow key={item.label} {...item} />
      ))}
    </View>
  );
}
