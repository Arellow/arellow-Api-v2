import {  UserRole } from "@prisma/client";


export interface RegisterDTO {
  username: string;
  password: string;
  email: string;
  phone_number: string;
  fullname: string;
  role: UserRole,
  country: string
}

export interface UserResponseDTO {
  id: string;
  email: string;
  username: string;
  phone_number: string;
  fullname: string;
  is_verified: boolean;
  suspended: boolean;
  createdAt: Date;
  avatar: string | null;
  role: UserRole,
  kyc: any,

}

export interface VerifyEmailDto {
  token: string;
}
