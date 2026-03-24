import { IUserRepository } from '../../interfaces/repositoryInterfaces/user.repository.interface';
import { CustomError } from '../../error/customError';
import HTTP_statusCode from '../../enums/httpStatusCode';
import { UserDocument } from '../../models/userModel';
import { BlockStatus } from '../../enums/commonEnums';
import { IUserManagementService } from '../../interfaces/serviceInterfaces/userServiceInterfaces/UserManagement.service.interface';

export class UserManagementService implements IUserManagementService {
  private userRepository: IUserRepository;

  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
  }

  getUsers = async (
    page: number,
    limit: number,
    search: string,
    status?: string,
  ): Promise<{ users: UserDocument[]; total: number; totalPages: number }> => {
    try {
      const result = await this.userRepository.findAllUsers(page, limit, search, status);
      return result;
    } catch (error) {
      console.error('Error in finding users', error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to get Users', HTTP_statusCode.InternalServerError);
    }
  };

      SUserBlockUnblock = async(userId: string): Promise<BlockStatus> =>{
        try {
            const user = await this.userRepository.getById(userId);
            if (!user) {
                throw new CustomError('User not Found', HTTP_statusCode.NotFound)
            }
            user.isActive = !user.isActive
            await user.save()
            return user.isActive ? BlockStatus.UNBLOCK : BlockStatus.BLOCK
        } catch (error) {
            console.error("Error in SUserBlockUnblock", error);
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError('Failed to block and Unblock', HTTP_statusCode.InternalServerError)
        }
    }
}