
export interface Project {
  id: string;
  category: string | null;
  title: string | null;
  description: string | null;
  features: string[];
  amenities: string[];
  property_location: string | null;
  neighborhood: string | null;
  number_of_bedrooms: number | null;
  number_of_bathrooms: number | null;
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
  isFeatured: boolean;
  longitude: string | null;
  latitude: string | null;
  distance_between_facility: any;
  country: string | null;
  region: string | null;
  city: string | null;
  views: number;
  archive: boolean;
  status: string;
  isapproved: string;
  rejectreason: string;
  userId: string;
  createdAt: Date;
  chatid: string[];
  likeCount: number; 
  isLiked: boolean;  
}

export interface User {
  id: string;
  email: string;
  username: string;
  fullname: string;
  password: string;
  avatar: string | null;
  banner: string | null;
  phone_number: string;
  gender: string | null;
  city: string | null;
  country: string | null;
  biography: string | null;
  rating: number;
  is_verified: boolean;
  role: string;
  createdAt: Date;
 
}

export interface LikeResponse {
  projectId: string;
  isLiked: boolean;
  likeCount: number;
}

export interface UserLikedPropertiesResponse {
  data: (Project & { totalLikes: number; isLiked: boolean })[];
}

export interface ProjectLikedUsersResponse {
  totalUsers: number;
  users: User[];
}

