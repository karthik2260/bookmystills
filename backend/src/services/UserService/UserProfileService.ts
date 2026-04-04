import { IUserRepository } from '../../interfaces/repositoryInterfaces/user.repository.interface';
import { CustomError } from '../../error/customError';
import HTTP_statusCode from '../../enums/httpStatusCode';
import Messages from '../../enums/errorMessages';
import { s3Service } from '../s3Service';
import { IUserProfileService } from '../../interfaces/serviceInterfaces/userServiceInterfaces/UserProfile.service.interface';
import { ProfileUserDTO } from '../../dto/user/profile/profile.user.dto';
import { UserMapper } from '../../mapper/user/user.mapper';
export class UserProfileService implements IUserProfileService {
  private userRepository: IUserRepository;

  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
  }

  getUserProfileService = async (userId: string): Promise<ProfileUserDTO> => {
    try {
      const user = await this.userRepository.getById(userId.toString());
      if (!user) {
        throw new CustomError(Messages.USER_NOT_FOUND, HTTP_statusCode.InternalServerError);
      }

      if (user?.imageUrl) {
        try {
          const signedUrl = await s3Service.getFile('photo/', user.imageUrl);
          user.imageUrl = signedUrl;
        } catch (error) {
          console.error('Error generating signed URL:', error);
        }
      }

      return UserMapper.toProfileDTO(user);
    } catch (error) {
      console.error('Error in getUserProfileService:', error);
      if (error instanceof CustomError) throw error;
      throw new CustomError(
        (error as Error).message || 'Failed to get profile details',
        HTTP_statusCode.InternalServerError,
      );
    }
  };
  updateProfileService = async (
    name?: string,
    contactinfo?: string,
    userId?: string, // ✅ string not any
    files?: Express.Multer.File | null,
  ): Promise<ProfileUserDTO> => {
    try {
      const user = await this.userRepository.getById(userId!); // ✅ no .toString() needed
      if (!user) {
        throw new CustomError(Messages.USER_NOT_FOUND, HTTP_statusCode.NotFound);
      }

      const updateData: {
        name?: string;
        contactinfo?: string;
        imageUrl?: string;
      } = {};

      if (name && name !== user.name) updateData.name = name;
      if (contactinfo && contactinfo !== user.contactinfo) updateData.contactinfo = contactinfo;

      if (files) {
        if (user.imageUrl) {
          try {
            await s3Service.deleteFromS3(`photo/${user.imageUrl}`);
          } catch (error) {
            console.error('Error deleting old image from S3:', error);
          }
        }
        const fileKey = await s3Service.uploadToS3('photo/', files);
        updateData.imageUrl = fileKey;
      }

      if (Object.keys(updateData).length === 0) {
        throw new CustomError('No changes to update', HTTP_statusCode.BadRequest);
      }

      const updatedUser = await this.userRepository.update(userId!, updateData);
      if (!updatedUser) {
        throw new CustomError('Failed to update user', HTTP_statusCode.InternalServerError);
      }

      await updatedUser.save();

      return await this.getUserProfileService(userId!); // ✅ already string
    } catch (error) {
      console.error('Error in updateProfileService:', error);
      if (error instanceof CustomError) throw error;
      throw new CustomError('Failed to update profile.', HTTP_statusCode.InternalServerError);
    }
  };
}
