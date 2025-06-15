export interface CreateCampaignDto {
  campaignType: string;
  localMediaName: string;
  promotionAd: string;
  targetAudience: string;
  features: string;
  campaignDescription: string;
  imageUrl?: string | null;
  mediaPlatforms: string[];
  startDate: Date;
  endDate: Date;
}

export interface UpdateCampaignDto {
  campaignType?: string;
  localMediaName?: string;
  promotionAd?: string;
  targetAudience?: string;
  features?: string;
  campaignDescription?: string;
  imageUrl?: string | null;
  mediaPlatforms?: string[];
  startDate?: Date;
  endDate?: Date;
}

export interface CampaignFilterDto {
  campaignType?: string;
  page?: number;
  limit?: number;
}

export interface CampaignPost {
  id: string;
  campaignType: string;
  localMediaName: string;
  promotionAd: string;
  targetAudience: string;
  features: string;
  campaignDescription: string;
  imageUrl?: string | null;
  mediaPlatforms: string[];
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CampaignResponse {
  data: CampaignPost[];
  totalCount: number;
}


