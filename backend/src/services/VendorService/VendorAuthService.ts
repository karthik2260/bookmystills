import { IVendorRepository } from '../../interfaces/repositoryInterfaces/vendor.Repository.interface';
import { CustomError } from '../../error/customError';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import {
  AcceptanceStatus,
  AuthRole,
  OTP_EXPIRY_TIME,
  RESEND_COOLDOWN,
} from '../../enums/commonEnums';
import { IVendorLoginResponse, VendorSession } from '../../interfaces/commonInterfaces';
import { createAccessToken, createRefreshToken } from '../../config/jwt.config';
import generateOTP from '../../util/generateOtp';
import HTTP_statusCode from '../../enums/httpStatusCode';
import { s3Service } from '../s3Service';
import {
  VendorLoginRequestDTO,
  VendorSignUpRequestDTO,
  VendorSignupResponseDTO,
} from '../../dto/vendorDTO';
import { VendorMapper } from '../../mapper/vendor.mapper';
import { sendEmail } from '../../util/sendEmail';
import { IVendorAuthService } from '../../interfaces/serviceInterfaces/vendorServiceInterfaces/vendorAuth.interface';

export class VendorAuthService implements IVendorAuthService {
  private vendorRepository: IVendorRepository;

  constructor(vendorRepository: IVendorRepository) {
    this.vendorRepository = vendorRepository;
  }

