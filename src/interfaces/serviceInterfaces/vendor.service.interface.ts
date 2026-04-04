import {
  FindAllVendorsResult,
  IVendorLoginResponse,
  VendorDetailsWithAll,
  VendorSession,
} from '../commonInterfaces';
import { AcceptanceStatus, BlockStatus } from '../../enums/commonEnums';
import { VendorProfileResponseDTO } from '../../dto/vendor/profile/vendor.profile.response.dto';
import { VendorReapplyRequestDTO } from '../../dto/vendor/reapply/vendor.reapply.request.dto';
import { VendorLoginRequestDTO } from '../../dto/vendor/auth/request/vendor.logi.requestDTO';

export interface IVendorService {
  login(loginDto: VendorLoginRequestDTO): Promise<IVendorLoginResponse>;
  create_RefreshToken(refreshToken: string): Promise<string>;
  getVendors(
    page: number,
    limit: number,
    search: string,
    status?: string,
  ): Promise<FindAllVendorsResult>;
  create_RefreshToken(refreshToken: string): Promise<string>;
  SVendorBlockUnblock(userId: string): Promise<BlockStatus>;
  reapplyVendor(data: VendorReapplyRequestDTO): Promise<{ success: boolean; message: string }>;

  registerVendor(data: {
    email: string;
    name: string;
    password: string;
    city: string;
    contactinfo: string;
    companyName: string;
    about: string;
    files?: {
      portfolioImages?: Express.Multer.File[];
      aadharFront?: Express.Multer.File[];
      aadharBack?: Express.Multer.File[];
    };
  }): Promise<VendorSession>;
  signup(data: VendorSession): Promise<void>;
  handleForgotPassword(email: string): Promise<void>;
  newPasswordChange(token: string, password: string): Promise<void>;
  validateToken(token: string): Promise<boolean>;
  passwordCheckVendor(
    currentPassword: string,
    newPassword: string,
    vendorId: string,
  ): Promise<void>;
  getVendorProfileService(email: string): Promise<VendorProfileResponseDTO>;
  updateProfileService(
    name: string,
    contactinfo: string,
    companyName: string,
    city: string,
    about: string,
    files: Express.Multer.File | null,
    vendorId: string,
  ): Promise<VendorProfileResponseDTO | null>;
  verifyVendor(
    vendorId: string,
    status: AcceptanceStatus,
    reason?: string,
  ): Promise<{ success: boolean; message: string; reason?: string }>;
  getAllDetails(vendorId: string): Promise<VendorDetailsWithAll>;
  SVendorBlockUnblock(userId: string): Promise<BlockStatus>;
  addDates(
    dates: string[],
    vendorId: string,
  ): Promise<{
    success: boolean;
    message: string;
    addedDates: string[];
    alreadyBookedDates: string[];
  }>;

  showDates(vendorId: string): Promise<string[]>;
  removeDates(
    dates: string[],
    vendorId: string,
  ): Promise<{
    success: boolean;
    removedDates: string[];
  }>;
}
