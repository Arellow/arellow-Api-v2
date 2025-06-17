export interface MortgageCalculationDraftDto {
  id: string;
  home_location: string;
  home_price: number;
  down_payment: number;
  userId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MortgageCalculation {
  home_location: string | null;
  home_price: number;
  down_payment: number;
  loan_amount: number;
  loan_type: string;
  interest_rate: number;
  loan_term_years: number;
  breakdown: {
    principal_and_interest: number;
    property_tax: number;
    home_insurance: number;
    hoa: number;
    mortgage_insurance: number;
  };
  total_monthly_payment: number;
  estimated_closing_cost: number;
}