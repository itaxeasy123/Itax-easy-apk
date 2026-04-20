import LoanCalculatorScreen from '../components/LoanCalculatorScreen';
import { loanFieldLabels } from '../data/loanFields';

export default function CarLoanCalculatorScreen() {
  return (
    <LoanCalculatorScreen
      amountLabel={loanFieldLabels.loanAmount}
      rateLabel={loanFieldLabels.interestRate}
      tenureLabel={loanFieldLabels.loanTenure}
      title="Car Loan Calculator"
    />
  );
}
