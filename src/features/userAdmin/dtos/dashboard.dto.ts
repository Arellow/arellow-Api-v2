import { Prisma } from "@prisma/client";

// Summary DTO
export interface DashboardSummaryStats {
  count: number;
  percent: number;
}

export interface DashboardSummaryResponse {
  total_listed: DashboardSummaryStats;
  pending: DashboardSummaryStats;
  selling: DashboardSummaryStats;
  sold: DashboardSummaryStats;
  rejected: DashboardSummaryStats;
  request: DashboardSummaryStats;
}

// Rewards DTO
export interface DashboardRewardsResponse {
  total_earning: number;
  sold_earning: number;
  uploaded_earning: number;
}

// Properties DTO
export interface DashboardPropertyResponse {
  property: string;
  image: string | null;
  views: number;
  status: "approved" | "pending" | "rejected";
  performance: string;
}

// Earning History DTO
export interface PropertyDetail {
  title: string;
  image: string | null;
  id: string;
}

export interface DashboardEarningHistoryResponse {
  uploadedPoint: string;
  soldPoint: string;
  totalPoint: string;
  property: PropertyDetail | null;
  date: Date;
  status: "Earnings" | "Withdraw";
//   action: "Earnings" | "Withdraw";
}


export interface ListedPropertiesPaginationDto {
  page?: number;
  limit?: number;
}

export interface ListedPropertyItem {
  propertyName: string | null;
  propertyType: string | null;
  price: number | null;
  location: string | null;
  listingDate: Date;
  status: "approved" | "pending" | "rejected";
  image: string | null;
}

export interface ListedPropertiesResponse {
  data: ListedPropertyItem[];
  totalCount: number;
}