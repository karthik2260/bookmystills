import { IUserRepository } from '../../interfaces/repositoryInterfaces/user.repository.interface';
import { CustomError } from '../../error/customError';
import bcrypt from 'bcrypt';
import HTTP_statusCode from '../../enums/httpStatusCode';
import generateOTP from '../../util/generateOtp';
import {
  createAccessToken,
  createRefreshToken,
  isTokenExpiringSoon,
} from '../../config/jwt.config';
import jwt from 'jsonwebtoken';
import { s3Service } from '../s3Service';
import { UserMapper } from '../../mapper/user/user.mapper';
import { AuthRole } from '../../enums/commonEnums';
import { IUserAuthService } from '../../interfaces/serviceInterfaces/userServiceInterfaces/UserAuth.service.interface';
import { SignupRequestDTO } from '../../dto/user/auth/request/signup.request.dto';
import { LoginRequestDTO } from '../../dto/user/auth/request/login.request.dto';
import { LoginServiceResult } from '../../dto/user/auth/response/login.service.result';
import logger from '../../config/logger';

export class UserAuthService implements IUserAuthService {
  private userRepository: IUserRepository;

  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
  }

  signup = async (signupDto: SignupRequestDTO): Promise<void> => {
    try {
      const { email, password, name, contactinfo } = signupDto;

      const existingUser = await this.userRepository.findByEmail(email);
      if (existingUser) {
        throw new CustomError('User already exists', HTTP_statusCode.Conflict);
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      await this.userRepository.create({
        email,
        password: hashedPassword,
        name,
        contactinfo,
        isActive: true,
      });
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new CustomError('Failed to sign up new User', HTTP_statusCode.InternalServerError);
    }
  };
  resendNewOtp = async (email: string): Promise<string> => {
    try {
      const newOtp = await generateOTP(email);
      return newOtp as string;
    } catch (error) {
      logger.error('Error in resendNewOtp:', error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError(
        (error as Error).message || 'Failed to resend new Otp',
        HTTP_statusCode.InternalServerError,
      );
    }
  };

  login = async (loginDto: LoginRequestDTO): Promise<LoginServiceResult> => {
    try {
      const { email, password } = loginDto;

      const existingUser = await this.userRepository.findByEmail(email);
      if (!existingUser) {
        throw new CustomError('User Not Exist!!..', HTTP_statusCode.Unauthorized);
      }

      const passwordMatch = await bcrypt.compare(password, existingUser.password || '');
      if (!passwordMatch) {
        throw new CustomError('Incorrect Password', HTTP_statusCode.Unauthorized);
      }

      if (!existingUser.isActive) {
        throw new CustomError('Blocked by Admin', HTTP_statusCode.NoAccess);
      }

      if (existingUser.imageUrl) {
        try {
          existingUser.imageUrl = await s3Service.getFile('photo/', existingUser.imageUrl);
        } catch (error) {
          logger.error('Error generating signed URL during login:', error);
        }
      }

      const token = createAccessToken(existingUser._id.toString(), AuthRole.USER);

      let { refreshToken } = existingUser;
      if (!refreshToken || isTokenExpiringSoon(refreshToken)) {
        refreshToken = createRefreshToken(existingUser._id.toString());
        existingUser.refreshToken = refreshToken;
        await existingUser.save();
      }

      return {
        token,
        refreshToken,
        user: UserMapper.toLoginDTO(existingUser), // ✅ mapper in service
        message: 'Successfully Logged in',
      };
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new CustomError('Failed to login', HTTP_statusCode.InternalServerError);
    }
  };
  create_RefreshToken = async (refreshToken: string): Promise<string> => {
    try {
      const secret = process.env.JWT_REFRESH_SECRET_KEY;
      if (!secret) {
        throw new CustomError('Server configuration error', HTTP_statusCode.InternalServerError);
      }

      let decodedToken: { _id?: string };
      try {
        decodedToken = jwt.verify(refreshToken, secret) as { _id?: string };
      } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
          throw new CustomError('Refresh token expired', HTTP_statusCode.Unauthorized);
        }
        throw new CustomError('Invalid refresh token', HTTP_statusCode.Unauthorized);
      }

      if (!decodedToken._id) {
        throw new CustomError('Invalid refresh token payload', HTTP_statusCode.Unauthorized);
      }

      const user = await this.userRepository.getById(decodedToken._id);
      if (!user || user.refreshToken !== refreshToken) {
        throw new CustomError('Invalid refresh token', HTTP_statusCode.Unauthorized);
      }

      return createAccessToken(user._id.toString(), AuthRole.USER);
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new CustomError('Failed to create refresh token', HTTP_statusCode.InternalServerError);
    }
  };
}
