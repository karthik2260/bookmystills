// File: interfaces/serviceInterfaces/vendorProfile.service.interface.ts
import { VendorProfileResponseDTO } from '../../../dto/vendor/profile/vendor.profile.response.dto';
export interface IVendorProfileService {
  /**
   * Get vendor profile by vendor ID
   * @param vendorId - The ID of the vendor
   * @returns VendorProfileResponseDTO
   */
  getVendorProfileService(vendorId: string): Promise<VendorProfileResponseDTO>;

  /**
   * Update vendor profile
   * @param name - Updated name
   * @param contactinfo - Updated contact info
   * @param companyName - Updated company name
   * @param city - Updated city
   * @param about - Updated about info
   * @param files - Optional profile image file
   * @param vendorId - Vendor ID
   * @returns VendorUpdateProfileResponseDTO
   */
  updateProfileService(
    name: string,
    contactinfo: string,
    companyName: string,
    city: string,
    about: string,
    files: Express.Multer.File | null,
    vendorId: string,
  ): Promise<VendorProfileResponseDTO>;
}
