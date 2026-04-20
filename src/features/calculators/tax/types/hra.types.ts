export type HraCalculatorInput = {
  basicSalary: string;
  dearnessAllowance: string;
  hraReceived: string;
  isMetroCity: boolean;
  otherAllowances: string;
  rentPaid: string;
};

export type HraCalculatorResult = {
  basicSalary: number;
  dearnessAllowance: number;
  hraExemption: number;
  hraReceived: number;
  isMetroCity: boolean;
  otherAllowances: number;
  rentPaid: number;
};
