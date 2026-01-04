import { IVendorRepository } from "../interfaces/repositoryInterfaces/vendor.Repository.interface";
import { IVendorService } from "../interfaces/serviceInterfaces/vendor.service.interface";
import { CustomError } from "../error/customError";
import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { emailTemplates } from "../util/emailTemplates";
import { sendEmail } from "../util/sendEmail";
import mongoose from "mongoose";
import { AcceptanceStatus, OTP_EXPIRY_TIME,RESEND_COOLDOWN } from "../enums/commonEnums";
import { VendorDocument } from "../models/vendorModel";
import { FindAllVendorsResult, IVendorLoginResponse,Vendor,VendorSession } from "../interfaces/commonInterfaces";
import { createAccessToken,createRefreshToken } from "../config/jwt.config";
import generateOTP from "../util/generateOtp";
import HTTP_statusCode from "../enums/httpStatusCode";
import Messages from "../enums/errorMessages";
import { s3Service } from "./s3Service";
import { stat } from "fs";
import { VendorRequest } from "../types/vendorTypes";






class VendorService implements IVendorService {
        private vendorRepository: IVendorRepository;

        constructor (
            vendorRepository : IVendorRepository
        ) {
            this.vendorRepository = vendorRepository
        }

         registerVendor = async (data: {
        email: string;
        name: string;
        password: string;
        city: string;
        contactinfo: string;
        companyName: string;
        about: string;
    }): Promise<VendorSession> => {
        const { email, name, password, city, contactinfo, companyName, about } = data;

        const existingVendor = await this.vendorRepository.findByEmail(email);
        if (existingVendor) throw new CustomError('Email already registered', 409);

        const otpCode = await generateOTP(email);

        if (!otpCode) throw new CustomError("Couldn't generate OTP", HTTP_statusCode.InternalServerError);

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
    }



     signup = async (
        email: string,
        password: string,
        name: string,
        contactinfo: string,
        city: string,
        companyName: string,
        about: string
    ): Promise<{ vendor: VendorDocument }> => {
        try {
            const existingVendor = await this.vendorRepository.findByEmail(email);
            if (existingVendor) throw new CustomError('Vendor already exists', 409);
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const newVendor = await this.vendorRepository.create({
                email,
                password: hashedPassword,
                name,
                contactinfo,
                city: toTitleCase(city),
                companyName,
                about,
               
                
            })

            return { vendor: newVendor }
        } catch (error) {
            console.error('Error in Signup', error);
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError('Failed to create a New Vendor', HTTP_statusCode.InternalServerError)
        }
    }

      login = async (email: string, password: string): Promise<IVendorLoginResponse> => {
        try {
            const existingVendor = await this.vendorRepository.findByEmail(email);

            if (!existingVendor) throw new CustomError('Vendor not Registered', HTTP_statusCode.Unauthorized);

            let vendorWithSignedUrl = existingVendor.toObject();
            if (existingVendor.imageUrl) {
                try {
                    const signedImageUrl = await s3Service.getFile('bookmystills-karthik-gopakumar/photo/', existingVendor.imageUrl);
                    vendorWithSignedUrl = {
                        ...vendorWithSignedUrl,
                        imageUrl: signedImageUrl
                    };
                } catch (error) {
                    console.error('Error generating signed URL during login:', error);
                }
            }

            const passwordMatch = await bcrypt.compare(
                password,
                existingVendor.password || ''
            )
            if (existingVendor.isVerified === false || existingVendor.isAccepted === AcceptanceStatus.Requested) {
                throw new CustomError('Admin needs to verify Your Account', HTTP_statusCode.NoAccess);
            }

            if (!passwordMatch) throw new CustomError('Incorrect Password ,Try again', HTTP_statusCode.Unauthorized)
            if (existingVendor.isActive === false) throw new CustomError('Account is Blocked by Admin', HTTP_statusCode.NoAccess);

            const token = createAccessToken(existingVendor._id.toString())

            let { refreshToken } = existingVendor;

            if (!refreshToken || isTokenExpiringSoon(refreshToken)) {
                refreshToken = createRefreshToken(existingVendor._id.toString())
                existingVendor.refreshToken = refreshToken
                await existingVendor.save()
            }

            return {
                token,
                refreshToken,
                isNewVendor: false,
                vendor: vendorWithSignedUrl,
                message: 'Successfully logged in...'
            }

        } catch (error) {
            console.error('Error in login', error);

            if (error instanceof CustomError) {
                throw error;
            }

            throw new CustomError('Failed to login', HTTP_statusCode.InternalServerError);
        }
    }

    
    create_RefreshToken = async (refreshToken: string): Promise<string> => {
        try {
            const decodedToken = jwt.verify(
                refreshToken,
                process.env.JWT_REFRESH_SECRET_KEY!
            ) as { _id: string }

            const vendor = await this.vendorRepository.getById(decodedToken._id);

            if (!vendor || vendor.refreshToken !== refreshToken) {
                throw new CustomError('Invalid refresh token', HTTP_statusCode.Unauthorized)
            }

            const accessToken = createAccessToken(vendor._id.toString())
            return accessToken;

        } catch (error) {
            console.error('Error while creatin refreshToken', error);
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError('Failed to create refresh Token', HTTP_statusCode.InternalServerError);
        }
    }


