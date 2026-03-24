export interface IUserPasswordService {
  handleForgotPassword(email: string): Promise<void>;
  newPasswordChange(token: string, password: string): Promise<void>;
  validateToken(token: string): Promise<boolean>;
  passwordCheckUser(currentPassword: string, newPassword: string, userId: any): Promise<void>;
}