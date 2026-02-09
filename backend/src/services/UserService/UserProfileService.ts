import { IUserRepository } from '../../interfaces/repositoryInterfaces/user.repository.interface';
import { CustomError } from '../../error/customError';
import HTTP_statusCode from '../../enums/httpStatusCode';
import Messages from '../../enums/errorMessages';
import { UserDocument } from '../../models/userModel';
import { s3Service } from '../s3Service';
export class UserProfileService {
  private userRepository: IUserRepository;

  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
  }

  getUserProfileService = async (userId: string): Promise<UserDocument> => {
    try {
      const user = await this.userRepository.getById(userId.toString());
      if (!user) {
        throw new CustomError(Messages.USER_NOT_FOUND, HTTP_statusCode.InternalServerError);
      }

      if (user?.imageUrl) {
        try {
          // ✅ Fixed: Use consistent folder path 'photo/' instead of 'bookmystills-karthik-gopakumar/photo/'
          const imageUrl = await s3Service.getFile('photo/', user?.imageUrl);
          return {
            ...user.toObject(),
            imageUrl: imageUrl,
          };
        } catch (error) {
          console.error('Error generating signed url:', error);
          return user;
        }
      }
      return user;
    } catch (error) {
      console.error('Error in getUserProfileService:', error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError(
        (error as Error).message || 'Failed to get profile details',
        HTTP_statusCode.InternalServerError,
      );
    }
  };

  updateProfileService = async (
    name?: string,
    contactinfo?: string,
    userId?: any,
    files?: Express.Multer.File | null,
  ): Promise<UserDocument | null> => {
    try {
      const user = await this.userRepository.getById(userId.toString());
      if (!user) {
        throw new CustomError(Messages.USER_NOT_FOUND, HTTP_statusCode.NotFound);
      }

      const updateData: {
        name?: string;
        contactinfo?: string;
        imageUrl?: string;
      } = {};

      // Update name
      if (name && name !== user.name) {
        updateData.name = name;
      }

      // Update contact info
      if (contactinfo && contactinfo !== user.contactinfo) {
        updateData.contactinfo = contactinfo;
      }

      // ✅ Upload image to S3 and store ONLY filename
      if (files) {
        // ✅ Delete old image from S3 if exists
        if (user.imageUrl) {
          try {
            await s3Service.deleteFromS3(`photo/${user.imageUrl}`);
          } catch (error) {
            console.error('Error deleting old image from S3:', error);
            // Continue even if delete fails
          }
        }

        // ✅ Upload new image with proper extension
        const fileKey = await s3Service.uploadToS3('photo/', files);

        // IMPORTANT: store only file key, not full URL
        updateData.imageUrl = fileKey;
      }

      if (Object.keys(updateData).length === 0) {
        throw new CustomError('No changes to update', HTTP_statusCode.BadRequest);
      }

      const updatedUser = await this.userRepository.update(userId, updateData);
      if (!updatedUser) {
        throw new CustomError('Failed to update user', HTTP_statusCode.InternalServerError);
      }

      await updatedUser.save();

      // ✅ Get fresh user data with signed URL
      const freshUser = await this.getUserProfileService(userId.toString());

      return freshUser;
    } catch (error) {
      console.error('Error in updateProfileService:', error);

      if (error instanceof CustomError) {
        throw error;
      }

      throw new CustomError('Failed to update profile.', HTTP_statusCode.InternalServerError);
    }
  };
}