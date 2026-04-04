import { IVendorRepository } from '../../interfaces/repositoryInterfaces/vendor.Repository.interface';
import { CustomError } from '../../error/customError';
import HTTP_statusCode from '../../enums/httpStatusCode';
import Messages from '../../enums/errorMessages';
import { s3Service } from '../s3Service';
import { IVendorProfileService } from '../../interfaces/serviceInterfaces/vendorServiceInterfaces/vendorProfile.interface';
import { VendorMapper } from '../../mapper/vendor/vendor.mapper';
import { VendorProfileResponseDTO } from '../../dto/vendor/profile/vendor.profile.response.dto';
export class VendorProfileService implements IVendorProfileService {
  private vendorRepository: IVendorRepository;

  constructor(vendorRepository: IVendorRepository) {
    this.vendorRepository = vendorRepository;
  }

  getVendorProfileService = async (vendorId: string): Promise<VendorProfileResponseDTO> => {
    try {
      const vendor = await this.vendorRepository.getById(vendorId);
      if (!vendor) {
        throw new CustomError('Vendor not found', HTTP_statusCode.InternalServerError);
      }

      if (vendor.imageUrl) {
        try {
          vendor.imageUrl = await s3Service.getFile(
            'bookmystills-karthik-gopakumar/vendor/photo/',
            vendor.imageUrl,
          );
        } catch (error) {
          console.error('Error generating signed URL:', error);
        }
      }

      return VendorMapper.toVendorProfileResponse(vendor);
    } catch (error) {
      console.error('Error in getVendorProfileService:', error);
      if (error instanceof CustomError) throw error;
      throw new CustomError(
        (error as Error).message || 'Failed to get profile details',
        HTTP_statusCode.InternalServerError,
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
    vendorId: string,
  ): Promise<VendorProfileResponseDTO> => {
    try {
      const vendor = await this.vendorRepository.getById(vendorId);
      if (!vendor) {
        throw new CustomError(Messages.USER_NOT_FOUND, HTTP_statusCode.NotFound);
      }

      const updateData: {
        name?: string;
        contactinfo?: string;
        companyName?: string;
        city?: string;
        about?: string;
        imageUrl?: string;
      } = {};

      if (name && name !== vendor.name) updateData.name = name;
      if (contactinfo && contactinfo !== vendor.contactinfo) updateData.contactinfo = contactinfo;
      if (companyName && companyName !== vendor.companyName) updateData.companyName = companyName;
      if (city && city !== vendor.city) updateData.city = city;
      if (about && about !== vendor.about) updateData.about = about;

      if (files) {
        if (vendor.imageUrl) {
          try {
            await s3Service.deleteFromS3(
              `bookmystills-karthik-gopakumar/vendor/photo/${vendor.imageUrl}`,
            );
          } catch (error) {
            console.error('Error deleting old image:', error);
          }
        }
        updateData.imageUrl = await s3Service.uploadToS3(
          'bookmystills-karthik-gopakumar/vendor/photo/',
          files,
        );
      }

      if (Object.keys(updateData).length === 0) {
        throw new CustomError('No changes to update', HTTP_statusCode.BadRequest);
      }

      await this.vendorRepository.update(vendorId, updateData);

      return await this.getVendorProfileService(vendorId);
    } catch (error) {
      console.error('Error in updateProfileService:', error);
      if (error instanceof CustomError) throw error;
      throw new CustomError('Failed to update profile', HTTP_statusCode.InternalServerError);
    }
  };
}
