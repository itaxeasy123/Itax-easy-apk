import LoanCalculatorScreen from '../components/LoanCalculatorScreen';
import { loanFieldLabels } from '../data/loanFields';

export default function HomeLoanCalculatorScreen() {
  return (
    <LoanCalculatorScreen
      amountLabel={loanFieldLabels.loanAmount}
      rateLabel={loanFieldLabels.interestRate}
      tenureLabel={loanFieldLabels.loanTerm}
      title="Home Loan Calculator"
    />
  );
}
