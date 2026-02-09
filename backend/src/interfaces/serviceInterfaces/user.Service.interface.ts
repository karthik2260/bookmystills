import { UserDocument } from '../../models/userModel';
import { GoogleUserData, User } from '../commonInterfaces';
import { BlockStatus } from '../../enums/commonEnums';
import { ILoginResponse } from '../commonInterfaces';
import { LoginRequestDTO, SignupRequestDTO } from '../../dto/userRequest.dto';
import { UserDTO } from '../../dto/userDTO';

export interface IUserService {
  signup(signupDto: SignupRequestDTO): Promise<UserDTO>;
  login(loginDto: LoginRequestDTO): Promise<ILoginResponse>;
  resendNewOtp(email: string): Promise<string>;
  create_RefreshToken(refreshToken: string): Promise<string>;
  handleForgotPassword(email: string): Promise<void>;
  newPasswordChange(token: string, password: string): Promise<void>;
  validateToken(token: string): Promise<boolean>;
  passwordCheckUser(currentPassword: string, newPassword: string, userId: any): Promise<void>;
  googleSignup({ email, name, googleId }: GoogleUserData): Promise<object>;
  authenticateGoogleLogin(userData: GoogleUserData): Promise<ILoginResponse>;
  getUserProfileService(email: string): Promise<UserDocument>;
  updateProfileService(
    name: string,
    contactinfo: string,
    userId: any,
    files: Express.Multer.File | null,
  ): Promise<UserDocument | null>;
}
