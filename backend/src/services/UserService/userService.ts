import { IUserRepository } from '../../interfaces/repositoryInterfaces/user.repository.interface';
import { IUserService } from '../../interfaces/serviceInterfaces/user.Service.interface';
import { ILoginResponse } from '../../interfaces/commonInterfaces';
import { GoogleUserData } from '../../interfaces/commonInterfaces';
import { UserDocument } from '../../models/userModel';
import { LoginRequestDTO,SignupRequestDTO } from '../../dto/userRequest.dto';
import { UserDTO } from '../../dto/userDTO';
import { UserAuthService } from './UserAuthService';
import { UserPasswordService } from './UserPasswordService';
import { GoogleAuthService } from './GoogleAuthService';
import { UserProfileService } from './UserProfileService';

class UserService implements IUserService {
  private userRepository: IUserRepository;
  private authService: UserAuthService;
  private passwordService: UserPasswordService;
  private googleAuthService: GoogleAuthService;
  private profileService: UserProfileService;

  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
    this.authService = new UserAuthService(userRepository);
    this.passwordService = new UserPasswordService(userRepository);
    this.googleAuthService = new GoogleAuthService(userRepository);
    this.profileService = new UserProfileService(userRepository);
  }

// here is used to deligate to user service auth 
  signup = async (signupDto: SignupRequestDTO): Promise<UserDTO> => {
    return this.authService.signup(signupDto);
  };

  resendNewOtp = async (email: string): Promise<string> => {
    return this.authService.resendNewOtp(email);
  };

  login = async (loginDto: LoginRequestDTO): Promise<ILoginResponse> => {
    return this.authService.login(loginDto);
  };

  create_RefreshToken = async (refreshToken: string): Promise<string> => {
    return this.authService.create_RefreshToken(refreshToken);
  };

  // Delegate to UserPasswordService
  
  handleForgotPassword = async (email: string): Promise<void> => {
    return this.passwordService.handleForgotPassword(email);
  };

  newPasswordChange = async (token: string, password: string): Promise<void> => {
    return this.passwordService.newPasswordChange(token, password);
  };

  validateToken = async (token: string): Promise<boolean> => {
    return this.passwordService.validateToken(token);
  };

  passwordCheckUser = async (
    currentPassword: string,
    newPassword: string,
    userId: any,
  ): Promise<void> => {
    return this.passwordService.passwordCheckUser(currentPassword, newPassword, userId);
  };

  // Delegate to GoogleAuthService
  googleSignup = async ({email,name,googleId}:GoogleUserData): Promise<object> => {
    return this.googleAuthService.googleSignup({email, name, googleId});
  };

  authenticateGoogleLogin = async (userData: GoogleUserData): Promise<ILoginResponse> => {
    return this.googleAuthService.authenticateGoogleLogin(userData);
  };

  // Delegate to UserProfileService
  getUserProfileService = async (userId: string): Promise<UserDocument> => {
    return this.profileService.getUserProfileService(userId);
  };

  updateProfileService = async (
    name?: string,
    contactinfo?: string,
    userId?: any,
    files?: Express.Multer.File | null,
  ): Promise<UserDocument | null> => {
    return this.profileService.updateProfileService(name, contactinfo, userId, files);
  };
}

export default UserService;