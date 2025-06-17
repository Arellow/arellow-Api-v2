export interface UserCreateDto {
  email: string;
  username: string;
  fullname: string;
  password: string;
  phone_number: string;
  gender?: string;
  city?: string;
  country?: string;
  biography?: string;
  avatar?: string;
  banner?: string;
  role?: string;
  nin_number?: string;
  nin_slip_url?: string;
  cac_number?: string;
  cac_doc_url?: string;
  face_image_url?: string;
}

export interface UserUpdateDto {
  fullname?: string;
  username?: string;
  phone_number?: string;
  avatar?: string;
}

export interface UserUpdateRoleDto {
  role: "admin" | "superadmin" | "buyer" | "agent" | "realtor";
}
export interface UserSuspendDto {
 reason?: string;
}
export interface UserSettingsDto {
  fullname?: string;
  username?: string;
  phone_number?: string;
  email?: string;
  enableTwoFactorAuth?: boolean;
}

export interface UserPasswordUpdateDto {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UserResponseDto {
  id: string;
  email: string;
  username: string;
  fullname: string;
  avatar?: string;
  banner?: string;
  phone_number: string;
  gender?: string;
  city?: string;
  country?: string;
  biography?: string;
  rating: number;
  is_verified: boolean;
  role: string;
  createdAt: Date;
  kyc_status?: string;
  nin_status?: string;
  nin_number?: string;
  nin_slip_url?: string;
  cac_status?: string;
  cac_number?: string;
  cac_doc_url?: string;
  badge?: string;
  face_status?: string;
  face_image_url?: string;
  kyc_verified_at?: Date;
  points?: number;
  last_login?: Date;
  suspended: boolean;
  twoFactorEnabled?: boolean;
  propertiesListed: number;
  propertiesSold: number;
  selling: number; 
}

// features/users/dtos/user.dto.ts
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
  status: string;
  updatedAt?: Date;
}

export interface UserDetails {
  id: string;
  fullname: string | null;
  email: string | null;
  phone: string | null;
  createdAt: Date;
  avatar?: string | null;
  rating?: number;
  role?: string;
  projects?: ProjectPost[];
}

export interface RealtorStats {
  id: string;
  fullname: string | null;
  avatar?: string | null;
  rating: number;
  earnings: number;
  dealsClosed: number;
  trend: "Rising" | "Falling" | "Steady";
  role?: string;
  monthEarnings?: number;
}

export interface LeaderboardResponse {
  topPerformer: RealtorStats | null;
  leaderboard: RealtorStats[];
}