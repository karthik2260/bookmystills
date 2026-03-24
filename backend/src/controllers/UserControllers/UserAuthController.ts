import { Request, Response } from 'express';
import { OTP_EXPIRY_TIME,RESEND_COOLDOWN } from '../../enums/commonEnums';
import Messages from '../../enums/errorMessages';
import HTTP_statusCode from '../../enums/httpStatusCode';
import { CustomError } from '../../error/customError';
import { GoogleUserData,IDecodedData,IUserSession } from '../../interfaces/commonInterfaces';
import { IUserService } from '../../interfaces/serviceInterfaces/user.Service.interface';
import generateOTP from '../../util/generateOtp';
import { handleError } from '../../util/handleError';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequestt } from '../../types/userType';
import Jwt from 'jsonwebtoken';

import { SendOtpResponseDTO } from '../../dto/user/auth/response/sendotp.response.dto';
import { SignupRequestDTO } from '../../dto/user/auth/request/signup.request.dto';
import { VerifyOtpRequestDTO } from '../../dto/user/auth/request/verify.otp.request.dto';
import { VerifyOtpResponseDTO } from '../../dto/user/auth/response/verify.otp.response.dto';
import { ResendOtpResponseDTO } from '../../dto/user/auth/response/resend.otp.response.dto';
import { LoginResponseDTO } from '../../dto/user/auth/response/login.response.dto';
import { LoginRequestDTO } from '../../dto/user/auth/request/login.request.dto';
import { RefreshTokenResponseDTO } from '../../dto/user/auth/response/refreshtoken.dto';

declare module 'express-session' {
  interface Session {
    user?: IUserSession;
  }
}

class UserAuthController {
  private userService: IUserService;

  constructor(userService: IUserService) {
    this.userService = userService;
  }

 UserSignup = async (req: Request, res: Response): Promise<void> => {
  try {
    const signupDto = new SignupRequestDTO(req.body); 

    const { email, password, name, contactinfo } = signupDto;


    const otpCode = await generateOTP(email);
    if (otpCode !== undefined) {
      const otpSetTimestamp = Date.now();
      const userData: IUserSession = {
        email, password, name, contactinfo,
        otpCode,
        otpSetTimestamp,
        otpExpiry:   otpSetTimestamp + OTP_EXPIRY_TIME,
        resendTimer: otpSetTimestamp + RESEND_COOLDOWN,
      };

      req.session.user = userData;
      req.session.save((err) => {
        if (err) throw new CustomError(Messages.SAVE_SESSION, HTTP_statusCode.InternalServerError);

        const response = new SendOtpResponseDTO({ 
          message:           Messages.OTP_SENT,
          otpExpiry:         userData.otpExpiry,
          resendAvailableAt: userData.resendTimer,
        });
        res.status(HTTP_statusCode.OK).json(response);
      });
    } else {
      throw new CustomError(Messages.GENERATE_OTP, HTTP_statusCode.InternalServerError);
    }
  } catch (error) {
    handleError(res, error, 'UserSignup');
  }
};

