import mongoose from "mongoose";
import { VendorDocument } from "../../models/vendorModel";
import { IVendorLoginResponse,VendorSession } from "../commonInterfaces";


export interface IVendorService {
        login(email: string,password: string): Promise<IVendorLoginResponse>;
        create_RefreshToken(refreshToken: string) : Promise<string>;
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
        email: string,
        password: string,
        name: string,
        contactinfo: string,
        city: string,
        companyName: string,
        about: string
    ):Promise<{vendor: VendorDocument}>; 
     handleForgotPassword(email: string): Promise<void>;
    newPasswordChange(token: string, password: string): Promise<void>;
    validateToken (token: string): Promise<boolean>;
    passwordCheckVendor(currentPassword: string, newPassword: string, vendorId: any): Promise<void>;


}