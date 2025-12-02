import { Request,Response } from "express";
import { OTP_EXPIRY_TIME, RESEND_COOLDOWN } from "../enums/commonEnums";
import Messages from "../enums/errorMessages";
import HTTP_statusCode from "../enums/httpStatusCode";
import { CustomError } from "../error/customError";
import { IUserSession, } from "../interfaces/commonInterfaces";
import { IUserService } from "../interfaces/serviceInterfaces/user.Service.interface";
import generateOTP from "../util/generateOtp";
import { handleError } from "../util/handleError";
import jwt from 'jsonwebtoken'
import { AuthenticatedRequest } from "../types/userType";
import { IVendorService } from "../interfaces/serviceInterfaces/vendor.service.interface";

declare module 'express-session' {
    interface Session {
        user?: IUserSession;
    }
}





class UserController {
    private userService : IUserService;
     private vendorService: IVendorService;


    constructor (userService : IUserService,vendorService: IVendorService){
        this.userService = userService;
        this.vendorService = vendorService
    }

    UserSignup = async (req:Request,res:Response):Promise<void> => {
        try {
            const {email,password,name,contactinfo} = req.body ;
            const otpCode = await generateOTP(email);

            if(otpCode !== undefined){
                const otpSetTimestamp = Date.now();
                const userData :IUserSession = {
                    email:email,
                    password:password,
                    name:name,
                    contactinfo:contactinfo,
                    otpCode:otpCode,
                    otpSetTimestamp,
                    
                    otpExpiry:otpSetTimestamp + OTP_EXPIRY_TIME,
                    resendTimer:otpSetTimestamp + RESEND_COOLDOWN
                }

                req.session.user = userData;
                req.session.save((err) => {
                    if(err){
                        console.error('session save error', err);
                        throw new CustomError(Messages.SAVE_SESSION,HTTP_statusCode.InternalServerError)
                    }
                    res.status(HTTP_statusCode.OK).json({
                        message:Messages.OTP_SENT,
                        email:email,
                        otpExpiry:userData.otpExpiry,
                        resendAvailableAt : userData.resendTimer
                    })
                })

            } else {
                throw new CustomError(Messages.GENERATE_OTP,HTTP_statusCode.InternalServerError)
            }
        } catch (error){
            handleError(res,error,'UserSignup')
        }
    }

    
    Login = async (req: Request, res: Response) => {

        try {
            const { email, password } = req.body;
            const serviceResponse = await this.userService.login(email, password);

            res.cookie('refreshToken', serviceResponse.refreshToken, {
                httpOnly: true, secure: process.env.NODE_ENV === 'production',
                maxAge: 7 * 24 * 60 * 60 * 1000
            })

            res.status(HTTP_statusCode.OK).json({
                token: serviceResponse.token,
                user: serviceResponse.user,
                message: serviceResponse.message
            })

        } catch (error) {

            handleError(res, error, 'Login')
        }
    }


