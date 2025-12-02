import mongoose,{Model,Types} from "mongoose";
import { UserDocument } from "../models/userModel";


export interface User {
    email: string;
    password?: string;
    name: string;
    googleId?: string;
    contactinfo?: string;
    isActive: boolean;
    isGoogleUser: boolean;
    image?: string;
    imageUrl?: string;
    refreshToken?: string;
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
} 



export interface IDecodedData {
    name: string;
    email: string;
    picture?: string;
    sub: string
}

export interface IUserSession {
    email: string;
    password: string;
    name: string;
    contactinfo: string;
    otpCode: string
    otpSetTimestamp: number;
    otpExpiry: number;
    resendTimer: number;
}  


export interface ILoginResponse {
    user: UserDocument;
    message: string
    isNewUser: boolean;
    token: string;
    refreshToken: string;
}

export interface Vendor {
    email: string;
    password?: string;
    name: string;
    companyName: string;
    city: string;
    about: string;
    contactinfo: string;
    isActive: boolean;
    refreshToken: string;
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
}

 export interface IVendorLoginResponse {
    vendor: object,
    message: string,
    isNewVendor: boolean,
    token: string,
    refreshToken: string
}


export interface VendorSession {
    otpSetTimestamp: number | undefined;
    email: string;
    password: string;
    name: string;
    city: string;
    contactinfo: string;
    companyName: string;
    about: string;
    otpCode: string | undefined
    otpExpiry: number;
    resendTimer: number;
}


export interface AdminLoginResponse {
    token: string;
    refreshToken: string;
    adminData: object;
    message: string
  }

  
export interface OTP {
    otp: string | undefined;
    email: string;
    otpSetTimestamp: number | undefined
}