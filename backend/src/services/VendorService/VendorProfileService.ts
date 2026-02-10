import { IVendorRepository } from '../../interfaces/repositoryInterfaces/vendor.Repository.interface';
import { CustomError } from '../../error/customError';
import HTTP_statusCode from '../../enums/httpStatusCode';
import Messages from '../../enums/errorMessages';
import { s3Service } from '../s3Service';
import { VendorProfileResponseDTO,VendorUpdateProfileResponseDTO } from '../../dto/vendorDTO';
import { VendorMapper } from '../../mapper/vendor.mapper';
export class VendorProfileService {
  private vendorRepository: IVendorRepository;

  constructor(vendorRepository: IVendorRepository) {
    this.vendorRepository = vendorRepository;
  }

  getVendorProfileService = async (
    vendorId: string
  ): Promise<VendorProfileResponseDTO> => {
    try {
      const vendor = await this.vendorRepository.getById(vendorId);

      if (!vendor) {
        throw new CustomError(
          'Vendor not found',
          HTTP_statusCode.InternalServerError
        );
      }

      // Generate signed image URL if image exists
      if (vendor.imageUrl) {
        try {
          const signedUrl = await s3Service.getFile(
            'bookmystills-karthik-gopakumar/vendor/photo/',
            vendor.imageUrl
          );

          vendor.imageUrl = signedUrl; // safe mutation
        } catch (error) {
          console.error('Error generating signed URL:', error);
        }
      }

      // ✅ Map to DTO here
      return VendorMapper.toVendorProfileResponse(vendor);

    } catch (error) {
      console.error('Error in getVendorProfileService:', error);

      if (error instanceof CustomError) {
        throw error;
      }

      throw new CustomError(
        (error as Error).message || 'Failed to get profile details',
        HTTP_statusCode.InternalServerError
      );
    }
  };

  updateProfileService = async (
    name: string,
    contactinfo: string,
    companyName: string,
    city: string,
    about: string,
    files: Express.Multer.File | null,
    vendorId: any,
  ): Promise<VendorUpdateProfileResponseDTO> => {
    try {
      const vendor = await this.vendorRepository.getById(vendorId.toString());
      if (!vendor) {
        throw new CustomError(Messages.USER_NOT_FOUND, HTTP_statusCode.NotFound);
      }

      const updateData: any = {};

      if (name && name !== vendor.name) updateData.name = name;
      if (contactinfo && contactinfo !== vendor.contactinfo)
        updateData.contactinfo = contactinfo;
      if (companyName && companyName !== vendor.companyName)
        updateData.companyName = companyName;
      if (city && city !== vendor.city) updateData.city = city;
      if (about && about !== vendor.about) updateData.about = about;

      if (files) {
        const imageFileName = await s3Service.uploadToS3(
          'bookmystills-karthik-gopakumar/vendor/photo/',
          files,
        );
        updateData.imageUrl = imageFileName;
      }

      if (Object.keys(updateData).length === 0) {
        throw new CustomError('No changes to update', HTTP_statusCode.BadRequest);
      }

      await this.vendorRepository.update(vendorId, updateData);

      const freshVendor = await this.vendorRepository.getById(vendorId.toString());
      if (!freshVendor) {
        throw new CustomError('Vendor not found after update', 500);
      }

      let signedImageUrl: string | undefined;

      if (freshVendor.imageUrl) {
        signedImageUrl = await s3Service.getFile(
          'bookmystills-karthik-gopakumar/vendor/photo/',
          freshVendor.imageUrl,
        );
      }

      return VendorMapper.toUpdateProfileResponse(
        freshVendor,
        signedImageUrl
      );
    } catch (error) {
      console.error('Error in updateProfileService:', error);
      throw error;
    }
  };
}