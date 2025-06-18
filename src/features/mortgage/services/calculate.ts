import { Prisma, PrismaClient } from "@prisma/client";
import { InternalServerError } from "../../../lib/appError";
import { MortgageCalculation,  } from "../dtos/mortagage.dto";

const prisma = new PrismaClient();

export class ProjectService {
  private prisma: PrismaClient = prisma;

  

 async calculateCustomMortgage(
    homeLocation: string,
    homePrice: number,
    downPayment: number
  ): Promise<MortgageCalculation> {
    try {
      
      if (homePrice <= 0 || downPayment < 0 || downPayment >= homePrice) {
        throw new Error("Invalid home price or down payment");
      }

      // Constants
      const loanType = "30-year fixed";
      const interestRate = 0.035; // 3.5% annual interest rate
      const loanTermYears = 30; // 30-year term
      const propertyTaxRate = 0.01; // 1% annual property tax
      const homeInsuranceRate = 0.003; // 0.3% of home price annually
      const hoa = 0; // $0/year (example, can be user-provided)
      const mortgageInsuranceRate = 0.006; // 0.6% of loan amount if down payment < 20%

      // Calculations
      const loanAmount = homePrice - downPayment;
      const monthlyInterestRate = interestRate / 12;
      const totalPayments = loanTermYears * 12;
      const principalAndInterest = (loanAmount * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, totalPayments)) /
        (Math.pow(1 + monthlyInterestRate, totalPayments) - 1);
      const annualPropertyTax = homePrice * propertyTaxRate;
      const monthlyPropertyTax = annualPropertyTax / 12;
      const annualHomeInsurance = homePrice * homeInsuranceRate; // 0.3% of home price
      const monthlyHomeInsurance = annualHomeInsurance / 12;
      const mortgageInsurance = downPayment / homePrice < 0.2 ? loanAmount * mortgageInsuranceRate / 12 : 0;

      const totalMonthlyPayment = principalAndInterest + monthlyPropertyTax + monthlyHomeInsurance + hoa + mortgageInsurance;
      const estimatedClosingCost = homePrice * 0.03; // 3% of home price

      return {
        home_location: homeLocation,
        home_price: homePrice,
        down_payment: downPayment,
        loan_amount: loanAmount,
        loan_type: loanType,
        interest_rate: interestRate,
        loan_term_years: loanTermYears,
        breakdown: {
          principal_and_interest: principalAndInterest,
          property_tax: monthlyPropertyTax,
          home_insurance: monthlyHomeInsurance,
          hoa: hoa,
          mortgage_insurance: mortgageInsurance,
        },
        total_monthly_payment: totalMonthlyPayment,
        estimated_closing_cost: estimatedClosingCost,
      };
    } catch (error) {
      console.error("[calculateCustomMortgage] Error:", error);
      throw new InternalServerError("Failed to calculate mortgage.");
    }
  }

  async saveMortgageDraft(
    homeLocation: string,
    homePrice: number,
    downPayment: number,
    userId?: string | null
  ): Promise<{ id: string }> {
    try {
      const draft = await this.prisma.mortgageCalculationDraft.create({
        data: {
          home_location: homeLocation,
          home_price: homePrice,
          down_payment: downPayment,
          userId,
        },
      });

      return { id: draft.id };
    } catch (error) {
      console.error("[saveMortgageDraft] Error:", error);
      throw new InternalServerError("Failed to save mortgage draft.");
    }
  }

}