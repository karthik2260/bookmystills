import { AcceptanceStatus } from "../enums/commonEnums";

export interface AdminLoginRequestDTO {
    email:string;
    password:string;
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