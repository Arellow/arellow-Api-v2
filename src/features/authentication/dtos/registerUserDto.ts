export interface RegisterDTO {
  username: string;
  password: string;
  email: string;
  phone_number: string;
  fullname: string;
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
}

export interface VerifyEmailDto {
  token: string;
}