  registerVendor = async (
    data: VendorSignUpRequestDTO & {
      files?: {
        portfolioImages?: Express.Multer.File[];
        aadharFront?: Express.Multer.File[];
        aadharBack?: Express.Multer.File[];
      };
    },
  ): Promise<VendorSession> => {
    const { email, name, password, city, contactinfo, companyName, about, files } = data;

    const existingVendor = await this.vendorRepository.findByEmail(email);
    if (existingVendor) throw new CustomError('Email already registered', 409);

    // ── Portfolio Images ──
    let portfolioImageKeys: string[] = [];
    if (files?.portfolioImages && files.portfolioImages.length > 0) {
      portfolioImageKeys = await Promise.all(
        files.portfolioImages.map(async (file) => {
          const key = await s3Service.uploadToS3(
            'bookmystills-karthik-gopakumar/vendor/portfolio/',
            file,
          );
          return key;
        }),
      );
    }

    const aadharImageKeys: string[] = [];
    if (files?.aadharFront?.[0]) {
      const frontKey = await s3Service.uploadToS3(
        'bookmystills-karthik-gopakumar/vendor/aadhar/',
        files.aadharFront[0],
      );
      aadharImageKeys.push(frontKey);
    }
    if (files?.aadharBack?.[0]) {
      const backKey = await s3Service.uploadToS3(
        'bookmystills-karthik-gopakumar/vendor/aadhar/',
        files.aadharBack[0],
      );
      aadharImageKeys.push(backKey);
    }

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
      portfolioImages: portfolioImageKeys,
      aadharImages: aadharImageKeys,
    };
  };
  signup = async (data: VendorSignUpRequestDTO): Promise<{ vendor: VendorSignupResponseDTO }> => {
    try {
      const existingVendor = await this.vendorRepository.findByEmail(data.email);
      if (existingVendor) throw new CustomError('Vendor already exists', 409);

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(data.password, salt);

      const newVendor = await this.vendorRepository.create({
        email: data.email,
        password: hashedPassword,
        name: data.name,
        contactinfo: data.contactinfo,
        city: data.city,
        companyName: data.companyName,
        about: data.about,
        portfolioImages: data.portfolioImages || [],
        aadharImages: data.aadharImages || [],
        isActive: false,
        isVerified: false,
        isAccepted: AcceptanceStatus.Requested,
      });

      const vendorDto = VendorMapper.toSignupResponseDTO(newVendor);
      return { vendor: vendorDto };
    } catch (error) {
      console.error('Error in Signup', error);
      if (error instanceof CustomError) throw error;
      throw new CustomError('Failed to create a New Vendor', HTTP_statusCode.InternalServerError);
    }
  };

  login = async (loginDto: VendorLoginRequestDTO): Promise<IVendorLoginResponse> => {
    try {
      const existingVendor = await this.vendorRepository.findByEmail(loginDto.email);

      if (!existingVendor)
        throw new CustomError('Vendor not Registered', HTTP_statusCode.Unauthorized);

      const passwordMatch = await bcrypt.compare(loginDto.password, existingVendor.password || '');
      if (!passwordMatch)
        throw new CustomError('Incorrect Password, Try again', HTTP_statusCode.Unauthorized);

      if (
        existingVendor.isActive === false &&
        existingVendor.isAccepted === AcceptanceStatus.Accepted
      ) {
        throw new CustomError('Account is Blocked by Admin', HTTP_statusCode.NoAccess);
      }

      if (existingVendor.isAccepted === AcceptanceStatus.Requested) {
        throw new CustomError(
          'Your account is pending admin verification',
          HTTP_statusCode.NoAccess,
        );
      }

      const token = createAccessToken(existingVendor._id.toString(), AuthRole.VENDOR);

      let { refreshToken } = existingVendor;
      if (!refreshToken || isTokenExpiringSoon(refreshToken)) {
        refreshToken = createRefreshToken(existingVendor._id.toString());
        existingVendor.refreshToken = refreshToken;
        await existingVendor.save();
      }

      let vendorWithSignedUrl = existingVendor.toObject();
      if (existingVendor.imageUrl) {
        try {
          const signedImageUrl = await s3Service.getFile(
            'bookmystills-karthik-gopakumar/vendor/photo/',
            existingVendor.imageUrl,
          );
          vendorWithSignedUrl = { ...vendorWithSignedUrl, imageUrl: signedImageUrl };
        } catch (error) {
          console.error('Error generating signed URL during login:', error);
        }
      }
      console.log('Login vendor isAccepted:', existingVendor.isAccepted);

      const vendorDto = VendorMapper.toLoginResponseDTO(vendorWithSignedUrl);
      console.log('DTO isAccepted:', vendorDto.isAccepted);

      return {
        token,
        refreshToken,
        isNewVendor: false,
        vendor: vendorDto,
        message: 'Successfully logged in...',
      };
    } catch (error) {
      console.error('Error in login', error);
      if (error instanceof CustomError) throw error;
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

      const accessToken = createAccessToken(vendor._id.toString(), AuthRole.VENDOR);
      return accessToken;
    } catch (error) {
      console.error('Error while creatin refreshToken', error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to create refresh Token', HTTP_statusCode.InternalServerError);
    }
  };

  reapplyVendor = async (
    vendorId: string,
    files?: {
      portfolioImages?: Express.Multer.File[];
      aadharFront?: Express.Multer.File[];
      aadharBack?: Express.Multer.File[];
    },
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const vendor = await this.vendorRepository.getById(vendorId);

      if (!vendor) {
        throw new CustomError('Vendor not found', HTTP_statusCode.NotFound);
      }

      if (vendor.isAccepted !== AcceptanceStatus.Rejected) {
        throw new CustomError('Only rejected vendors can reapply', HTTP_statusCode.BadRequest);
      }

      if ((vendor.reapplyCount || 0) >= 3) {
        throw new CustomError(
          'Maximum reapply attempts (3) reached. Please contact support.',
          HTTP_statusCode.BadRequest,
        );
      }

      if (files?.portfolioImages && files.portfolioImages.length > 0) {
        const portfolioKeys = await Promise.all(
          files.portfolioImages.map((file) =>
            s3Service.uploadToS3('bookmystills-karthik-gopakumar/vendor/portfolio/', file),
          ),
        );
        vendor.portfolioImages = portfolioKeys;
      }

      const newAadharKeys: string[] = [];
      if (files?.aadharFront?.[0]) {
        const key = await s3Service.uploadToS3(
          'bookmystills-karthik-gopakumar/vendor/aadhar/',
          files.aadharFront[0],
        );
        newAadharKeys.push(key);
      }
      if (files?.aadharBack?.[0]) {
        const key = await s3Service.uploadToS3(
          'bookmystills-karthik-gopakumar/vendor/aadhar/',
          files.aadharBack[0],
        );
        newAadharKeys.push(key);
      }
      if (newAadharKeys.length > 0) {
        vendor.aadharImages = newAadharKeys;
      }

      vendor.isAccepted = AcceptanceStatus.Reapplied;
      vendor.rejectionReason = null;
      vendor.reappliedAt = new Date();
      vendor.reapplyCount = (vendor.reapplyCount || 0) + 1;

      await vendor.save();

      const adminEmail = process.env.ADMIN_EMAIL!;
      await sendEmail(
        adminEmail,
        `Vendor Reapplication - ${vendor.name}`,
        `
        <h2>Vendor Reapplication Received</h2>
        <p><strong>${vendor.name}</strong> (${vendor.email}) has reapplied.</p>
        <p>Reapply attempt: ${vendor.reapplyCount} of 3</p>
        <p>Please review their updated documents in the admin panel.</p>
      `,
      );

      return {
        success: true,
        message: 'Reapplication submitted. Admin will review your documents shortly.',
      };
    } catch (error) {
      console.error('Error in reapplyVendor:', error);
      if (error instanceof CustomError) throw error;
      throw new CustomError('Failed to submit reapplication', HTTP_statusCode.InternalServerError);
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
