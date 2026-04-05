import { Request, Response } from 'express';
import { handleError } from '../../util/handleError';
import { CustomError } from '../../error/customError';
import { AuthenticatedRequestt } from '../../types/userType';
import { OTP, VendorSession } from '../../interfaces/commonInterfaces';
import HTTP_statusCode from '../../enums/httpStatusCode';
import Messages from '../../enums/errorMessages';
import { IVendorService } from '../../interfaces/serviceInterfaces/vendor.service.interface';
import jwt from 'jsonwebtoken';
import { verifyOtpRequestDTO } from '../../dto/vendorDTO';
import { VendorLoginRequestDTO } from '../../dto/vendor/auth/request/vendor.logi.requestDTO';
import {
  VendorSignUpFiles,
  VendorSignUpRequestDTO,
} from '../../dto/vendor/auth/request/vendor.signup.request.dto';
import {
  VendorReapplyFiles,
  VendorReapplyRequestDTO,
} from '../../dto/vendor/reapply/vendor.reapply.request.dto';
import { ENV } from '../../config/env';

declare module 'express-session' {
  interface Session {
    vendor: VendorSession;
    otp: OTP | undefined;
  }
}

class VendorAuthController {
  private vendorService: IVendorService;

  constructor(vendorService: IVendorService) {
    this.vendorService = vendorService;
  }

  VendorSignUp = async (req: Request, res: Response): Promise<void> => {
    try {
      const vendorSignupDto = new VendorSignUpRequestDTO({
        email: req.body.email,
        name: req.body.name,
        password: req.body.password,
        city: req.body.city,
        contactinfo: req.body.contactinfo,
        companyName: req.body.companyName,
        about: req.body.about,
        files: req.files as VendorSignUpFiles,
      });

      const vendorData = await this.vendorService.registerVendor(vendorSignupDto);

      req.session.vendor = vendorData;
      req.session.save((err) => {
        if (err) {
          throw new CustomError(Messages.SAVE_SESSION, HTTP_statusCode.InternalServerError);
        }
        res.status(HTTP_statusCode.OK).json({
          message: Messages.OTP_SENT,
          email: vendorData.email,
          otpExpiry: vendorData.otpExpiry,
          resendAvailableAt: vendorData.resendTimer,
        });
      });
    } catch (error) {
      if (error instanceof Error) {
        handleError(res, error, 'VendorSignUp');
      } else {
        handleError(res, new Error('Unknown error'), 'VendorSignUp');
      }
    }
  };
  verifyOTP = async (req: Request, res: Response): Promise<void> => {
    try {
      const verifyOtpDto: verifyOtpRequestDTO = {
        otp: req.body.otp,
      };

      if (!req.session?.vendor) {
        throw new CustomError('Session expired', HTTP_statusCode.BadRequest);
      }

      const sessionData = req.session.vendor;

      if (verifyOtpDto.otp !== sessionData.otpCode) {
        throw new CustomError(Messages.INVALID_OTP, HTTP_statusCode.BadRequest);
      }

      const currentTime = Date.now();
      if (currentTime > sessionData.otpExpiry) {
        throw new CustomError(Messages.OTP_EXPIRED, HTTP_statusCode.BadRequest);
      }

      await this.vendorService.signup(sessionData);

      res.status(HTTP_statusCode.OK).json({ message: Messages.ACCOUNT_CREATED });
    } catch (error) {
      if (error instanceof Error) {
        handleError(res, error, 'VerifyOTP');
      } else {
        handleError(res, new Error('Unknown error'), 'VerifyOTP');
      }
    }
  };

  VendorLogin = async (req: Request, res: Response): Promise<void> => {
    try {
      const loginDto = new VendorLoginRequestDTO({
        email: req.body.email,
        password: req.body.password,
      });

      if (!loginDto.email || !loginDto.password) {
        res.status(HTTP_statusCode.BadRequest).json({
          message: 'Email and password are required',
        });
        return;
      }

      const { token, refreshToken, vendor, message } = await this.vendorService.login(loginDto);

      res.cookie('jwtToken', refreshToken, {
        httpOnly: true,
        secure: ENV.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: ENV.COOKIE_MAX_AGE,
      });
      res.status(HTTP_statusCode.OK).json({ token, vendor, message });
    } catch (error) {
      handleError(res, error, 'VendorLogin');
    }
  };

