export interface PropertyRequestDto {
  name: string;
  email: string;
  phone_number: string;
  country?: string;
  state: string;
  property_location: string;
  neighborhood?: string;
  property_category: string;
  property_type: string;
  furnishing_status?: string;
  number_of_bedrooms?: number;
  number_of_bathrooms?: number;
  budget?: number;
  property_description?: string;
  agent_category?: string;
}

export interface PropertyRequest {
  id: string;
  name: string;
  email: string;
  phone_number: string;
  country: string;
  state: string;
  property_location: string;
  neighborhood: string | null ;
  property_category: string;
  property_type: string;
  furnishing_status: string | null;
  number_of_bedrooms: number | null;
  number_of_bathrooms: number | null;
  budget: number | null;
  property_description: string | null;
  agent_category: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string | null;
}

export interface PropertyRequestsResponse {
  data: PropertyRequest[];
  totalCount: number;
}