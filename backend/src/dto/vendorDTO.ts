import { AcceptanceStatus } from "../enums/commonEnums";


export interface VendorSignUpRequestDTO {
    email:string;
    name:string;
    password:string;
    city:string;
    contactinfo:string;
    companyName:string;
    about:string
}


export interface VendorCreateDTO {
    email:string;
    password:string;
    name:string;
    contactinfo:string;
    city:string;
    companyName:string;
    about:string
}


export interface VendorSignupResponseDTO {
  id: string;
  name: string;
  email: string;
  contactinfo: string;
  city: string;
  companyName: string;
  about: string;
  isVerified: boolean;
  isActive: boolean;
  isAccepted: AcceptanceStatus
 
}


export interface verifyOtpRequestDTO {
    otp:string;
}


export interface VerifyOtpResponseDTO {
    message:string;
    vendor:VendorSignupResponseDTO
}



export interface VendorLoginRequestDTO {
    email:string;
    password:string;
}


export interface VendorResponseDTO {
  id: string;
  email: string;
  name: string;
  companyName: string;
  city: string;
  about: string;
  contactinfo: string;
  isActive: boolean;
  isVerified: boolean;
  isAccepted: AcceptanceStatus;
  logo: string;
  imageUrl: string;
  totalBooking: number;
  postCount: number;
  totalRating: number;
  walletBalance: number;
  rejectionReason?: string | null;
  
  
}


export interface VendorLoginResponseDTO {
    token:string;
    vendor:VendorResponseDTO;
    message:string;
}


export interface VendorLogoutResponseDTO {
    message:string;
}


export interface VendorRefreshTokenResponseDTO {
    token:string;
}

export interface VendorForgotPasswordRequestDTO {
    email:string;
}

export interface VendorForgotPasswordResponse {
    message:string;
}

export interface VendorChangePasswordRequestDTO {
    token:string;
    password:string;
}

export interface VendorChangePasswordResponseDTO {
    message:string;
}


export interface VendorProfileResponseDTO {
  _id: string;
  email: string;
  name: string;
  companyName: string;
  city: string;
  about: string;
  contactinfo: string;
  imageUrl: string;
  isVerified: boolean;

  createdAt: Date;
  updatedAt: Date;
}


export interface VendorUpdateProfileResponseDTO {
    _id:string;
    name:string;
    email:string;
    companyName:string;
    city:string;
    about:string;
    contactinfo:string;
    imageUrl:string;
    isVerified:boolean;
    createdAt:Date;
    updatedAt:Date;

}




