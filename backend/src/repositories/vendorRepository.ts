import Vendor ,{ VendorDocument } from "../models/vendorModel";
import { BaseRepository } from "./baseRepository";
import mongoose ,{Document} from "mongoose";
import { CustomError } from "../error/customError";
import { IVendorRepository } from "../interfaces/repositoryInterfaces/vendor.Repository.interface";
import HTTP_statusCode from "../enums/httpStatusCode";



type VendorDocumentWithId = Document<unknown, {}, VendorDocument> &
    VendorDocument &
    Required<{ _id: mongoose.Types.ObjectId }> &
{ __v?: number };



class VendorRepository extends BaseRepository<VendorDocument> implements IVendorRepository {
    constructor() {
        super(Vendor);
    }

     UpdatePassword = async (vendorId: mongoose.Types.ObjectId, hashedPassword: string): Promise<boolean> => {
        try {
            const result = await Vendor.updateOne(
                { _id: vendorId },
                { $set: { password: hashedPassword } }
            );
            return result.modifiedCount > 0;
        } catch (error) {
            console.error('Error in updatePassword:', error);
            throw new CustomError('Failed to update password in database', HTTP_statusCode.InternalServerError);
        }
    }

}

export default VendorRepository