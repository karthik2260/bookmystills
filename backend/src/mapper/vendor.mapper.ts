import { VendorProfileResponseDTO, VendorResponseDTO, VendorSignupResponseDTO, VendorUpdateProfileResponseDTO } from "../dto/vendorDTO";
import { VendorDocument } from "../models/vendorModel";


export const VendorMapper = {
  toSignupResponseDTO(vendor: VendorDocument): VendorSignupResponseDTO {
    return {
      id: vendor._id.toString(),
      email: vendor.email,
      name: vendor.name,
      contactinfo: vendor.contactinfo,
      city: vendor.city,
      companyName: vendor.companyName,
      about: vendor.about,
      isActive: vendor.isActive,
      isVerified: vendor.isVerified,
      isAccepted: vendor.isAccepted,
    };
  },

  toLoginResponseDTO(vendor: VendorDocument | any): VendorResponseDTO {
    return {
      id: vendor._id.toString(),
      email: vendor.email,
      name: vendor.name,
      companyName: vendor.companyName,
      city: vendor.city,
      about: vendor.about,
      contactinfo: vendor.contactinfo,
      isActive: vendor.isActive,
      isVerified: vendor.isVerified,
      isAccepted: vendor.isAccepted,

      logo: vendor.logo || "",
      imageUrl: vendor.imageUrl || "",

      totalBooking: vendor.totalBooking ?? 0,
      postCount: vendor.postCount ?? 0,
      totalRating: vendor.totalRating ?? 0,
      walletBalance: vendor.walletBalance ?? 0,

      rejectionReason: vendor.rejectionReason ?? null,
    };
  },

 toVendorProfileResponse(vendor: VendorDocument): VendorProfileResponseDTO {
  // Convert to plain object to access all properties including timestamps
  const vendorObj = vendor.toObject();
  
  return {
     _id: vendor._id.toString(),
  email: vendor.email,
  name: vendor.name,
  companyName: vendor.companyName,
  city: vendor.city,
  about: vendor.about,
  contactinfo: vendor.contactinfo,
  imageUrl: vendor.imageUrl,
  isVerified: vendor.isVerified,

  createdAt: vendor.createdAt,
  updatedAt: vendor.updatedAt,
  };
},

toUpdateProfileResponse(
  vendor: VendorDocument,
  signedImageUrl?: string
): VendorUpdateProfileResponseDTO {
  return {
    _id: vendor._id.toString(),
    name: vendor.name,
    email: vendor.email,
    companyName: vendor.companyName,
    city: vendor.city,
    about: vendor.about,
    contactinfo: vendor.contactinfo,
    imageUrl: signedImageUrl ?? vendor.imageUrl, // ✅ IMPORTANT
    isVerified: vendor.isVerified,
    createdAt: vendor.createdAt,
    updatedAt: vendor.updatedAt,
  };
}



}
