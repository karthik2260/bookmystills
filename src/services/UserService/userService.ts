import { IUserRepository } from '../../interfaces/repositoryInterfaces/user.repository.interface';
import { IUserService } from '../../interfaces/serviceInterfaces/user.Service.interface';
import { GoogleUserData } from '../../interfaces/commonInterfaces';
import { UserAuthService } from './UserAuthService';
import { UserPasswordService } from './UserPasswordService';
import { GoogleAuthService } from './GoogleAuthService';
import { UserProfileService } from './UserProfileService';
import { UserManagementService } from './UserManagementservice';
import { BlockStatus } from '../../enums/commonEnums';
import { IUserAuthService } from '../../interfaces/serviceInterfaces/userServiceInterfaces/UserAuth.service.interface';
import { IUserPasswordService } from '../../interfaces/serviceInterfaces/userServiceInterfaces/UserPassword.service.interface';
import { IGoogleAuthService } from '../../interfaces/serviceInterfaces/userServiceInterfaces/GoogleAuth.service.interface';
import { IUserProfileService } from '../../interfaces/serviceInterfaces/userServiceInterfaces/UserProfile.service.interface';
import { IUserManagementService } from '../../interfaces/serviceInterfaces/userServiceInterfaces/UserManagement.service.interface';
import { SignupRequestDTO } from '../../dto/user/auth/request/signup.request.dto';
import { LoginRequestDTO } from '../../dto/user/auth/request/login.request.dto';
import { LoginResponseDTO } from '../../dto/user/auth/response/login.response.dto';
import { GoogleAuthServiceResult } from '../../dto/user/auth/response/google.auth.service.result';
import { UserListServiceResult } from '../../dto/user/auth/response/user.list.service.result';
import { ProfileUserDTO } from '../../dto/user/profile/profile.user.dto';

class UserService implements IUserService {
  private userRepository: IUserRepository;
  private authService: IUserAuthService;
  private passwordService: IUserPasswordService;
  private googleAuthService: IGoogleAuthService;
  private profileService: IUserProfileService;
  private managementService: IUserManagementService;

  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
    this.authService = new UserAuthService(userRepository);
    this.passwordService = new UserPasswordService(userRepository);
    this.googleAuthService = new GoogleAuthService(userRepository);
    this.profileService = new UserProfileService(userRepository);
    this.managementService = new UserManagementService(userRepository);
  }

  signup = async (signupDto: SignupRequestDTO): Promise<void> => {
    return this.authService.signup(signupDto);
  };

  resendNewOtp = async (email: string): Promise<string> => {
    return this.authService.resendNewOtp(email);
  };

  login = async (
    loginDto: LoginRequestDTO,
  ): Promise<LoginResponseDTO & { refreshToken: string }> => {
    return this.authService.login(loginDto);
  };

  create_RefreshToken = async (refreshToken: string): Promise<string> => {
    return this.authService.create_RefreshToken(refreshToken);
  };

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
    userId: string,
  ): Promise<void> => {
    return this.passwordService.passwordCheckUser(currentPassword, newPassword, userId);
  };

  authenticateGoogleLogin = async (userData: GoogleUserData): Promise<GoogleAuthServiceResult> => {
    return this.googleAuthService.authenticateGoogleLogin(userData);
  };

  getUserProfileService = async (userId: string): Promise<ProfileUserDTO> => {
    return this.profileService.getUserProfileService(userId);
  };

  updateProfileService = async (
    name?: string,
    contactinfo?: string,
    userId?: string,
    files?: Express.Multer.File | null,
  ): Promise<ProfileUserDTO | null> => {
    return this.profileService.updateProfileService(name, contactinfo, userId, files);
  };

  getUsers = async (
    page: number,
    limit: number,
    search: string,
    status?: string,
  ): Promise<UserListServiceResult> => {
    return this.managementService.getUsers(page, limit, search, status);
  };

  SUserBlockUnblock = async (userId: string): Promise<BlockStatus> => {
    return this.managementService.SUserBlockUnblock(userId);
  };
}

export default UserService;
