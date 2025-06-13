export interface ListingQueryDto {
  userType?: string; 
  requestCategory?: string;  
  propertyType?: string; 
  country?: string;
  state?: string;
  search?: string; 
  page?: number;
  limit?: number;
  isapproved?: "approved" | "pending" | "rejected";
}

export interface ListingResponseDto {
  id: string;
  propertyName: string | null;
  propertyType: string | null;
  price: number | null;
  location: string | null;
  listingDate: Date;
  propertyImage: string | null;
  status: "approved" | "pending" | "rejected";
  totalCount: number;
}



export interface PropertyResponseDto {
  id: string;
  category?: string | null;
  title?: string | null;
  description?: string | null;
  features: string[];
  amenities: string[];
  property_location?: string | null;
  neighborhood?: string | null;
  number_of_bedrooms?: number | null;
  number_of_bathrooms?: number | null;
  number_of_floors?: number | null;
  square?: number | null;
  price?: number | null;
  outside_view_images: string[];
  living_room_images: string[];
  kitchen_room_images: string[];
  primary_room_images: string[];
  floor_plan_images: string[];
  tour_3d_images: string[];
  other_images: string[];
  banner?: string | null;
  youTube_link?: string | null;
  youTube_thumbnail?: string | null;
  property_type?: string | null;
  listing_type?: string | null;
  property_status?: string | null;
  property_age?: number | null;
  furnishing?: string | null;
  parking_spaces?: number | null;
  total_floors?: number | null;
  available_floor?: number | null;
  facing_direction?: string | null;
  street_width?: number | null;
  plot_area?: number | null;
  construction_status?: string | null;
  possession_status?: string | null;
  transaction_type?: string | null;
  ownership_type?: string | null;
  expected_pricing?: number | null;
  price_per_sqft?: number | null;
  booking_amount?: number | null;
  maintenance_monthly?: number | null; 
  price_negotiable: boolean;
  available_from?: Date | null;
  longitude?: string | null;
  latitude?: string | null;
  distance_between_facility?: any; 
  country?: string | null;
  region?: string | null;
  city?: string | null;
  views: number;
  archive: boolean;
  status: "selling" | "rent" | "sold";
  isapproved: "pending" | "approved" | "rejected";
  rejectreason?: string | null;
  createdAt: Date;
}