import mongoose from "mongoose";
import { VendorDocument } from "../../models/vendorModel";

export interface IVendorRepository {
    getById(id: string): Promise<VendorDocument | null>; 
    create(data: Partial<VendorDocument>): Promise<VendorDocument>;
    findByEmail(email:string) : Promise< VendorDocument| null>;
    update(id: string, data: Partial<VendorDocument>): Promise<VendorDocument | null>;
    findByToken(resetPasswordToken:string) : Promise< VendorDocument | null>;
    UpdatePassword(vendorId:mongoose.Types.ObjectId, hashedPassword:string) : Promise<boolean>;
    
}