 Login = async (req: Request, res: Response) => {
  try {
    const loginDto = new LoginRequestDTO(req.body);  
    const serviceResponse = await this.userService.login(loginDto);

    res.cookie('refreshToken', serviceResponse.refreshToken, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge:   parseInt(process.env.COOKIE_MAX_AGE || '604800000'),
    });

    const response = new LoginResponseDTO({
      token:   serviceResponse.token,
      user:    serviceResponse.user,
      message: serviceResponse.message,
    });
    res.status(HTTP_statusCode.OK).json(response);

  } catch (error) {
    handleError(res, error, 'Login');
  }
};

  UserLogout = async (req: Request, res: Response): Promise<void> => {
    try {
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });
      res.status(HTTP_statusCode.OK).json({ message: 'User logout Successfully...' });
    } catch (error) {
      handleError(res, error, 'UserLogout');
    }
  };

  VerifyOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { otp } = new VerifyOtpRequestDTO(req.body); 
    const userData = req.session.user;

    if (!userData) {
      throw new CustomError(Messages.SESSION_EXPIRED, HTTP_statusCode.BadRequest);
    }
    if (Date.now() > userData.otpExpiry) {
      throw new CustomError(Messages.OTP_EXPIRED, HTTP_statusCode.BadRequest);
    }
    if (otp !== userData.otpCode) {
      throw new CustomError(Messages.INVALID_OTP, HTTP_statusCode.BadRequest);
    }

    const signupDto = new SignupRequestDTO({
      email:       userData.email,
      password:    userData.password,
      name:        userData.name,
      contactinfo: userData.contactinfo,
    });

    await this.userService.signup(signupDto);

    delete req.session.user;
    req.session.save((err) => {
      if (err) console.error('Error saving session after clearing user data:', err);
    });

    const response = new VerifyOtpResponseDTO(Messages.ACCOUNT_CREATED); 
    res.status(201).json(response);

  } catch (error) {
    handleError(res, error, 'VerifyOTP');
  }
};
 ResendOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const userData = req.session.user;
    if (!userData) {
      throw new CustomError(Messages.SESSION_EXPIRED, HTTP_statusCode.BadRequest);
    }

    const currentTime = Date.now();
    if (currentTime < userData.resendTimer) {
      const waitTime = Math.ceil((userData.resendTimer - currentTime) / 1000);
      throw new CustomError(`Please wait ${waitTime} seconds before requesting new OTP`, 429);
    }

    const newOtp = await this.userService.resendNewOtp(userData.email);

    req.session.user = {
      ...userData,
      otpCode:         newOtp,
      otpSetTimestamp: currentTime,
      otpExpiry:       currentTime + OTP_EXPIRY_TIME,
      resendTimer:     currentTime + RESEND_COOLDOWN,
    };

    const response = new ResendOtpResponseDTO({ 
      message:           'New OTP sent to email',
      otpExpiry:         currentTime + OTP_EXPIRY_TIME,
      resendAvailableAt: currentTime + RESEND_COOLDOWN,
    });
    res.status(HTTP_statusCode.OK).json(response);
  } catch (error) {
    handleError(res, error, 'ResendOtp');
  }
};

  create_RefreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      throw new CustomError(Messages.NO_REFRESHTOKEN, 401);
    }

    try {
      const newAccessToken = await this.userService.create_RefreshToken(refreshToken);

      const response = new RefreshTokenResponseDTO(newAccessToken);
      res.status(HTTP_statusCode.OK).json(response);

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
    const email = req.body.email?.trim().toLowerCase();

    if (!email) {
      throw new CustomError(Messages.EMAIL_REQUIRED, HTTP_statusCode.BadRequest);
    }

    await this.userService.handleForgotPassword(email);
    res.status(HTTP_statusCode.OK).json({ message: Messages.PASSWORD_RESET_LINK });
  } catch (error) {
    handleError(res, error, 'forgotPassword');
  }
};

  changeForgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const token    = req.params.token;
    const password = req.body.password?.trim();

    if (!token) {
      throw new CustomError(Messages.SESSION_EXPIRED, HTTP_statusCode.BadRequest);
    }
    if (!password) {
      throw new CustomError(Messages.PASSWORD_REQUIRED, HTTP_statusCode.BadRequest);
    }

    await this.userService.newPasswordChange(token, password);

    res.status(HTTP_statusCode.OK).json({ message: Messages.PASSWORD_RESET_SUCCESS });
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
      const isValid = await this.userService.validateToken(token);
      if (isValid) res.status(HTTP_statusCode.OK).json({ isValid });
    } catch (error) {
      res.status(HTTP_statusCode.BadRequest).json({ message: (error as Error).message });
    }
  };

changePassword = async (req: AuthenticatedRequestt, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      res.status(HTTP_statusCode.BadRequest).json({ message: Messages.USER_ID_MISSING });
      return;
    }
    if (!currentPassword || !newPassword) {
      res.status(HTTP_statusCode.BadRequest).json({ message: Messages.PASSWORD_REQUIRED });
      return;
    }

    await this.userService.passwordCheckUser(currentPassword, newPassword, userId);
    res.status(HTTP_statusCode.OK).json({ message: 'Password reset successfully.' });
  } catch (error) {
    handleError(res, error, 'changePassword');
  }
};

  

 googleAuth = async (req: Request, res: Response): Promise<void> => {
  try {
    const { credential } = req.body;
    const decodedToken = Jwt.decode(credential) as IDecodedData;

    if (!decodedToken || !decodedToken.email) {
      throw new CustomError('Invalid Google token', HTTP_statusCode.BadRequest);
    }

    const googleUserData: GoogleUserData = {
      email:    decodedToken.email,
      name:     decodedToken.name,
      googleId: decodedToken.sub,
      picture:  decodedToken.picture,
    };

    const serviceResponse =
      await this.userService.authenticateGoogleLogin(googleUserData);

    // refreshToken → cookie only
    res.cookie('refreshToken', serviceResponse.refreshToken, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge:   parseInt(process.env.COOKIE_MAX_AGE || '604800000'),
    });

    // ✅ no isActive check needed — service throws if user is blocked
    res.status(HTTP_statusCode.OK).json({
      token:   serviceResponse.token,
      user:    serviceResponse.user,
      message: serviceResponse.isNewUser
        ? 'Successfully signed up with Google'
        : 'Successfully logged in with Google',
    });

  } catch (error) {
    handleError(res, error, 'googleAuth');
  }
 }
}

export default UserAuthController;