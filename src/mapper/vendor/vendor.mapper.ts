import { VendorDocument } from '../../models/vendorModel';
import { VendorLoginResponseDTO } from '../../dto/vendor/auth/response/vendor.login.response.dto';
import { VendorProfileResponseDTO } from '../../dto/vendor/profile/vendor.profile.response.dto';

export class VendorMapper {
  static toLoginResponseDTO(vendor: VendorDocument): VendorLoginResponseDTO {
    return new VendorLoginResponseDTO({
      id: vendor._id.toString(),
      name: vendor.name,
      email: vendor.email,
      imageUrl: vendor.imageUrl,
      isActive: vendor.isActive,
      isVerified: vendor.isVerified,
      isAccepted: vendor.isAccepted,
    });
  }

  static toVendorProfileResponse(vendor: VendorDocument): VendorProfileResponseDTO {
    return new VendorProfileResponseDTO({
      id: vendor._id.toString(),
      name: vendor.name,
      email: vendor.email,
      imageUrl: vendor.imageUrl,
      companyName: vendor.companyName,
      city: vendor.city,
      about: vendor.about,
      contactinfo: vendor.contactinfo,
      isActive: vendor.isActive,
      isVerified: vendor.isVerified,
      isAccepted: vendor.isAccepted,
      totalRating: vendor.totalRating,
      totalBooking: vendor.totalBooking,
      createdAt: vendor.createdAt.toISOString(),
      updatedAt: vendor.updatedAt.toISOString(),
    });
  }
}
