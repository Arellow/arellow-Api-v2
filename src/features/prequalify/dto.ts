export interface PreQualificationDto {
  name: string;
  role?: string;
  email: string;
  phone: string;
  home_address?: string;
  state: string;
  city: string;
  property_category: string;
  neighbourhood?: string;
  monthly_budget: number;
 down_payment_goal: number;
  business_or_civil?: string;
  employer_name?: string;
  level_of_employment?: string;
  bank_name?: string;
}

export interface PreQualification {
  id: string;
  name: string;
  role: string | null;
  email: string;
  phone: string;
  home_address: string | null;
  state: string;
  city: string;
  property_category: string;
  neighbourhood: string | null;
  monthly_budget: number;
  down_payment_goal: number;
  business_or_civil: string | null;
  employer_name: string | null;
  level_of_employment: string | null;
  bank_name: string | null;
  createdAt: Date;
  userId: string | null;
}

// Response DTO for multiple pre-qualification requests
export interface PreQualificationsResponse {
  data: PreQualification[];
  totalCount: number;
}