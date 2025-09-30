export function canUserAffordProperty({
  price,
  downPayment,
  monthlyBudget,
  annualInterestRate = 5,
  loanTermYears = 30
}: {
  price: number;
  downPayment: number;
  monthlyBudget: number;
  annualInterestRate?: number;
  loanTermYears?: number;
}): boolean {
  const loanNeeded = price - downPayment;
  const r = annualInterestRate / 100 / 12;
  const n = loanTermYears * 12;

  const maxAffordableLoan = monthlyBudget * ((Math.pow(1 + r, n) - 1) / (r * Math.pow(1 + r, n)));

  return maxAffordableLoan >= loanNeeded;
}
