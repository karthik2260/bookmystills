// File: interfaces/serviceInterfaces/vendorAuth.service.interface.ts

import {
  VendorLoginRequestDTO,
  VendorSignUpRequestDTO,
  VendorSignupResponseDTO,
} from '../../../dto/vendorDTO';
import { IVendorLoginResponse, VendorSession } from '../../commonInterfaces';

export interface IVendorAuthService {
  registerVendor(
    data: VendorSignUpRequestDTO & {
      files?: {
        portfolioImages?: Express.Multer.File[];
        aadharFront?: Express.Multer.File[];
        aadharBack?: Express.Multer.File[];
      };
    },
  ): Promise<VendorSession>;

  signup(data: VendorSignUpRequestDTO): Promise<{ vendor: VendorSignupResponseDTO }>;

  login(loginDto: VendorLoginRequestDTO): Promise<IVendorLoginResponse>;

  create_RefreshToken(refreshToken: string): Promise<string>;

  reapplyVendor(
    vendorId: string,
    files?: {
      portfolioImages?: Express.Multer.File[];
      aadharFront?: Express.Multer.File[];
      aadharBack?: Express.Multer.File[];
    },
  ): Promise<{ success: boolean; message: string }>;
}
