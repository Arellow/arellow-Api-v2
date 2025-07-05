import { UserRole } from "@prisma/client";

export interface RegisterDTO {
  username: string;
  password: string;
  email: string;
  phone_number: string;
  fullname: string;
  role: UserRole
}

export interface UserResponseDTO {
  id: string;
  email: string;
  username: string;
  phone_number: string;
  fullname: string;
  is_verified: boolean;
  createdAt: Date;
  avatar: string | null;
   role: UserRole
}

export interface VerifyEmailDto {
  token: string;
}
