import Vendor ,{ VendorDocument } from "../models/vendorModel";
import { BaseRepository } from "./baseRepository";
import mongoose ,{Document} from "mongoose";
import { CustomError } from "../error/customError";
import { IVendorRepository } from "../interfaces/repositoryInterfaces/vendor.Repository.interface";
import HTTP_statusCode from "../enums/httpStatusCode";
import { FindAllVendorsResult } from "../interfaces/commonInterfaces";



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

  findAllVendors = async(page: number, limit: number, search: string, status?: string) =>{
        try {
            const skip = (page - 1) * limit;

            let query: { [key: string]: any } = {isVerified: true};

            if (search) {
                query = {
                    $or: [
                        { name: { $regex: search, $options: 'i' } },
                        { email: { $regex: search, $options: 'i' } },
                        { companyName: { $regex: search, $options: 'i' } },
                    ]
                }
            }
            if (status) {
                query.isActive = status === 'active'
            }
            
            const total = await Vendor.countDocuments(query);
            const vendors = await Vendor.find(query)
                .skip(skip)
                .limit(limit)
                .select('-password')
                .sort({totalRating: -1, createdAt: -1 })
            
            return {
                vendors,
                total,
                totalPages: Math.ceil(total / limit)
            }
        } catch (error) {
            throw error
        }   
    }
    

}

export default VendorRepository