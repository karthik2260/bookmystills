// File: interfaces/serviceInterfaces/vendorAuth.service.interface.ts

import { VendorSignUpRequestDTO } from '../../../dto/vendor/auth/request/vendor.signup.request.dto';
import { VendorReapplyRequestDTO } from '../../../dto/vendor/reapply/vendor.reapply.request.dto';
import { VendorLoginRequestDTO } from '../../../dto/vendorDTO';
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

  signup(data: VendorSession): Promise<void>;

  login(loginDto: VendorLoginRequestDTO): Promise<IVendorLoginResponse>;

  create_RefreshToken(refreshToken: string): Promise<string>;

  reapplyVendor(data: VendorReapplyRequestDTO): Promise<{ success: boolean; message: string }>;
}
