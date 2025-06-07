
export interface LoginDto {
  email: string;
  password: string;
}



export interface LoginResponseDto {
  status: string;
  message: string;
  data: any; 
  token: string;
  succeeded: boolean;
}

