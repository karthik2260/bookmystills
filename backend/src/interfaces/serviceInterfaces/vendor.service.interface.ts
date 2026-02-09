import mongoose from 'mongoose';
import { VendorDocument } from '../../models/vendorModel';
import { FindAllVendorsResult, IVendorLoginResponse, VendorSession } from '../commonInterfaces';
import { AcceptanceStatus } from '../../enums/commonEnums';
import { VendorLoginRequestDTO, VendorProfileResponseDTO, VendorResponseDTO, VendorSignUpRequestDTO, VendorSignupResponseDTO, VendorUpdateProfileResponseDTO } from '../../dto/vendorDTO';

export interface IVendorService {
  login(loginDto:VendorLoginRequestDTO): Promise<IVendorLoginResponse>;
  create_RefreshToken(refreshToken: string): Promise<string>;
  getVendors(
    page: number,
    limit: number,
    search: string,
    status?: string,
  ): Promise<FindAllVendorsResult>;
  create_RefreshToken(refreshToken: string): Promise<string>;

  registerVendor(data: {
    email: string;
    name: string;
    password: string;
    city: string;
    contactinfo: string;
    companyName: string;
    about: string;
  }): Promise<VendorSession>;
  signup(
    data:VendorSignUpRequestDTO
  ): Promise<{ vendor: VendorSignupResponseDTO }>;
  handleForgotPassword(email: string): Promise<void>;
  newPasswordChange(token: string, password: string): Promise<void>;
  validateToken(token: string): Promise<boolean>;
  passwordCheckVendor(currentPassword: string, newPassword: string, vendorId: any): Promise<void>;
  getVendorProfileService(email: string): Promise<VendorProfileResponseDTO>;
  updateProfileService(
    name: string,
    contactinfo: string,
    companyName: string,
    city: string,
    about: string,
    files: Express.Multer.File | null,
    vendorId: any,
  ): Promise<VendorUpdateProfileResponseDTO | null>;
  verifyVendor(
    vendorId: string,
    status: AcceptanceStatus,
    reason?: string,
  ): Promise<{ success: boolean; message: string; reason?: string }>;
}
