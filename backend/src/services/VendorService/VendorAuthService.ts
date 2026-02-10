import { IVendorRepository } from '../../interfaces/repositoryInterfaces/vendor.Repository.interface';
import { CustomError } from '../../error/customError';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { AcceptanceStatus,AuthRole,OTP_EXPIRY_TIME,RESEND_COOLDOWN } from '../../enums/commonEnums';
import { IVendorLoginResponse, VendorSession } from '../../interfaces/commonInterfaces';
import { createAccessToken,createRefreshToken } from '../../config/jwt.config';
import generateOTP from '../../util/generateOtp';
import HTTP_statusCode from '../../enums/httpStatusCode';
import { s3Service } from '../s3Service';
import { VendorLoginRequestDTO,VendorSignUpRequestDTO,VendorSignupResponseDTO } from '../../dto/vendorDTO';
import { VendorMapper } from '../../mapper/vendor.mapper';


export class VendorAuthService {
  private vendorRepository: IVendorRepository;

  constructor(vendorRepository: IVendorRepository) {
    this.vendorRepository = vendorRepository;
  }

  registerVendor = async (data: 
   VendorSignUpRequestDTO
  ): Promise<VendorSession> => {
    const { email, name, password, city, contactinfo, companyName, about } = data;

    const existingVendor = await this.vendorRepository.findByEmail(email);
    if (existingVendor) throw new CustomError('Email already registered', 409);

    const otpCode = await generateOTP(email);

    if (!otpCode)
      throw new CustomError("Couldn't generate OTP", HTTP_statusCode.InternalServerError);

    const otpSetTimestamp = Date.now();
    return {
      email,
      password,
      name,
      contactinfo,
      city,
      companyName,
      about,
      otpCode,
      otpSetTimestamp,
      otpExpiry: otpSetTimestamp + OTP_EXPIRY_TIME,
      resendTimer: otpSetTimestamp + RESEND_COOLDOWN,
    };
  };

  signup = async (
   data:VendorSignUpRequestDTO
  ): Promise<{ vendor: VendorSignupResponseDTO }> => {
    try {
      const existingVendor = await this.vendorRepository.findByEmail(data.email);
      if (existingVendor) throw new CustomError('Vendor already exists', 409);
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(data.password, salt);

      const newVendor = await this.vendorRepository.create({
        email:data.email,
        password:hashedPassword,
        name:data.name,
        contactinfo:data.contactinfo,
        city:data.city,
        companyName:data.companyName,
        about:data.about,
        isActive:false,
        isVerified:false,
        isAccepted:AcceptanceStatus.Requested
      });

      const vendorDto = VendorMapper.toSignupResponseDTO(newVendor)

      return { vendor: vendorDto };
    } catch (error) {
      console.error('Error in Signup', error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to create a New Vendor', HTTP_statusCode.InternalServerError);
    }
  };

  login = async (loginDto:VendorLoginRequestDTO): Promise<IVendorLoginResponse> => {
    try {
      const existingVendor = await this.vendorRepository.findByEmail(loginDto.email);

      if (!existingVendor)
        throw new CustomError('Vendor not Registered', HTTP_statusCode.Unauthorized);

      let vendorWithSignedUrl = existingVendor.toObject();
      if (existingVendor.imageUrl) {
        try {
          const signedImageUrl = await s3Service.getFile(
            'bookmystills/vendor/photo/',
            existingVendor.imageUrl,
          );
          vendorWithSignedUrl = {
            ...vendorWithSignedUrl,
            imageUrl: signedImageUrl,
          };
        } catch (error) {
          console.error('Error generating signed URL during login:', error);
        }
      }

      const passwordMatch = await bcrypt.compare(loginDto.password, existingVendor.password || '');
      if (
        existingVendor.isVerified === false ||
        existingVendor.isAccepted === AcceptanceStatus.Requested
      ) {
        throw new CustomError('Admin needs to verify Your Account', HTTP_statusCode.NoAccess);
      }

      if (!passwordMatch)
        throw new CustomError('Incorrect Password ,Try again', HTTP_statusCode.Unauthorized);
      if (existingVendor.isActive === false)
        throw new CustomError('Account is Blocked by Admin', HTTP_statusCode.NoAccess);

      const token = createAccessToken(existingVendor._id.toString(),AuthRole.VENDOR);

      let { refreshToken } = existingVendor;

      if (!refreshToken || isTokenExpiringSoon(refreshToken)) {
        refreshToken = createRefreshToken(existingVendor._id.toString());
        existingVendor.refreshToken = refreshToken;
        await existingVendor.save();
      }

      const vendorDto = VendorMapper.toLoginResponseDTO(vendorWithSignedUrl)

      return {
        token,
        refreshToken,
        isNewVendor: false,
        vendor: vendorDto,
        message: 'Successfully logged in...',
      };
    } catch (error) {
      console.error('Error in login', error);

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

      const vendor = await this.vendorRepository.getById(decodedToken._id);

      if (!vendor || vendor.refreshToken !== refreshToken) {
        throw new CustomError('Invalid refresh token', HTTP_statusCode.Unauthorized);
      }

      const accessToken = createAccessToken(vendor._id.toString(),AuthRole.VENDOR);
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

function isTokenExpiringSoon(token: string): boolean {
  try {
    const decoded = jwt.decode(token) as { exp: number };
    const expirationTime = decoded.exp * 1000;
    const currentTime = Date.now();
    const timeUntilExpiration = expirationTime - currentTime;

    return timeUntilExpiration < 7 * 24 * 60 * 60 * 1000;
  } catch (error) {
    return true;
  }
}