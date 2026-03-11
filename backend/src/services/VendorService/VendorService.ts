import { IVendorRepository } from '../../interfaces/repositoryInterfaces/vendor.Repository.interface';
import { IVendorService } from '../../interfaces/serviceInterfaces/vendor.service.interface';
import { AcceptanceStatus, BlockStatus, ServiceProvided } from '../../enums/commonEnums';
import jwt from 'jsonwebtoken';
import { CustomizationOption, FindAllVendorsResult,IVendorLoginResponse,VendorDetailsWithAll,VendorSession } from '../../interfaces/commonInterfaces';
import { VendorLoginRequestDTO,VendorProfileResponseDTO,VendorSignUpRequestDTO,VendorSignupResponseDTO,VendorUpdateProfileResponseDTO } from '../../dto/vendorDTO';
import { VendorAuthService } from './VendorAuthService';
import { VendorPasswordService } from './VendorPasswordService';
import { VendorProfileService } from './VendorProfileService';
import { VendorManagementService } from './VendorManagementService';
import mongoose from 'mongoose';
import { VendorAvailabilityService } from './VendorAvailabilityService';
import { VendorDocument } from '../../models/vendorModel';

class VendorService implements IVendorService {
  private vendorRepository: IVendorRepository;
  private authService: VendorAuthService;
  private passwordService: VendorPasswordService;
  private profileService: VendorProfileService;
  private managementService: VendorManagementService;
  private availabilityService: VendorAvailabilityService;

  constructor(vendorRepository: IVendorRepository) {
    this.vendorRepository = vendorRepository;
    this.authService = new VendorAuthService(vendorRepository);
    this.passwordService = new VendorPasswordService(vendorRepository);
    this.profileService = new VendorProfileService(vendorRepository);
    this.managementService = new VendorManagementService(vendorRepository);
    this.availabilityService = new VendorAvailabilityService(vendorRepository);


  }

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

  getAllDetails = async (vendorId: string): Promise<VendorDetailsWithAll> => {
  return this.managementService.getAllDetails(vendorId);
};
  SVendorBlockUnblock = async (vendorId: string): Promise<BlockStatus> => {
  return this.managementService.SVendorBlockUnblock(vendorId);
};

addDates = async (dates: string[], vendorId: string): Promise<{
  success: boolean;
  message: string;
  addedDates: string[];
  alreadyBookedDates: string[];
}> => {
  return this.availabilityService.addDates(dates, vendorId);
};

showDates = async (vendorId: string): Promise<VendorDocument | null> => {
  return this.availabilityService.showDates(vendorId);
};

removeDates = async (dates: string[], vendorId: string): Promise<{
  success: boolean;
  removedDates: string[];
}> => {
  return this.availabilityService.removeDates(dates, vendorId);
};

reapplyVendor = async (
  vendorId: string,
  files?: {
    portfolioImages?: Express.Multer.File[];
    aadharFront?: Express.Multer.File[];
    aadharBack?: Express.Multer.File[];
  }
) => {
  return this.authService.reapplyVendor(vendorId, files);
}




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