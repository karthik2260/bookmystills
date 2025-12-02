import { Request,Response } from "express";
import { handleError } from "../util/handleError";
import { CustomError } from "../error/customError";
import { VendorRequest } from "../types/vendorTypes";
import {OTP, VendorSession } from "../interfaces/commonInterfaces";
import HTTP_statusCode from "../enums/httpStatusCode";
import Messages from "../enums/errorMessages";
import { IVendorService } from "../interfaces/serviceInterfaces/vendor.service.interface";
import jwt from 'jsonwebtoken'

declare module 'express-session' {
    interface Session {
        vendor: VendorSession,
        otp: OTP | undefined
    }
}



class VendorController {
    private vendorService : IVendorService

    constructor (vendorService : IVendorService){
        this.vendorService = vendorService
    }



     VendorSignUp = async (req: Request, res: Response): Promise<void> => {
        try {
            const { email, name, password, city, contactinfo, companyName, about } = req.body;

            const vendorData = await this.vendorService.registerVendor({
                email,
                name,
                password,
                city,
                contactinfo,
                companyName,
                about,
            });

            req.session.vendor = vendorData
            req.session.save((err) => {
                if (err) {
                    console.error('Session save error:', err);
                    throw new CustomError(Messages.SAVE_SESSION, HTTP_statusCode.InternalServerError);
                }
                res.status(HTTP_statusCode.OK).json({
                    message: Messages.OTP_SENT,
                    email: email,
                    otpExpiry: vendorData.otpExpiry,
                    resendAvailableAt: vendorData.resendTimer
                });
            })


        } catch (error) {
            handleError(res, error, 'VendorSignUp')
        }
    }

  verifyOTP = async(req: Request, res: Response): Promise<void> =>{
        try {
            const otp = req.body.otp
            const { name, email, city, password, contactinfo, otpCode, companyName, about, otpExpiry } = req.session.vendor

            if (otp !== otpCode) {
                throw new CustomError(Messages.INVALID_OTP, HTTP_statusCode.BadRequest)
            }
            const currentTime = Date.now();
            if (currentTime > otpExpiry) {
                throw new CustomError(Messages.OTP_EXPIRED, HTTP_statusCode.BadRequest);
            }

            if (otp === otpCode) {
                const { vendor } = await this.vendorService.signup(
                    email,
                    password,
                    name,
                    contactinfo,
                    city,
                    companyName,
                    about
                )
                res.status(201).json({ vendor, message: Messages.ACCOUNT_CREATED })
            }
        } catch (error) {
            handleError(res, error, 'VerifyOTP')
        }
    }

    
    VendorLogin = async (req: Request, res: Response): Promise<void> => {
        try {
            const { email, password } = req.body;

            const { token, refreshToken, vendor, message } = await this.vendorService.login(email, password);

            res.cookie('jwtToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000
            })
            res.status(HTTP_statusCode.OK).json({ token, vendor, message })
        } catch (error) {
            handleError(res, error, 'VendorLogin')
        }
    }

     VendorLogout = async (req: Request, res: Response): Promise<void> => {
        try {
            res.clearCookie('jwtToken', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict'
            })
            res.status(HTTP_statusCode.OK).json({ message: 'Vendor Logged out Succesfully' })
        } catch (error) {
            handleError(res, error, 'VendorLogout')
        }
    }

     CreateRefreshToken = async (req: Request, res: Response): Promise<void> => {
        try {
            const refreshToken = req.cookies.jwtToken;

            if (!refreshToken) {
                throw new CustomError(Messages.NO_REFRESHTOKEN, 401);
            }
            try {

                const newAccessToken = await this.vendorService.create_RefreshToken(refreshToken);

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

            await this.vendorService.handleForgotPassword(email)
            res.status(HTTP_statusCode.OK).json({ message: Messages.PASSWORD_RESET_LINK });

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

            await this.vendorService.newPasswordChange(token, password)

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
            const isValid = await this.vendorService.validateToken(token);
            res.status(HTTP_statusCode.OK).json({ isValid });
        } catch (error) {
            res.status(HTTP_statusCode.BadRequest).json({ message: (error as Error).message });
        }
    }


    
    changePassword = async (req: VendorRequest, res: Response): Promise<void> => {
        try {
            const { currentPassword, newPassword } = req.body

            const vendorId = req.vendor?._id;
            if (!vendorId) {
                res.status(401).json({ success: false, message: Messages.VENDOR_ID_MISSING });
                return;
            }
            await this.vendorService.passwordCheckVendor(currentPassword, newPassword, vendorId)

            res.status(HTTP_statusCode.OK).json({ message: Messages.PASSWORD_RESET_SUCCESS });
        } catch (error) {
            handleError(res, error, 'changePassword')
        }
    }
   



}

export default VendorController