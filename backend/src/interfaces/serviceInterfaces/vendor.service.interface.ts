import mongoose from "mongoose";
import { VendorDocument } from "../../models/vendorModel";
import { FindAllVendorsResult, IVendorLoginResponse,VendorSession } from "../commonInterfaces";
import { AcceptanceStatus } from "../../enums/commonEnums";


export interface IVendorService {
        login(email: string,password: string): Promise<IVendorLoginResponse>;
        create_RefreshToken(refreshToken: string) : Promise<string>;
            getVendors(page: number, limit: number, search: string, status?: string): Promise<FindAllVendorsResult>;

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
getVendorProfileService(email:string): Promise<VendorDocument>;
updateProfileService(
        name: string, 
        contactinfo: string, 
        companyName: string, 
        city: string, 
        about: string, 
        files: Express.Multer.File | null, 
        vendorId: any
    ): Promise<VendorDocument | null>;
        verifyVendor (vendorId: string, status: AcceptanceStatus): Promise<{success: boolean, message: string}>;

}