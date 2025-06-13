export interface DashboardSummaryDto {
  totalListings: number;
  totalSelling: number;
  totalSold: number;
  numberOfRealtors: number;
  pendingProperties: number;
  percentages: {
    listings: number;
    selling: number;
    sold: number;
    realtors: number;
    pendingProperties: number;
  };
}


export interface TopRealtorDto {
  id: string;
  fullname: string;
  avatar: string | null;
  soldCount: number;
  percentage: number;
}

export interface TopRealtorsResponseDto {
  topRealtors: TopRealtorDto[];
}

export interface RewardOverviewDto {
  totalRewardEarned: number;
  propertyUploadEarnings: number;
  propertySoldEarnings: number;
}