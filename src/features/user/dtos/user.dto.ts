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