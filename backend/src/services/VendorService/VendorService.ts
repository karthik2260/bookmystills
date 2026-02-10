import { IVendorRepository } from '../../interfaces/repositoryInterfaces/vendor.Repository.interface';
import { IVendorService } from '../../interfaces/serviceInterfaces/vendor.service.interface';
import { AcceptanceStatus } from '../../enums/commonEnums';
import jwt from 'jsonwebtoken';
import { FindAllVendorsResult,IVendorLoginResponse,VendorSession } from '../../interfaces/commonInterfaces';
import { VendorLoginRequestDTO,VendorProfileResponseDTO,VendorSignUpRequestDTO,VendorSignupResponseDTO,VendorUpdateProfileResponseDTO } from '../../dto/vendorDTO';
import { VendorAuthService } from './VendorAuthService';
import { VendorPasswordService } from './VendorPasswordService';
import { VendorProfileService } from './VendorProfileService';
import { VendorManagementService } from './VendorManagementService';

class VendorService implements IVendorService {
  private vendorRepository: IVendorRepository;
  private authService: VendorAuthService;
  private passwordService: VendorPasswordService;
  private profileService: VendorProfileService;
  private managementService: VendorManagementService;

  constructor(vendorRepository: IVendorRepository) {
    this.vendorRepository = vendorRepository;
    this.authService = new VendorAuthService(vendorRepository);
    this.passwordService = new VendorPasswordService(vendorRepository);
    this.profileService = new VendorProfileService(vendorRepository);
    this.managementService = new VendorManagementService(vendorRepository);
  }

  // Delegate to VendorAuthService
  registerVendor = async (data: 
   VendorSignUpRequestDTO
  ): Promise<VendorSession> => {
    return this.authService.registerVendor(data);
  };

  signup = async (
   data:VendorSignUpRequestDTO
  ): Promise<{ vendor: VendorSignupResponseDTO }> => {
    return this.authService.signup(data);
  };

  login = async (loginDto:VendorLoginRequestDTO): Promise<IVendorLoginResponse> => {
    return this.authService.login(loginDto);
  };

  create_RefreshToken = async (refreshToken: string): Promise<string> => {
    return this.authService.create_RefreshToken(refreshToken);
  };

  // Delegate to VendorPasswordService
  handleForgotPassword = async (email: string): Promise<void> => {
    return this.passwordService.handleForgotPassword(email);
  };

  newPasswordChange = async (token: string, password: string): Promise<void> => {
    return this.passwordService.newPasswordChange(token, password);
  };

  validateToken = async (token: string): Promise<boolean> => {
    return this.passwordService.validateToken(token);
  };

  passwordCheckVendor = async (
    currentPassword: string,
    newPassword: string,
    vendorId: any,
  ): Promise<void> => {
    return this.passwordService.passwordCheckVendor(currentPassword, newPassword, vendorId);
  };

  // Delegate to VendorProfileService
  getVendorProfileService = async (
    vendorId: string
  ): Promise<VendorProfileResponseDTO> => {
    return this.profileService.getVendorProfileService(vendorId);
  };

  updateProfileService = async (
    name: string,
    contactinfo: string,
    companyName: string,
    city: string,
    about: string,
    files: Express.Multer.File | null,
    vendorId: any,
  ): Promise<VendorUpdateProfileResponseDTO> => {
    return this.profileService.updateProfileService(name, contactinfo, companyName, city, about, files, vendorId);
  };

  // Delegate to VendorManagementService
  getVendors = async (
    page: number,
    limit: number,
    search: string,
    status?: string,
  ): Promise<FindAllVendorsResult> => {
    return this.managementService.getVendors(page, limit, search, status);
  };

  verifyVendor = async (
    vendorId: string,
    status: AcceptanceStatus,
    reason?: string,
  ): Promise<{ success: boolean; message: string }> => {
    return this.managementService.verifyVendor(vendorId, status, reason);
  };
}

function toTitleCase(city: string): string {
  return city
    .toLowerCase()
    .split(' ')
    .map((word) => {
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

function isTokenExpiringSoon(token: string): boolean {
  try {
    const decoded = jwt.decode(token) as { exp: number };
    const expirationTime = decoded.exp * 1000;
    const currentTime = Date.now();
    const timeUntilExpiration = expirationTime - currentTime;

    return timeUntilExpiration < 7 * 24 * 60 * 60 * 1000;
  } catch (error) {
    return true;
  }
}

export default VendorService;