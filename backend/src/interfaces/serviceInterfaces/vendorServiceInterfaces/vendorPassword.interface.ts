// File: interfaces/serviceInterfaces/vendorPassword.service.interface.ts
import HTTP_statusCode from '../../../enums/httpStatusCode';
export interface IVendorPasswordService {
  /**
   * Initiates forgot password process by generating a reset token and sending email
   */
  handleForgotPassword(email: string): Promise<void>;

  /**
   * Change password using a valid reset token
   */
  newPasswordChange(token: string, password: string): Promise<void>;

  /**
   * Validate a reset token for expiration and existence
   */
  validateToken(token: string): Promise<boolean>;

  /**
   * Check current password and update with a new password
   */
  passwordCheckVendor(
    currentPassword: string,
    newPassword: string,
    vendorId: string | any,
  ): Promise<void>;
}
