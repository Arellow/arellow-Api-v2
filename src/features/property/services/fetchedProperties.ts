import {  PrismaClient } from "@prisma/client";
import { InternalServerError } from "../../../lib/appError";
import {  MortgageCalculation } from "../dtos/property.dto";

const prisma = new PrismaClient();

export class ProjectService {
  private prisma: PrismaClient = prisma;


 async calculateMortgage(id: string, downPayment: number): Promise<MortgageCalculation> {
    try {
      const project = await this.prisma.property.findUnique({
        where: { id },
      });

      if (!project) {
        throw new InternalServerError("Project not found.");
      }

      const home_price = project.price || 0;
      
      const loan_type = "20-year fixed";
      const loan_term_years = 20;
      const interest_rate = 12;
      const property_tax = 1.5;
      const home_insurance = 0.5;
      const hoa_fees = 0;
      const mortgage_insurance = 0;

      if (isNaN(home_price) || isNaN(downPayment)) {
        throw new InternalServerError("'home_price' and 'down_payment' must be valid numbers.");
      }

      const loan_amount = home_price - downPayment;
      const monthly_interest = interest_rate / 12 / 100;
      const total_payments = loan_term_years * 12;

      const principal_and_interest = parseFloat(
        (
          loan_amount *
          (monthly_interest * Math.pow(1 + monthly_interest, total_payments)) /
          (Math.pow(1 + monthly_interest, total_payments) - 1)
        ).toFixed(2)
      );

      const monthly_property_tax = parseFloat(((property_tax / 100) * home_price / 12).toFixed(2));
      const monthly_home_insurance = parseFloat(((home_insurance / 100) * home_price / 12).toFixed(2));
      const monthly_hoa = parseFloat(hoa_fees.toFixed(2));
      const monthly_mortgage_insurance = parseFloat(((mortgage_insurance / 100) * loan_amount / 12).toFixed(2));

      const total_monthly_payment = parseFloat(
        (
          principal_and_interest +
          monthly_property_tax +
          monthly_home_insurance +
          monthly_hoa +
          monthly_mortgage_insurance
        ).toFixed(2)
      );

      const estimated_closing_cost = parseFloat((0.02 * home_price).toFixed(2));

      return {
        home_location: project.neighborhood,
        home_price,
        down_payment: downPayment,
        loan_amount,
        loan_type,
        interest_rate,
        loan_term_years,
        breakdown: {
          principal_and_interest,
          property_tax: monthly_property_tax,
          home_insurance: monthly_home_insurance,
          hoa: monthly_hoa,
          mortgage_insurance: monthly_mortgage_insurance,
        },
        total_monthly_payment,
        estimated_closing_cost,
      };
    } catch (error) {
      console.error("[calculateMortgage] Error:", error);
      throw new InternalServerError("Failed to calculate mortgage.");
    }
  }
}



