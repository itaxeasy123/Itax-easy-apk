import LoanCalculatorScreen from '../components/LoanCalculatorScreen';
import { loanFieldLabels } from '../data/loanFields';

export default function BusinessLoanCalculatorScreen() {
  return (
    <LoanCalculatorScreen
      amountLabel={loanFieldLabels.loanAmount}
      rateLabel={loanFieldLabels.rateOfInterest}
      tenureLabel={loanFieldLabels.loanTenure}
      title="Business Loan Calculator"
    />
  );
}
