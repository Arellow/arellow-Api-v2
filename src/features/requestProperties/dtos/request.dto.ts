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
}