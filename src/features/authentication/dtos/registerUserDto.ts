
import { PropertyAddress } from "../../../../generated/prisma/client";
import { UserRole } from "../../../../generated/prisma/enums";


export interface RegisterDTO {
  username: string;
  password: string;
  email: string;
  phone_number: {
    phone: string;
    country: string
  }
  fullname: string;
  role: UserRole,
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
  kyc?: any,
  address: PropertyAddress | null
   AdminPermission:  any
    

}

export interface VerifyEmailDto {
  token: string;
}