     UserLogout = async (req: Request, res: Response): Promise<void> => {
        try {
            res.clearCookie('refreshToken', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict'
            })
            res.status(HTTP_statusCode.OK).json({ message: 'User logout Successfully...' })
        } catch (error) {
            handleError(res, error, 'UserLogout')
        }
    }


     VerifyOTP = async (req: Request, res: Response): Promise<void> => {
        try {
            const { otp } = req.body;
            const userData = req.session.user;

            if (!userData) {
                throw new CustomError(Messages.SESSION_EXPIRED, HTTP_statusCode.BadRequest);
            }
            const currentTime = Date.now();

            if (currentTime > userData.otpExpiry) {
                throw new CustomError(Messages.OTP_EXPIRED, HTTP_statusCode.BadRequest);
            }

            if (otp === userData.otpCode) {
                const user = await this.userService.signup(
                    userData.email,
                    userData.password,
                    userData.name,
                    userData.contactinfo,
                );

                delete req.session.user
                req.session.save((err) => {
                    if (err) console.error('Error saving session after clearing user data:', err);
                });


                res.status(201).json({ user, message: Messages.ACCOUNT_CREATED });
            } else {
                throw new CustomError(Messages.INVALID_OTP, HTTP_statusCode.BadRequest)
            }
        } catch (error) {
            handleError(res, error, 'VerifyOTP')
        }
    }


 ResendOtp = async (req: Request, res: Response): Promise<void> => {
        try {
            const userData: IUserSession | undefined = req.session.user;            
            if (!userData) {
                throw new CustomError(Messages.SESSION_EXPIRED, HTTP_statusCode.BadRequest);
            }
            const currentTime = Date.now();
            if (currentTime < userData.resendTimer) {
                const waitTime = Math.ceil((userData.resendTimer - currentTime) / 1000);
                throw new CustomError(`Please wait ${waitTime} seconds before requesting new OTP`, 429);
            }
            const newOtp: string = await this.userService.resendNewOtp(userData.email)

            req.session.user = {
                ...userData,
                otpCode: newOtp,
                otpSetTimestamp: currentTime,
                otpExpiry: currentTime + OTP_EXPIRY_TIME,
                resendTimer: currentTime + RESEND_COOLDOWN
            };

            res.status(HTTP_statusCode.OK).json({
                message: 'New OTP sent to email',
                otpExpiry: currentTime + OTP_EXPIRY_TIME,
                resendAvailableAt: currentTime + RESEND_COOLDOWN
            });

        } catch (error) {
            handleError(res, error, 'ResendOtp')

        }
    }

     create_RefreshToken = async (req: Request, res: Response): Promise<void> => {
        try {

            const refreshToken = req.cookies.refreshToken;
            if (!refreshToken) {
                throw new CustomError(Messages.NO_REFRESHTOKEN, 401);
            }

            try {
                const newAccessToken = await this.userService.create_RefreshToken(refreshToken);
                res.status(HTTP_statusCode.OK).json({ token: newAccessToken });
            } catch (error) {
                if (error instanceof jwt.TokenExpiredError) {
                    res.clearCookie('refreshToken');
                    throw new CustomError(Messages.REFRESHTOKEN_EXP, 401);
                }
                throw error;
            }

        } catch (error) {
            handleError(res, error, 'CreateRefreshToken')
        }
    }

     forgotPassword = async (req: Request, res: Response): Promise<void> => {
        try {
            const { email } = req.body

            if (!email) {
                throw new CustomError(Messages.EMAIL_REQUIRED, HTTP_statusCode.BadRequest);
            }
            await this.userService.handleForgotPassword(email)
            res.status(HTTP_statusCode.OK).json({ message: Messages.PASSWORD_RESET_LINK});

        } catch (error) {
            handleError(res, error, 'forgotPassword')
        }
    }

    changeForgotPassword = async (req: Request, res: Response): Promise<void> => {
        const { token } = req.params;
        const { password } = req.body;

        try {
            if (!token) {
                throw new CustomError(Messages.SESSION_EXPIRED, HTTP_statusCode.BadRequest)
            } else if (!password) {
                throw new CustomError(Messages.PASSWORD_REQUIRED, HTTP_statusCode.BadRequest)
            }

            await this.userService.newPasswordChange(token, password)
            res.status(HTTP_statusCode.OK).json({ message: Messages.PASSWORD_RESET_SUCCESS})

        } catch (error) {
            handleError(res, error, 'changePassword')
        }
    }

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
    }

    changePassword = async(req: AuthenticatedRequest, res: Response): Promise<void> =>{
        try {
            const { currentPassword, newPassword } = req.body

            const userId = req.user?._id;
            if (!userId) {
                res.status(HTTP_statusCode.BadRequest).json({ message: Messages.USER_ID_MISSING });
                return;
            }
            await this.userService.passwordCheckUser(currentPassword, newPassword, userId)

            res.status(HTTP_statusCode.OK).json({ message: "Password reset successfully." });
        } catch (error) {
            handleError(res, error, 'changePassword')
        }
    }





}

export default UserController
