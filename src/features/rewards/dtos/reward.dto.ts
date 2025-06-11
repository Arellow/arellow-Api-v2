export interface EarningHistoryEntry {
  type: "earned" | "used"; 
  description: string;
  date: string; 
  points: number;
  editable?: boolean; 
}

export interface UserEarningsDto {
  points: {
    total: number; 
    uploaded: number; 
    sold: number; 
  };
  naira: {
    total: number; 
    uploaded: number;
    sold: number;
  };
  history: EarningHistoryEntry[]; 
}

export interface WithdrawRewardResponseDto {
  message: string;
}


export interface RewardsSummaryDto {
  totalRewards: number;
  withdrawalRequests: number;
  earnings: {
    total: number;
    uploaded: number;
    sold: number;
  };
}

export interface WithdrawalRequestDto {
  userName: string;
  points: number;
  bankAccountName: string;
  bankName: string;
  bankAccountNumber: string;
  status: string;
 
}

export interface RewardsResponseDto {
  summary: RewardsSummaryDto;
  withdrawalRequests: WithdrawalRequestDto[];
}


export interface RewardDetailsDto {
  userName: string;
  email: string;
  phone: string;
  is_verified: boolean;
  lastLogin: string;
}

export interface ActivityHistoryDto {
  uploadPoints: number;
  soldPoints: number;
  totalPoints: number;
  property: string;
  date: string;
}

export interface RewardDetailsResponseDto {
  totalPointsEarned: number;
  withdrawnPoints: number;
  rewardDetails: RewardDetailsDto;
  activityHistory: ActivityHistoryDto[];
}