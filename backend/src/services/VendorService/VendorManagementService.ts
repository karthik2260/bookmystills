import { IVendorRepository } from '../../interfaces/repositoryInterfaces/vendor.Repository.interface';
import { CustomError } from '../../error/customError';
import { emailTemplates } from '../../util/emailTemplates';
import { sendEmail } from '../../util/sendEmail';
import { AcceptanceStatus } from '../../enums/commonEnums';
import { FindAllVendorsResult } from '../../interfaces/commonInterfaces';
import HTTP_statusCode from '../../enums/httpStatusCode';
import { s3Service } from '../s3Service';
export class VendorManagementService {
  private vendorRepository: IVendorRepository;

  constructor(vendorRepository: IVendorRepository) {
    this.vendorRepository = vendorRepository;
  }

  getVendors = async (
    page: number,
    limit: number,
    search: string,
    status?: string,
  ): Promise<FindAllVendorsResult> => {
    try {
      const result = await this.vendorRepository.findAllVendors(page, limit, search, status);
      console.log('VENDORS FROM DB:', result);

      const updateVendors = await Promise.all(
        result.vendors.map(async (vendor) => {
          if (!vendor) {
            return undefined;
          }

          try {
            if (vendor.imageUrl === '') {
              return { ...vendor };
            }

            if (vendor.imageUrl) {
              const signedUrl = await s3Service.getFile(
                'bookmystills-karthik-gopakumar/vendor/photo/',
                vendor.imageUrl,
              );

              return {
                ...vendor,
                imageUrl: signedUrl,
              };
            }
          } catch (error) {
            console.error(`Error getting Signed URL for ${vendor.imageUrl}: `, error);
            return vendor;
          }
        }),
      );

      return {
        ...result,
        vendors: updateVendors,
      };
    } catch (error) {
      console.error('Error in finding users', error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to get Users', HTTP_statusCode.InternalServerError);
    }
  };

  verifyVendor = async (
    vendorId: string,
    status: AcceptanceStatus,
    reason?: string,
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const vendor = await this.vendorRepository.getById(vendorId);
      if (!vendor) {
        return { success: false, message: 'Vendor not found' };
      }

      vendor.isAccepted = status;
      vendor.isActive = status === AcceptanceStatus.Accepted;
      vendor.isVerified = status === AcceptanceStatus.Accepted;

      if (status === AcceptanceStatus.Rejected) {
        vendor.rejectionReason = reason || 'No reason provided';
      } else {
        vendor.rejectionReason = null;
      }

      await vendor.save();

      const emailSubject =
        status === AcceptanceStatus.Accepted
          ? 'Your vendor account has been accepted'
          : 'Your vendor account has been rejected';

      const emailBody =
        status === AcceptanceStatus.Accepted
          ? emailTemplates.vendorAccepted(vendor.name)
          : emailTemplates.vendorRejected(vendor.name, vendor.rejectionReason);

      await sendEmail(vendor.email, emailSubject, emailBody);
      return {
        success: true,
        message:
          status === AcceptanceStatus.Accepted
            ? 'Vendor has been accepted and notified via email'
            : 'Vendor has been rejected and notified via email',
      };
    } catch (error) {
      console.error('Error in verifyinf vendor', error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to Verify vendor', HTTP_statusCode.InternalServerError);
    }
  };
}