import { UserDocument } from '../../models/userModel';
import { GoogleUserData, User } from '../commonInterfaces';
import { BlockStatus } from '../../enums/commonEnums';
import { SignupRequestDTO } from '../../dto/user/auth/request/signup.request.dto';
import { LoginRequestDTO } from '../../dto/user/auth/request/login.request.dto';
import { LoginResponseDTO } from '../../dto/user/auth/response/login.response.dto';
import { LoginServiceResult } from '../../dto/user/auth/response/login.service.result';
import { GoogleAuthServiceResult } from '../../dto/user/auth/response/google.auth.service.result';
export interface IUserService {
  signup(signupDto: SignupRequestDTO): Promise<void>;
  login(loginDto: LoginRequestDTO): Promise<LoginServiceResult>;
  resendNewOtp(email: string): Promise<string>;
  create_RefreshToken(refreshToken: string): Promise<string>;
  handleForgotPassword(email: string): Promise<void>;
  newPasswordChange(token: string, password: string): Promise<void>;
  validateToken(token: string): Promise<boolean>;
  passwordCheckUser(currentPassword: string, newPassword: string, userId: any): Promise<void>;
  authenticateGoogleLogin(userData: GoogleUserData): Promise<GoogleAuthServiceResult>;
getUserProfileService(userId: string): Promise<UserDocument>;
 updateProfileService(
  name?: string,
  contactinfo?: string,
  userId?: any,
  files?: Express.Multer.File | null,
): Promise<UserDocument | null>;
  getUsers(page: number, limit: number, search: string, status?: string): Promise<{users: UserDocument[], total: number, totalPages: number}>;
    SUserBlockUnblock(userId: string): Promise<BlockStatus>;

}
