import mongoose from "mongoose";
import { VendorDocument } from "../../models/vendorModel";
import { FindAllVendorsResult } from "../commonInterfaces";

export interface IVendorRepository {
    getById(id: string): Promise<VendorDocument | null>; 
    create(data: Partial<VendorDocument>): Promise<VendorDocument>;
    findByEmail(email:string) : Promise< VendorDocument| null>;
    update(id: string, data: Partial<VendorDocument>): Promise<VendorDocument | null>;
    findByToken(resetPasswordToken:string) : Promise< VendorDocument | null>;
    UpdatePassword(vendorId:mongoose.Types.ObjectId, hashedPassword:string) : Promise<boolean>;
    findAllVendors(page: number, limit: number, search: string, status?: string): Promise<FindAllVendorsResult>;

}