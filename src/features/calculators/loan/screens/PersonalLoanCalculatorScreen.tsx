import LoanCalculatorScreen from '../components/LoanCalculatorScreen';
import { loanFieldLabels } from '../data/loanFields';

export default function PersonalLoanCalculatorScreen() {
  return (
    <LoanCalculatorScreen
      amountLabel={loanFieldLabels.loanAmount}
      rateLabel={loanFieldLabels.annualInterestRate}
      tenureLabel={loanFieldLabels.loanTenure}
      title="Personal Loan Calculator"
    />
  );
}
