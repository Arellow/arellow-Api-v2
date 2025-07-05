

export interface ProjectPost {
  id: string;
  title: string;
  price: number;
  property_type: string;
  number_of_bedrooms: number;
  number_of_bathrooms: number;
  outside_view_images: string[];
  banner: string | null;
  createdAt: Date;
  likeCount: number; 
  isLiked: boolean;
}

export interface UserDetails {
  id: string;
  fullname: string | null;
  email: string | null;
  phone?: string | null;
  createdAt: Date;
  yearsOnPlatform: number;
}

export interface MortgageCalculation {
  home_location: string | null;
  home_price: number;
  down_payment: number;
  loan_amount: number;
  loan_type: string;
  interest_rate: number;
  loan_term_years: number;
  breakdown: {
    principal_and_interest: number;
    property_tax: number;
    home_insurance: number;
    hoa: number;
    mortgage_insurance: number;
  };
  total_monthly_payment: number;
  estimated_closing_cost: number;
}

export interface SingleProjectResponse {
  id: string;
  category: string | null;
  title: string | null;
  description: string | null;
  features: string[];
  amenities: string[];
  property_location: string | null;
  neighborhood: string | null;
  number_of_bedrooms: number;
  number_of_bathrooms: number;
  number_of_floors: number | null;
  square: number | null;
  price: number | null;
  outside_view_images: string[];
  living_room_images: string[];
  kitchen_room_images: string[];
  primary_room_images: string[];
  floor_plan_images: string[];
  tour_3d_images: string[];
  other_images: string[];
  banner: string | null;
  youTube_link: string | null;
  youTube_thumbnail: string | null;
  property_type: string | null;
  listing_type: string | null;
  property_status: string | null;
  property_age: number | null;
  furnishing: string | null;
  parking_spaces: number | null;
  total_floors: number | null;
  available_floor: number | null;
  facing_direction: string | null;
  street_width: number | null;
  plot_area: number | null;
  construction_status: string | null;
  possession_status: string | null;
  transaction_type: string | null;
  ownership_type: string | null;
  expected_pricing: number | null;
  price_per_sqft: number | null;
  booking_amount: number | null;
  maintenance_monthly: number | null;
  price_negotiable: boolean;
  available_from: Date | null;
  longitude: string | null;
  latitude: string | null;
  distance_between_facility: any;
  country: string | null;
  region: string | null;
  city: string | null;
  views: number;
  isFeatured: boolean;
  archive: boolean;
  status: string;
  isapproved: string;
  rejectreason: string;
  createdAt: Date;
  agent: UserDetails;
}

export interface FeaturedResponse {
  data: ProjectPost[];
  totalCount: number;
}

export interface RecentResponse {
  data: ProjectPost[];
  totalCount: number;
}