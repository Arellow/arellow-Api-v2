
export interface PropertyRequestDto {
  name: string;
  email: string;
  phone_number: string;
  property_category: string;
  property_type: string;
  furnishing_status: string;
  country: string;
  state: string;
  number_of_bedrooms?: number;
  number_of_bathrooms?: number;
  budget?: number;
  property_description?: string;
  saveAndContinue?: boolean;
}

export interface PropertyRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  category: string;
  type: string;
  furnishingStatus: string | null; 
  country: string;
  state: string;
  numberOfBedrooms: number | null;
  numberOfBathrooms: number | null;
  budget: number | null;
  additionalNote: string | null;
  userId: string | null; 
  property_location: string;
  neighborhood: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PropertyRequestsResponse {
  data: PropertyRequest[];
  totalCount: number;
}