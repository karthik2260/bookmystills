import mongoose,{Schema,Document,Model,Types} from "mongoose";
import { Vendor } from "../interfaces/commonInterfaces";


export interface VendorDocument extends Vendor, Document {
    _id: mongoose.Types.ObjectId;
    email: string;
    password?: string;
    name: string;
    companyName: string;
    city: string;
    about: string;
    isActive: boolean;
    contactinfo: string;
    refreshToken: string;
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
}

export interface VendorModel extends Model<VendorDocument> {
    // Add any static methods here if needed
}

const VendorSchema = new Schema<VendorDocument>({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    companyName: { type: String, required: true },
    city: { type: String, required: true },
    about: { type: String },
    contactinfo: { type: String, required: true, unique: true },
    refreshToken: { type: String },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
        isActive: { type: Boolean, default: true },

     
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

export default mongoose.model<VendorDocument, VendorModel>('Vendor', VendorSchema);