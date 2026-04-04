import { AcceptanceStatus } from '../enums/commonEnums';

export interface AdminLoginRequestDTO {
  email: string;
  password: string;
}

export interface AdminLoginResponseDTO {
  _id: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface VerifyVendorRequestDTO {
  vendorId: string;
  status: AcceptanceStatus;
  rejectionReason?: string;
}

export interface AdminUserListDTO {
  id: string;
  name: string;
  email: string;
  contactinfo?: string;
  imageUrl?: string;
  isGoogleUser: boolean;
  isActive: boolean;
  createdAt: Date;
}

export interface AdminUserListRequestDTO {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}
