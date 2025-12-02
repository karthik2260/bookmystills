import { User } from "../interfaces/commonInterfaces";
import { IUserRepository } from "../interfaces/repositoryInterfaces/user.repository.interface";
import { IUserService } from "../interfaces/serviceInterfaces/user.Service.interface";
import { CustomError } from "../error/customError";
import HTTP_statusCode from "../enums/httpStatusCode";
import bcrypt from 'bcrypt'
import generateOTP from "../util/generateOtp";
import { createAccessToken,createRefreshToken,isTokenExpiringSoon } from "../config/jwt.config";
import { ILoginResponse } from "../interfaces/commonInterfaces";
import jwt from 'jsonwebtoken'
import { sendEmail } from "../util/sendEmail";
import crypto from 'crypto'
import { emailTemplates } from "../util/emailTemplates";
import mongoose from "mongoose";
import Messages from "../enums/errorMessages";
class UserService implements IUserService {
    private userRepository : IUserRepository;

    constructor (userRepository : IUserRepository){
        this.userRepository = userRepository
    }


    signup = async (
        email: string,
        password: string,
        name: string,
        contactinfo: string,
    ): Promise<User> => {
        try {
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

            })
            return newUser
        } catch (error) {
            console.error('Error in signup', error);
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError('Failed to sign up new User', HTTP_statusCode.InternalServerError)
        }
    }


    resendNewOtp = async (email: string): Promise<string> => {
        try {
            const newOtp = await generateOTP(email);
            return newOtp as string

        } catch (error) {
            console.error('Error in resendNewOtp:', error);
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError((error as Error).message || 'Failed to resend new Otp', HTTP_statusCode.InternalServerError);
        }
    }

     login = async (email: string, password: string): Promise<ILoginResponse> => {
        try {

            const existingUser = await this.userRepository.findByEmail(email);

            if (!existingUser) {
                throw new CustomError('User Not Exist!!..', HTTP_statusCode.Unauthorized)
            }

            const passwordMatch = await bcrypt.compare(
                password,
                existingUser.password || ''
            )

            if (!passwordMatch) {
                throw new CustomError('Incorrect Password', HTTP_statusCode.Unauthorized)
            }
            if (existingUser.isActive === false) {
                throw new CustomError('Blocked by Admin', HTTP_statusCode.NoAccess)
            }

            let userWithSignedUrl = existingUser.toObject();

            

            const token = createAccessToken(existingUser._id.toString());

            let { refreshToken } = existingUser;
            if (!refreshToken || isTokenExpiringSoon(refreshToken)) {
                refreshToken = createRefreshToken(existingUser._id.toString())
                existingUser.refreshToken = refreshToken;
                await existingUser.save()
            }


            return {
                token,
                refreshToken,
                isNewUser: false,
                user: userWithSignedUrl,
                message: 'Succesfully Logged in'
            }

        } catch (error) {
            console.error('Error in Login', error);
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError('Failed to login', HTTP_statusCode.InternalServerError)
        }
    };

    create_RefreshToken = async (refreshToken: string): Promise<string> => {
        try {
            const decodedToken = jwt.verify(
                refreshToken,
                process.env.JWT_REFRESH_SECRET_KEY!
            ) as { _id: string }

            const user = await this.userRepository.getById(decodedToken._id);

            if (!user || user.refreshToken !== refreshToken) {
                throw new CustomError('Invalid refresh Token', HTTP_statusCode.Unauthorized)
            }

            const accessToken = createAccessToken(user._id.toString())
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
            const user = await this.userRepository.findByEmail(email)
            if (!user) {
                throw new CustomError('User not exists', HTTP_statusCode.NotFound);
            }
            const resetToken = crypto.randomBytes(20).toString('hex');
            const resetTokenExpiry = new Date(Date.now() + 30 * 60 * 1000);

            user.resetPasswordToken = resetToken;
            user.resetPasswordExpires = resetTokenExpiry;
            await user.save();


            const resetUrl = `${process.env.FRONTEND_URL}/forgot-password/${resetToken}`

            await sendEmail(
                email,
                'Password Reset Request',
                emailTemplates.forgotPassword(user.name, resetUrl)
            );
            this.scheduleTokenCleanup(user._id, resetTokenExpiry)
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
            throw new CustomError('Password reset token has expired', HTTP_statusCode.BadRequest); // Change to 400
        }

        console.log('✅ Token is valid, hashing password...');
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        console.log('💾 Updating password in database...');
        
        let updateSuccess = await this.userRepository.UpdatePasswordAndClearToken(user._id, hashedPassword);

        if (!updateSuccess) {
            console.log('❌ Failed to update password');
            throw new CustomError('Failed to Update password', HTTP_statusCode.InternalServerError)
        }

        console.log('✅ Password updated successfully');
        console.log('📧 Sending confirmation email...');

        await sendEmail(
            user.email,
            'Password Reset Successful',
            emailTemplates.ResetPasswordSuccess(user.name)
        );
        
        console.log('✅ Password reset complete!');

    } catch (error) {
        console.error('❌ Error in newPasswordChange:', error);
        if (error instanceof CustomError) {
            throw error;
        }
        throw new CustomError('Failed to reset password', HTTP_statusCode.InternalServerError);
    }
}

 validateToken = async (token: string): Promise<boolean> => {
        try {
            const user = await this.userRepository.findByToken(token)

            if (!user) {
                throw new CustomError('Invalid token', HTTP_statusCode.InternalServerError);
            }
            if (!user.resetPasswordExpires) {
                throw new CustomError('No reset token expiry date found', HTTP_statusCode.InternalServerError);
            }

            const currentTime = new Date().getTime()
            const tokenExpiry = new Date(user.resetPasswordExpires).getTime();

            if (currentTime > tokenExpiry) {
                await this.userRepository.clearResetToken(user._id)
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


    passwordCheckUser = async (currentPassword: string, newPassword: string, userId: any): Promise<void> => {
        try {
            const user = await this.userRepository.getById(userId.toString())
            if (!user) {
                throw new CustomError(Messages.USER_NOT_FOUND, HTTP_statusCode.NotFound)
            }
            if (!user.password) {
                throw new CustomError("User password not set", HTTP_statusCode.InternalServerError)
            }

            const passwordMatch = await bcrypt.compare(
                currentPassword,
                user.password || ''
            )
            if (!passwordMatch) {
                throw new CustomError('Incorrect Password', HTTP_statusCode.Unauthorized)
            }

            if (currentPassword === newPassword) {
                throw new CustomError("Current and New Passwords can't be same", HTTP_statusCode.Unauthorized)
            }

            const salt = await bcrypt.genSalt(10);
            const newHashedPassword = await bcrypt.hash(newPassword, salt);
            const updateSuccess = await this.userRepository.UpdatePassword(userId, newHashedPassword)
            if (!updateSuccess) {
                throw new CustomError('Failed to update password', HTTP_statusCode.InternalServerError);
            }
            await sendEmail(
                user.email,
                'Password Reset Successful',
                emailTemplates.ResetPasswordSuccess(user.name)
            );

        } catch (error) {
            console.error("Error in updating password:", error)
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError("Failed to changing password.", HTTP_statusCode.InternalServerError);
        }
    }













      private async scheduleTokenCleanup(userId: mongoose.Types.ObjectId, expiryTime: Date): Promise<void> {
        const timeUntilExpiry = new Date(expiryTime).getTime() - Date.now();
        setTimeout(async () => {
            try {
                await this.userRepository.clearResetToken(userId)
            } catch (error) {
                console.error('Error cleaning up expired token:', error);
            }
        }, timeUntilExpiry)
    }





    

}

export default UserService