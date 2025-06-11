export interface ConfirmForgotPasswordDto {
  resetCode: string;
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
