import { IVendorRepository } from '../../interfaces/repositoryInterfaces/vendor.Repository.interface';
import { CustomError } from '../../error/customError';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { emailTemplates } from '../../util/emailTemplates';
import { sendEmail } from '../../util/sendEmail';
import HTTP_statusCode from '../../enums/httpStatusCode';
import Messages from '../../enums/errorMessages';
export class VendorPasswordService {
  private vendorRepository: IVendorRepository;

  constructor(vendorRepository: IVendorRepository) {
    this.vendorRepository = vendorRepository;
  }

  handleForgotPassword = async (email: string): Promise<void> => {
    try {
      const vendor = await this.vendorRepository.findByEmail(email);
      if (!vendor) {
        throw new CustomError('User not exists', HTTP_statusCode.NotFound);
      }
      const resetToken = crypto.randomBytes(20).toString('hex');
      const resetTokenExpiry = new Date(Date.now() + 30 * 60 * 1000);

      vendor.resetPasswordToken = resetToken;
      vendor.resetPasswordExpires = resetTokenExpiry;
      await vendor.save();

      const resetUrl = `${process.env.FRONTEND_URL}/vendor/forgot-password/${resetToken}`;
      await sendEmail(
        email,
        'Password Reset Request',
        emailTemplates.forgotPassword(vendor.name, resetUrl),
      );
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
      const vendor = await this.vendorRepository.findByToken(token);

      if (!vendor) {
        throw new CustomError('Invalid token', HTTP_statusCode.BadRequest);
      }
      if (!vendor.resetPasswordExpires || new Date() > vendor.resetPasswordExpires) {
        throw new CustomError(
          'Password reset token has expired',
          HTTP_statusCode.InternalServerError,
        );
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      let updateSuccess = await this.vendorRepository.UpdatePassword(vendor._id, hashedPassword);

      if (!updateSuccess) {
        throw new CustomError('Failed to Update password', HTTP_statusCode.InternalServerError);
      } else {
        vendor.resetPasswordExpires = undefined;
        vendor.resetPasswordToken = undefined;
        await vendor.save();
        await sendEmail(
          vendor.email,
          'Password Reset Successful',
          emailTemplates.ResetPasswordSuccess(vendor.name),
        );
      }
    } catch (error) {
      console.error('Error in newPasswordChange:', error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to password', HTTP_statusCode.InternalServerError);
    }
  };

  validateToken = async (token: string): Promise<boolean> => {
    try {
      const vendor = await this.vendorRepository.findByToken(token);

      if (!vendor) {
        throw new CustomError('Invalid token', HTTP_statusCode.InternalServerError);
      }
      if (!vendor.resetPasswordExpires) {
        throw new CustomError(
          'No reset token expiry date found',
          HTTP_statusCode.InternalServerError,
        );
      }

      const currentTime = new Date().getTime();
      const tokenExpiry = new Date(vendor.resetPasswordExpires).getTime();

      if (currentTime > tokenExpiry) {
        vendor.resetPasswordToken = undefined;
        vendor.resetPasswordExpires = undefined;
        await vendor.save();
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

  passwordCheckVendor = async (
    currentPassword: string,
    newPassword: string,
    vendorId: any,
  ): Promise<void> => {
    try {
      const vendor = await this.vendorRepository.getById(vendorId.toString());
      if (!vendor) {
        throw new CustomError(Messages.USER_NOT_FOUND, HTTP_statusCode.NotFound);
      }
      if (!vendor.password) {
        throw new CustomError('User password not set', HTTP_statusCode.InternalServerError);
      }

      const passwordMatch = await bcrypt.compare(currentPassword, vendor.password || '');
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
      const updateSuccess = await this.vendorRepository.UpdatePassword(vendorId, newHashedPassword);
      if (!updateSuccess) {
        throw new CustomError('Failed to update password', HTTP_statusCode.InternalServerError);
      }
      await sendEmail(
        vendor.email,
        'Password Reset Successful',
        emailTemplates.ResetPasswordSuccess(vendor.name),
      );
    } catch (error) {
      console.error('Error in updating password:', error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to changing password.', HTTP_statusCode.InternalServerError);
    }
  };
}