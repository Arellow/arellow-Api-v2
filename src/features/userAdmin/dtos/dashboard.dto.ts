import { Property, PropertyStatus } from "@prisma/client";

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

export interface DashboardRewardsResponse {
  total_earning: number;
  sold_earning: number;
  uploaded_earning: number;
}

export interface DashboardPropertyResponse {
  property: string;
  image: string | null;
  views: number;
  status: PropertyStatus;
}

export interface PropertyDetail {
  title: string;
  id: string;
}

export interface DashboardEarningHistoryResponse {
  points: number;
  reason: string;
  property: PropertyDetail | null;
  date: Date;
}

export interface ListedPropertiesPaginationDto {
  page?: number;
  limit?: number;
}

export interface ListedPropertyItem {
  propertyName: string | null;
  price: number | null;
  location: string | null;
  listingDate: Date;
  status: PropertyStatus;
  image: string | null;
}

export interface ListedPropertiesResponse {
  data: ListedPropertyItem[];
  totalCount: number;
}