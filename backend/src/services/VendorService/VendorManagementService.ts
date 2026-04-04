import { IVendorRepository } from '../../interfaces/repositoryInterfaces/vendor.Repository.interface';
import { CustomError } from '../../error/customError';
import { emailTemplates } from '../../util/emailTemplates';
import { sendEmail } from '../../util/sendEmail';
import { AcceptanceStatus, BlockStatus } from '../../enums/commonEnums';
import { FindAllVendorsResult, VendorDetailsWithAll } from '../../interfaces/commonInterfaces';
import HTTP_statusCode from '../../enums/httpStatusCode';
import { s3Service } from '../s3Service';
import { PostDocument } from '../../models/postModel';
import { IVendorManagementService } from '../../interfaces/serviceInterfaces/vendorServiceInterfaces/vendorManagement.interface';
import { VendorDocument } from '../../models/vendorModel';

export class VendorManagementService implements IVendorManagementService {
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

      const updateVendors = await Promise.all(
        result.vendors.map(async (vendor) => {
          if (!vendor) return undefined;

          try {
            const vendorDoc = vendor as VendorDocument;

            if (vendorDoc.imageUrl && vendorDoc.imageUrl !== '') {
              try {
                vendorDoc.imageUrl = await s3Service.getFile(
                  'bookmystills-karthik-gopakumar/vendor/photo/',
                  vendorDoc.imageUrl,
                );
              } catch (error) {
                console.error('Error signing profile image:', error);
              }
            }

            if (vendorDoc.portfolioImages && vendorDoc.portfolioImages.length > 0) {
              try {
                vendorDoc.portfolioImages = await Promise.all(
                  vendorDoc.portfolioImages.map((key: string) =>
                    s3Service.getFile('bookmystills-karthik-gopakumar/vendor/portfolio/', key),
                  ),
                );
              } catch (error) {
                console.error('Error signing portfolio images:', error);
              }
            }

            if (vendorDoc.aadharImages && vendorDoc.aadharImages.length > 0) {
              try {
                vendorDoc.aadharImages = await Promise.all(
                  vendorDoc.aadharImages.map((key: string) =>
                    s3Service.getFile('bookmystills-karthik-gopakumar/vendor/aadhar/', key),
                  ),
                );
              } catch (error) {
                console.error('Error signing aadhar images:', error);
              }
            }

            return vendorDoc;
          } catch (error) {
            console.error('Error processing vendor:', error);
            return vendor;
          }
        }),
      );

      return {
        ...result,
        vendors: updateVendors,
      };
    } catch (error) {
      console.error('Error in finding vendors', error);
      if (error instanceof CustomError) throw error;
      throw new CustomError('Failed to get Vendors', HTTP_statusCode.InternalServerError);
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

      vendor.isAccepted = status;

      if (status === AcceptanceStatus.Accepted) {
        vendor.isActive = true;
        vendor.isVerified = true;
        vendor.rejectionReason = null;
        vendor.reappliedAt = null;
        vendor.reapplyCount = 0;
      } else if (status === AcceptanceStatus.Rejected) {
        vendor.isVerified = false;
        vendor.isActive = true;
        vendor.rejectionReason = reason || 'No reason provided';
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
      console.error('Error in verifying vendor', error);
      if (error instanceof CustomError) throw error;
      throw new CustomError('Failed to Verify vendor', HTTP_statusCode.InternalServerError);
    }
  };
  getAllDetails = async (vendorId: string): Promise<VendorDetailsWithAll> => {
    try {
      const vendorDetails = await this.vendorRepository.getAllPopulate(vendorId);
      console.log('vendorDetails isAccepted:', vendorDetails?.vendor?.isAccepted); // ← add

      const updatedVendorDetails = { ...vendorDetails };

      if (vendorDetails?.imageUrl) {
        try {
          const profileImageUrl = await s3Service.getFile(
            'bookmystills-karthik-gopakumar/vendor/photo/',
            vendorDetails.imageUrl,
          );
          updatedVendorDetails.imageUrl = profileImageUrl;
        } catch (error) {
          console.error('Error generating signed URL for profile image:', error);
        }
      }

      if (vendorDetails.aadharImages && vendorDetails.aadharImages.length > 0) {
        try {
          updatedVendorDetails.aadharImages = await Promise.all(
            vendorDetails.aadharImages.map((key: string) =>
              s3Service.getFile('bookmystills-karthik-gopakumar/vendor/aadhar/', key),
            ),
          );
        } catch (error) {
          console.error('Error generating signed URL for aadhar images:', error);
        }
      }

      if (vendorDetails.posts && Array.isArray(vendorDetails.posts)) {
        const updatedPosts = await Promise.all(
          vendorDetails.posts.map(async (post: PostDocument) => {
            try {
              const postObject = post.toObject ? post.toObject() : post;
              if (postObject.imageUrl && Array.isArray(postObject.imageUrl)) {
                const signedImageUrls = await Promise.all(
                  postObject.imageUrl.map(async (imageFileName: string) => {
                    try {
                      return await s3Service.getFile(
                        'bookmystills-karthik-gopakumar/vendor/post/',
                        imageFileName,
                      );
                    } catch (error) {
                      console.error(`Error getting signed URL for image ${imageFileName}:`, error);
                      return null;
                    }
                  }),
                );
                return {
                  ...postObject,
                  imageUrl: signedImageUrls.filter((url) => url !== null),
                };
              }
              return postObject;
            } catch (error) {
              console.error('Error processing post:', error);
              return post;
            }
          }),
        );
        updatedVendorDetails.posts = updatedPosts;
      }

      return {
        ...vendorDetails,
        ...updatedVendorDetails,
      };
    } catch (error) {
      console.error('Error in getAllDetails:', error);
      throw new CustomError(
        'Failed to getAllDetails from database',
        HTTP_statusCode.InternalServerError,
      );
    }
  };

  SVendorBlockUnblock = async (vendorId: string): Promise<BlockStatus> => {
    try {
      const vendor = await this.vendorRepository.getById(vendorId);
      if (!vendor) {
        throw new CustomError('Vendor not Found', HTTP_statusCode.NotFound);
      }
      vendor.isActive = !vendor.isActive;
      await vendor.save();
      return vendor.isActive ? BlockStatus.UNBLOCK : BlockStatus.BLOCK;
    } catch (error) {
      console.error('Error in SVendorBlockUnblock', error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to block and Unblock', HTTP_statusCode.InternalServerError);
    }
  };
}
