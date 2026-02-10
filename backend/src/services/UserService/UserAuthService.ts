import { IUserRepository } from '../../interfaces/repositoryInterfaces/user.repository.interface';
import { CustomError } from '../../error/customError';
import bcrypt from 'bcrypt';
import HTTP_statusCode from '../../enums/httpStatusCode';
import generateOTP from '../../util/generateOtp';
import { createAccessToken,createRefreshToken,isTokenExpiringSoon } from '../../config/jwt.config';
import jwt from 'jsonwebtoken';
import { ILoginResponse } from '../../interfaces/commonInterfaces';
import { s3Service } from '../s3Service';
import { UserMapper } from '../../mapper/user.mapper';
import { LoginRequestDTO,SignupRequestDTO } from '../../dto/userRequest.dto';
import { UserDTO } from '../../dto/userDTO';
import { AuthRole } from '../../enums/commonEnums';
export class UserAuthService {
  private userRepository: IUserRepository;

  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
  }

  signup = async (signupDto: SignupRequestDTO): Promise<UserDTO> => {
    try {
      const { email, password, name, contactinfo } = signupDto;

      const existingUser = await this.userRepository.findByEmail(email);
      if (existingUser) {
        throw new CustomError('User already exists', HTTP_statusCode.NotFound);
      }
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const isActive: boolean = true;
      const newUser = await this.userRepository.create({
        email,
        password: hashedPassword,
        name,

        contactinfo,
        isActive,
      });
      const userDTO = UserMapper.toDTO(newUser);
      return userDTO;
    } catch (error) {
      console.error('Error in signup', error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to sign up new User', HTTP_statusCode.InternalServerError);
    }
  };

  resendNewOtp = async (email: string): Promise<string> => {
    try {
      const newOtp = await generateOTP(email);
      return newOtp as string;
    } catch (error) {
      console.error('Error in resendNewOtp:', error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError(
        (error as Error).message || 'Failed to resend new Otp',
        HTTP_statusCode.InternalServerError,
      );
    }
  };

  login = async (loginDto: LoginRequestDTO): Promise<ILoginResponse> => {
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
      if (existingUser.isActive === false) {
        throw new CustomError('Blocked by Admin', HTTP_statusCode.NoAccess);
      }

      let userWithSignedUrl = existingUser.toObject();

      if (existingUser?.imageUrl) { 
        try {
          // ✅ IMPORTANT: Use the same folder path as in your uploadToS3 call
          const signedImageUrl = await s3Service.getFile('photo/', existingUser?.imageUrl);

          userWithSignedUrl = {
            ...userWithSignedUrl,
            imageUrl: signedImageUrl,
          };
        } catch (error) {
          console.error('Error generating signed URL during login:', error);
          // Keep the original imageUrl as fallback
        }
      }

      const token = createAccessToken(existingUser._id.toString(),AuthRole.USER);

      let { refreshToken } = existingUser;
      if (!refreshToken || isTokenExpiringSoon(refreshToken)) {
        refreshToken = createRefreshToken(existingUser._id.toString());
        existingUser.refreshToken = refreshToken;
        await existingUser.save();
      }

      const userDTO = UserMapper.toDTO(userWithSignedUrl);

      return {
        token,
        refreshToken,
        isNewUser: false,
        user: userDTO,
        message: 'Succesfully Logged in',
      };
    } catch (error) {
      console.error('Error in Login', error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to login', HTTP_statusCode.InternalServerError);
    }
  };

  create_RefreshToken = async (refreshToken: string): Promise<string> => {
    try {
      const decodedToken = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET_KEY!) as {
        _id: string;
      };

      const user = await this.userRepository.getById(decodedToken._id);

      if (!user || user.refreshToken !== refreshToken) {
        throw new CustomError('Invalid refresh Token', HTTP_statusCode.Unauthorized);
      }

      const accessToken = createAccessToken(user._id.toString(),AuthRole.USER);
      return accessToken;
    } catch (error) {
      console.error('Error while creatin refreshToken', error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to create refresh Token', HTTP_statusCode.InternalServerError);
    }
  };
}