import { Property } from "@prisma/client";

export interface EarningSummaryResponse {
  total_earning: number;
  withdrawable_earning: number;
  withdrawn_points: number;
}

export interface EarningHistoryFilterDto {
  date?: Date;
  country?: string;
  state?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface EarningHistoryItem {
  points: number;
  reason: string;
  property?: Pick<Property, "id" | "title"> & { banner?: string | null } | null;
  date: Date;
}

export interface EarningHistoryResponse {
  data: EarningHistoryItem[];
  totalCount: number;
}