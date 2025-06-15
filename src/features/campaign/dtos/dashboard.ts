export interface CampaignOverview {
  totalClicks: number;
  totalConversions: number;
  totalBudgetSpent: number;
  trendData: { date: string; clicks: number; conversions: number }[];
}

export interface TopPerformingCampaign {
  campaignName: string;
  platform: string;
  percentage: number;
}

export interface CampaignPerformance {
  campaignName: string;
  impressions: number;
  clicks: number;
  conversions: number;
  cpc: number;
  spend: number;
}

export interface AnalyticsResponse {
  overview: CampaignOverview;
  topPerforming: TopPerformingCampaign[];
  performance: CampaignPerformance[];
}