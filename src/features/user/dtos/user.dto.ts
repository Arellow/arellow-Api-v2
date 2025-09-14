import { PropertyStatus, UserRole } from "@prisma/client";

export interface UserCreateDto {
  email: string;
  username: string;
  fullname: string;
  password: string;
  phone_number: string;
  role?: UserRole;
}

export interface UserUpdateDto {
  fullname?: string;
  username?: string;
   phone_number: {
      phone: string,
      country: string
    },
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
  phone_number: string;
  role: UserRole;
  is_verified: boolean;
  suspended: boolean;
  points?: number;
  createdAt: Date;
  propertystats: {
    totalListed: number,
    totalSold: number,
    totalSelling: number,
  },
  kyc: {
      status: string,
      tryCount: number
  },
  address :{
  country:  string
  city :    string
  state :   string
  location : string
   },
   setting: {
    pushNotification:  boolean,
  emailNotification:  boolean,
  smsNotification:  boolean 
   }
}

export interface ProjectPost {
  id: string;
  title: string;
  price: number | null;
  number_of_bedrooms: number | null;
  number_of_bathrooms: number | null;
  createdAt: Date;
  status: PropertyStatus;
}

export interface UserDetails {
  id: string;
  fullname: string | null;
  email: string | null;
  phone: string | null;
  createdAt: Date;
  avatar?: string | null;
  role?: UserRole;
  projects?: ProjectPost[];
}

export interface RealtorStats {
  id: string;
  fullname: string | null;
  avatar?: string | null;
  earnings: number;
  dealsClosed: number;
  trend: "Rising" | "Falling" | "Steady";
  role?: UserRole;
}

export interface LeaderboardResponse {
  topPerformer: RealtorStats | null;
  leaderboard: RealtorStats[];
}