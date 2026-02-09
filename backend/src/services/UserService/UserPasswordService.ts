import { IUserRepository } from '../../interfaces/repositoryInterfaces/user.repository.interface';
import { CustomError } from '../../error/customError';
import HTTP_statusCode from '../../enums/httpStatusCode';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { sendEmail } from '../../util/sendEmail';
import mongoose from 'mongoose';
import { emailTemplates } from '../../util/emailTemplates';
import Messages from '../../enums/errorMessages';
export class UserPasswordService {
  private userRepository: IUserRepository;

  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
  }

  handleForgotPassword = async (email: string): Promise<void> => {
    try {
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        throw new CustomError('Email does not exist',HTTP_statusCode.BadRequest)
      }
      const resetToken = crypto.randomBytes(20).toString('hex');
      const resetTokenExpiry = new Date(Date.now() + 30 * 60 * 1000);

      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = resetTokenExpiry;
      await user.save();

      const resetUrl = `${process.env.FRONTEND_URL}/forgot-password/${resetToken}`;

      await sendEmail(
        email,
        'Password Reset Request',
        emailTemplates.forgotPassword(user.name, resetUrl),
      );
      this.scheduleTokenCleanup(user._id, resetTokenExpiry);
    } catch (error) {
      console.error('Error in handleForgotPassword:', error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError(
        'Failed to process forgot password request',
        HTTP_statusCode.InternalServerError,
      );
    }
  };

  newPasswordChange = async (token: string, password: string): Promise<void> => {
    try {
      console.log('🔍 Starting newPasswordChange');
      console.log('🔍 Received token:', token);
      console.log('🔍 Token length:', token.length);
      console.log('🔍 Current time:', new Date());

      const user = await this.userRepository.findByToken(token);

      console.log('👤 User found:', user ? 'YES' : 'NO');
      if (user) {
        console.log('👤 User email:', user.email);
        console.log('👤 Token in DB:', user.resetPasswordToken);
        console.log('👤 Token expiry:', user.resetPasswordExpires);
        console.log('👤 Tokens match:', user.resetPasswordToken === token);
      }

      if (!user) {
        console.log('❌ No user found with this token');
        throw new CustomError('Invalid token', HTTP_statusCode.BadRequest); // Change to 400
      }

      if (!user.resetPasswordExpires || new Date() > user.resetPasswordExpires) {
        console.log('❌ Token expired');
        console.log('⏰ Token expired at:', user.resetPasswordExpires);
        console.log('⏰ Current time:', new Date());
        throw new CustomError('Passwo rd reset token has expired', HTTP_statusCode.BadRequest); // Change to 400
      }

      console.log('✅ Token is valid, hashing password...');

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      console.log('💾 Updating password in database...');

      let updateSuccess = await this.userRepository.UpdatePasswordAndClearToken(
        user._id,
        hashedPassword,
      );

      if (!updateSuccess) {
        console.log('❌ Failed to update password');
        throw new CustomError('Failed to Update password', HTTP_statusCode.InternalServerError);
      }

      console.log('✅ Password updated successfully');
      console.log('📧 Sending confirmation email...');

      await sendEmail(
        user.email,
        'Password Reset Successful',
        emailTemplates.ResetPasswordSuccess(user.name),
      );

      console.log('✅ Password reset complete!');
    } catch (error) {
      console.error('❌ Error in newPasswordChange:', error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to reset password', HTTP_statusCode.InternalServerError);
    }
  };

  validateToken = async (token: string): Promise<boolean> => {
    try {
      const user = await this.userRepository.findByToken(token);

      if (!user) {
        throw new CustomError('Invalid token', HTTP_statusCode.InternalServerError);
      }
      if (!user.resetPasswordExpires) {
        throw new CustomError(
          'No reset token expiry date found',
          HTTP_statusCode.InternalServerError,
        );
      }

      const currentTime = new Date().getTime();
      const tokenExpiry = new Date(user.resetPasswordExpires).getTime();

      if (currentTime > tokenExpiry) {
        await this.userRepository.clearResetToken(user._id);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error in validateResetToken:', error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError(
        (error as Error).message || 'Failed to validate token',
        HTTP_statusCode.InternalServerError,
      );
    }
  };

  passwordCheckUser = async (
    currentPassword: string,
    newPassword: string,
    userId: any,
  ): Promise<void> => {
    try {
      const user = await this.userRepository.getById(userId.toString());
      if (!user) {
        throw new CustomError(Messages.USER_NOT_FOUND, HTTP_statusCode.NotFound);
      }
      if (!user.password) {
        throw new CustomError('User password not set', HTTP_statusCode.InternalServerError);
      }

      const passwordMatch = await bcrypt.compare(currentPassword, user.password || '');
      if (!passwordMatch) {
        throw new CustomError('Incorrect Password', HTTP_statusCode.Unauthorized);
      }

      if (currentPassword === newPassword) {
        throw new CustomError(
          "Current and New Passwords can't be same",
          HTTP_statusCode.Unauthorized,
        );
      }

      const salt = await bcrypt.genSalt(10);
      const newHashedPassword = await bcrypt.hash(newPassword, salt);
      const updateSuccess = await this.userRepository.UpdatePassword(userId, newHashedPassword);
      if (!updateSuccess) {
        throw new CustomError('Failed to update password', HTTP_statusCode.InternalServerError);
      }
      await sendEmail(
        user.email,
        'Password Reset Successful',
        emailTemplates.ResetPasswordSuccess(user.name),
      );
    } catch (error) {
      console.error('Error in updating password:', error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to changing password.', HTTP_statusCode.InternalServerError);
    }
  };

  private async scheduleTokenCleanup(
    userId: mongoose.Types.ObjectId,
    expiryTime: Date,
  ): Promise<void> {
    const timeUntilExpiry = new Date(expiryTime).getTime() - Date.now();
    setTimeout(async () => {
      try {
        await this.userRepository.clearResetToken(userId);
      } catch (error) {
        console.error('Error cleaning up expired token:', error);
      }
    }, timeUntilExpiry);
  }
}