
export interface EarningSummaryResponse {
  total_earning: number;
  withdrawable_earning: number;
  withdrawn_points: number;
}

export interface EarningHistoryFilterDto {
  date?: Date;
  propertyCategory?: string;
  country?: string;
  propertyState?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface EarningHistoryItem {
  uploadedPoint: string;
  soldPoint: string;
  totalPoint: string;
  property?: {
    title: string;
    image: string | null;
    id: string;
  } | null;
  date: Date;
  status: "Earnings" | "Withdraw";
  action: "Earnings" | "Withdraw";
}

export interface EarningHistoryResponse {
  data: EarningHistoryItem[];
  totalCount: number;
}