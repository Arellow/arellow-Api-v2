export interface ConfirmForgotPasswordDto {
  token: string;
  newpassword: string;
  confirmPassword: string;
}

export interface ForgetPasswordDto {
  email: string;
  isMobile?: boolean;
}
export interface ResendVerificationDto {
  email: string;
}