  VendorLogout = async (req: Request, res: Response): Promise<void> => {
    try {
      res.clearCookie('jwtToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });

      res.status(HTTP_statusCode.OK).json({
        message: 'Vendor Logged out Successfully',
      });
    } catch (error) {
      handleError(res, error, 'VendorLogout');
    }
  };

  CreateRefreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
      const refreshToken = req.cookies.jwtToken;

      if (!refreshToken) {
        throw new CustomError(Messages.NO_REFRESHTOKEN, 401);
      }

      try {
        const newAccessToken = await this.vendorService.create_RefreshToken(refreshToken);

        res.status(HTTP_statusCode.OK).json({
          token: newAccessToken,
        });
      } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
          res.clearCookie('refreshToken');
          throw new CustomError(Messages.REFRESHTOKEN_EXP, 401);
        }
        throw error;
      }
    } catch (error) {
      handleError(res, error, 'CreateRefreshToken');
    }
  };

  forgotPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email } = req.body;

      if (!email) {
        throw new CustomError(Messages.EMAIL_REQUIRED, HTTP_statusCode.BadRequest);
      }

      await this.vendorService.handleForgotPassword(email);

      res.status(HTTP_statusCode.OK).json({
        message: Messages.PASSWORD_RESET_LINK,
      });
    } catch (error) {
      handleError(res, error, 'forgotPassword');
    }
  };

  reapplyVendor = async (req: AuthenticatedRequestt, res: Response): Promise<void> => {
    try {
      const vendorId = req.user?._id?.toString();

      if (!vendorId) {
        res.status(HTTP_statusCode.Unauthorized).json({
          message: Messages.VENDOR_ID_MISSING,
        });
        return;
      }

      const reapplyDto = new VendorReapplyRequestDTO({
        vendorId,
        files: req.files as VendorReapplyFiles,
      });

      const result = await this.vendorService.reapplyVendor(reapplyDto);
      res.status(HTTP_statusCode.OK).json(result);
    } catch (error) {
      handleError(res, error, 'reapplyVendor');
    }
  };
  changeForgotPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const { token } = req.params;
      const { password } = req.body;

      if (!token) {
        throw new CustomError(Messages.SESSION_EXPIRED, HTTP_statusCode.BadRequest);
      } else if (!password) {
        throw new CustomError(Messages.PASSWORD_REQUIRED, HTTP_statusCode.BadRequest);
      }

      await this.vendorService.newPasswordChange(token, password);

      res.status(HTTP_statusCode.OK).json({
        message: Messages.PASSWORD_RESET_SUCCESS,
      });
    } catch (error) {
      handleError(res, error, 'changePassword');
    }
  };
  validateResetToken = async (req: Request, res: Response): Promise<void> => {
    const { token } = req.params;

    try {
      if (!token) {
        throw new CustomError(Messages.TOKEN_REQUIRED, HTTP_statusCode.BadRequest);
      }
      const isValid = await this.vendorService.validateToken(token);
      res.status(HTTP_statusCode.OK).json({ isValid });
    } catch (error) {
      res.status(HTTP_statusCode.BadRequest).json({ message: (error as Error).message });
    }
  };

  changePassword = async (req: AuthenticatedRequestt, res: Response): Promise<void> => {
    try {
      const { currentPassword, newPassword } = req.body;

      const vendorId = req.user?._id?.toString();

      if (!vendorId) {
        throw new CustomError(Messages.VENDOR_ID_MISSING, HTTP_statusCode.Unauthorized);
      }

      if (!currentPassword || !newPassword) {
        throw new CustomError(Messages.PASSWORD_REQUIRED, HTTP_statusCode.BadRequest);
      }

      await this.vendorService.passwordCheckVendor(currentPassword, newPassword, vendorId);

      res.status(HTTP_statusCode.OK).json({ message: Messages.PASSWORD_RESET_SUCCESS });
    } catch (error) {
      handleError(res, error, 'changePassword');
    }
  };
}

export default VendorAuthController;
