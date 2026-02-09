import HTTP_statusCode from '../enums/httpStatusCode';
import { CustomError } from '../error/customError';
import { IUserRepository } from '../interfaces/repositoryInterfaces/user.repository.interface';
import User, { UserDocument } from '../models/userModel';
import { BaseRepository } from './baseRepository';
import mongoose from 'mongoose';

class UserRepository extends BaseRepository<UserDocument> implements IUserRepository {
  constructor() {
    super(User);
  }

  UpdatePassword = async (
    userId: mongoose.Types.ObjectId,
    hashedPassword: string,
  ): Promise<boolean> => {
    try {
      const result = await User.updateOne(
        { _id: userId },
        {
          $set: {
            password: hashedPassword,
          },
        },
      );
      return result.modifiedCount > 0;
    } catch (error) {
      console.error('Error in updatePassword:', error);
      throw new CustomError(
        'Failed to update password in database',
        HTTP_statusCode.InternalServerError,
      );
    }
  };

  UpdatePasswordAndClearToken = async (
    userId: mongoose.Types.ObjectId,
    hashedPassword: string,
  ): Promise<boolean> => {
    try {
      const result = await User.updateOne(
        { _id: userId },
        {
          $set: {
            password: hashedPassword,
          },
          $unset: {
            resetPasswordExpires: 1,
            resetPasswordToken: 1,
          },
        },
      );
      return result.modifiedCount > 0;
    } catch (error) {
      console.error('Error in updatePassword:', error);
      throw new CustomError(
        'Failed to update password in database',
        HTTP_statusCode.InternalServerError,
      );
    }
  };

  clearResetToken = async (userId: mongoose.Types.ObjectId): Promise<void> => {
    try {
      await User.updateOne(
        { _id: userId },
        {
          $unset: {
            resetPasswordExpires: 1,
            resetPasswordToken: 1,
          },
        },
      );
    } catch (error) {
      console.error('Error clearing reset token:', error);
      throw new CustomError('Failed to clear reset token', HTTP_statusCode.InternalServerError);
    }
  };
}

export default UserRepository;
