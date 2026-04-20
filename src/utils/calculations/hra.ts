import {
  HraCalculatorInput,
  HraCalculatorResult,
} from '../../features/calculators/tax/types/hra.types';

export function calculateHra(input: HraCalculatorInput): HraCalculatorResult {
  const basicSalary = Number(input.basicSalary) || 0;
  const hraReceived = Number(input.hraReceived) || 0;
  const rentPaid = Number(input.rentPaid) || 0;
  const dearnessAllowance = Number(input.dearnessAllowance) || 0;
  const otherAllowances = Number(input.otherAllowances) || 0;

  const salaryBasis = basicSalary + dearnessAllowance + otherAllowances;
  const rentMinusTenPercent = Math.max(rentPaid - salaryBasis * 0.1, 0);
  const salaryPercent = input.isMetroCity ? salaryBasis * 0.5 : salaryBasis * 0.4;
  const hraExemption = Math.max(
    Math.min(hraReceived, rentMinusTenPercent, salaryPercent),
    0
  );

  return {
    basicSalary,
    dearnessAllowance,
    hraExemption,
    hraReceived,
    isMetroCity: input.isMetroCity,
    otherAllowances,
    rentPaid,
  };
}
