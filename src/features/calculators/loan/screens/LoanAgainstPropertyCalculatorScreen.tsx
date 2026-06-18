import LoanCalculatorScreen from '../components/LoanCalculatorScreen';
import { loanFieldLabels } from '../data/loanFields';

export default function LoanAgainstPropertyCalculatorScreen() {
  return (
    <LoanCalculatorScreen
      amountLabel={loanFieldLabels.loanAmount}
      rateLabel={loanFieldLabels.annualInterestRate}
      tenureLabel={loanFieldLabels.loanTenure}
      title="Loan Against Property Calculator"
    />
  );
}