       handleForgotPassword = async (email: string): Promise<void> => {
        try {
            const vendor = await this.vendorRepository.findByEmail(email)
            if (!vendor) {
                throw new CustomError('User not exists', HTTP_statusCode.NotFound);
            }
            const resetToken = crypto.randomBytes(20).toString('hex');
            const resetTokenExpiry = new Date(Date.now() + 30 * 60 * 1000);

            vendor.resetPasswordToken = resetToken;
            vendor.resetPasswordExpires = resetTokenExpiry;
            await vendor.save();


            const resetUrl = `${process.env.FRONTEND_URL}/vendor/forgot-password/${resetToken}`
            await sendEmail(
                email,
                'Password Reset Request',
                emailTemplates.forgotPassword(vendor.name, resetUrl)
            );

        } catch (error) {
            console.error('Error in handleForgotPassword:', error);
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError('Failed to process forgot password request', HTTP_statusCode.InternalServerError);
        }
    }


        newPasswordChange = async (token: string, password: string): Promise<void> => {
        try {
            const vendor = await this.vendorRepository.findByToken(token)

            if (!vendor) {
                throw new CustomError('Invalid token', HTTP_statusCode.BadRequest);
            }
            if (!vendor.resetPasswordExpires || new Date() > vendor.resetPasswordExpires) {
                throw new CustomError('Password reset token has expired', HTTP_statusCode.InternalServerError);
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            let updateSuccess = await this.vendorRepository.UpdatePassword(vendor._id, hashedPassword);

            if (!updateSuccess) {
                throw new CustomError('Failed to Update password', HTTP_statusCode.InternalServerError)
            } else {
            
                vendor.resetPasswordExpires = undefined;
                vendor.resetPasswordToken = undefined;
                await vendor.save();
                await sendEmail(
                    vendor.email,
                    'Password Reset Successful',
                    emailTemplates.ResetPasswordSuccess(vendor.name)
                );
            }

        } catch (error) {
            console.error('Error in newPasswordChange:', error);
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError('Failed to password', HTTP_statusCode.InternalServerError);
        }
    }


     validateToken = async (token: string): Promise<boolean> => {
        try {
            const vendor = await this.vendorRepository.findByToken(token)

            if (!vendor) {
                throw new CustomError('Invalid token', HTTP_statusCode.InternalServerError);
            }
            if (!vendor.resetPasswordExpires) {
                throw new CustomError('No reset token expiry date found', HTTP_statusCode.InternalServerError);
            }

            const currentTime = new Date().getTime()
            const tokenExpiry = new Date(vendor.resetPasswordExpires).getTime();

            if (currentTime > tokenExpiry) {
                vendor.resetPasswordToken = undefined
                vendor.resetPasswordExpires = undefined;
                await vendor.save()
                return false;
            }
            return true;

        } catch (error) {
            console.error('Error in validateResetToken:', error);
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError((error as Error).message || 'Failed to validate token', HTTP_statusCode.InternalServerError);
        }
    }


     passwordCheckVendor = async (currentPassword: string, newPassword: string, vendorId: any): Promise<void> => {
        try {
            const vendor = await this.vendorRepository.getById(vendorId.toString())
            if (!vendor) {
                throw new CustomError(Messages.USER_NOT_FOUND, HTTP_statusCode.NotFound)
            }
            if (!vendor.password) {
                throw new CustomError("User password not set", HTTP_statusCode.InternalServerError)
            }

            const passwordMatch = await bcrypt.compare(
                currentPassword,
                vendor.password || ''
            )
            if (!passwordMatch) {
                throw new CustomError('Incorrect Password', HTTP_statusCode.Unauthorized)
            }

            if (currentPassword === newPassword) {
                throw new CustomError("Current and New Passwords can't be same", HTTP_statusCode.Unauthorized)
            }

            const salt = await bcrypt.genSalt(10);
            const newHashedPassword = await bcrypt.hash(newPassword, salt);
            const updateSuccess = await this.vendorRepository.UpdatePassword(vendorId, newHashedPassword)
            if (!updateSuccess) {
                throw new CustomError('Failed to update password', HTTP_statusCode.InternalServerError);
            }
            await sendEmail(
                vendor.email,
                'Password Reset Successful',
                emailTemplates.ResetPasswordSuccess(vendor.name)
            );


        } catch (error) {
            console.error("Error in updating password:", error)
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError("Failed to changing password.", HTTP_statusCode.InternalServerError);
        }
    }



    getVendors = async (page:number,limit:number,search:string,status?:string):Promise<FindAllVendorsResult> => {
        try {
            const result = await this.vendorRepository.findAllVendors(page,limit,search,status)
            const updateVendors = await Promise.all(
                result.vendors.map(async(vendor) => {
                    if(!vendor){
                        return undefined
                    }

                    try {
                        if(vendor.imageUrl === ''){
                            return {...vendor}
                        }

                        if(vendor.imageUrl) {
                            const signedUrl = await s3Service.getFile(
                                'bookmystills-karthik-gopakumar/vendor/photo/',
                                vendor.imageUrl
                            )

                            return {
                                ...vendor,
                                imageUrl:signedUrl
                            }
                        }

                    } catch (error) {
                        console.error(`Error getting Signed URL for ${vendor.imageUrl}: `,error)
                        return vendor
                    }
                })
            )

            return {
                ...result,
                vendors:updateVendors
            }
        } catch (error) {
            console.error("Error in finding users",error)
            if(error instanceof CustomError){
                throw error
            }
            throw new CustomError("Failed to get Users",HTTP_statusCode.InternalServerError);

        }
    }


    verifyVendor = async(vendorId:string,status:AcceptanceStatus):Promise<{success:boolean,message:string}> => {
        try {
            const vendor = await this.vendorRepository.getById(vendorId);
            if(!vendor){
                return {success : false,message:"Vendor not exist"}
            }

            vendor.isAccepted = status;
            vendor.isActive = status === AcceptanceStatus.Accepted;

            await vendor.save();

            const emailSubject = status === AcceptanceStatus.Accepted
            ? 'Your vendor account has been accepted'
                : 'Your vendor account has been rejected';

                const emailBody = status === AcceptanceStatus.Accepted
                ?emailTemplates.vendorAccepted(vendor.name)
                :emailTemplates.vendorRejected(vendor.name)

                await sendEmail(vendor.email,emailSubject,emailBody)
                return {
                    success:true ,
                    message:status === AcceptanceStatus.Accepted
                       ? 'Vendor has been accepted and notified via email'
                    : 'Vendor has been rejected and notified via email'
                }

        }  catch (error){
            console.error("Error in verifying vendor",error)
            if(error instanceof CustomError){
                throw error
            }
            throw new CustomError("Failed to verify vendor ",HTTP_statusCode.InternalServerError)
        }
    }


   getVendorProfileService = async (vendorId: string): Promise<VendorDocument> => {
        try {
            const vendor = await this.vendorRepository.getById(vendorId.toString());

            if (!vendor) {
                throw new CustomError('Vendor not found', HTTP_statusCode.InternalServerError)
            }

            if (vendor?.imageUrl) {
                try {
                    const imageUrl = await s3Service.getFile('bookmystills-karthik-gopakumar/vendor/photo/', vendor?.imageUrl);
                    return {
                        ...vendor.toObject(),
                        imageUrl: imageUrl
                    };
                } catch (error) {
                    console.error('Error generating signed URL:', error);
                    return vendor;
                }
            }
            return vendor

        } catch (error) {
            console.error('Error in getVendorProfileService:', error);
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError((error as Error).message || 'Failed to get profile details', HTTP_statusCode.InternalServerError);
        }
    }


     updateProfileService = async (
        name: string,
        contactinfo: string,
        companyName: string,
        city: string,
        about: string,
        files: Express.Multer.File | null,
        vendorId: any
    ): Promise<VendorDocument | null> => {
        try {

            const vendor = await this.vendorRepository.getById(vendorId.toString())
            if (!vendor) {
                throw new CustomError(Messages.USER_NOT_FOUND, HTTP_statusCode.NotFound)
            }

            const updateData: {
                name?: string;
                contactinfo?: string;
                imageUrl?: string;
                companyName?: string;
                city?: string;
                about?: string;
            } = {};
            if (name && name !== vendor.name) {
                updateData.name = name;
            }
            if (contactinfo && contactinfo !== vendor.contactinfo) {
                updateData.contactinfo = contactinfo;
            }
            if (companyName && companyName !== vendor.companyName) {
                updateData.companyName = companyName;
            }
            if (city && city !== vendor.city) {
                updateData.city = city;
            }
            if (about && about !== vendor.about) {
                updateData.about = about;
            }
            if (files) {
                try {
                    const imageFileName = await s3Service.uploadToS3(
                        'bookmystills-karthik-gopakumar/photo/',
                        files
                    );
                    updateData.imageUrl = imageFileName;
                } catch (error) {
                    console.error('Error uploading to S3:', error);
                    throw new CustomError('Failed to upload image to S3', HTTP_statusCode.InternalServerError);
                }
            }

            if (Object.keys(updateData).length === 0) {
                throw new CustomError('No changes to update', HTTP_statusCode.InternalServerError);
            }

            const updatedVendor = await this.vendorRepository.update(vendorId, updateData)
            if (!updatedVendor) {
                throw new CustomError('Failed to update user', HTTP_statusCode.InternalServerError);
            }
            await updatedVendor.save();

            const freshVendor = await this.vendorRepository.getById(vendorId.toString());
            if (freshVendor?.imageUrl) {
                try {
                    const imageUrl = await s3Service.getFile('bookmystills-karthik-gopakumar/photo/', freshVendor.imageUrl);

                    return {
                        ...freshVendor.toObject(),
                        imageUrl: imageUrl
                    };
                } catch (error) {
                    console.error('Error generating signed URL:', error);
                    return freshVendor;
                }
            }
            return freshVendor;

        } catch (error) {
            console.error("Error in updateProfileService:", error)
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError("Failed to update profile.", HTTP_statusCode.InternalServerError);
        }
    }





    

    


   


   






  
    





  


}
  function toTitleCase(city: string): string {
    return city.toLowerCase().split(' ').map(word => {
        return word.charAt(0).toUpperCase() + word.slice(1)
    }).join(' ')
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

export default VendorService