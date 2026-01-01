import { Request,Response } from "express";
import dotenv from 'dotenv'
import { handleError } from "../util/handleError";
import { AuthRequest } from "../types/adminTypes";
import { IAdminService } from "../interfaces/serviceInterfaces/admin.Service.interface";
import { CustomError } from "../error/customError";
import { IUserService } from "../interfaces/serviceInterfaces/user.Service.interface";
import { IVendorService } from "../interfaces/serviceInterfaces/vendor.service.interface";
import { BlockStatus } from "../enums/commonEnums";
import jwt from 'jsonwebtoken'
import HTTP_statusCode from "../enums/httpStatusCode";
import Messages from "../enums/errorMessages";

dotenv.config()

class AdminController {
     private adminService: IAdminService;
    private userService: IUserService;
    private vendorService: IVendorService;

    constructor(
        adminService: IAdminService,
        userService: IUserService,
        vendorService: IVendorService,
    )
    {
         this.adminService = adminService;
        this.userService = userService;
        this.vendorService = vendorService;
    }

     adminLogin = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                res.status(HTTP_statusCode.BadRequest).json({ message: 'Email and Password are required!' });
                return
            }

            const { token, refreshToken, adminData, message } = await this.adminService.login(email, password);

            res.cookie('jwtTokenAdmin', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000
            });
            res.status(HTTP_statusCode.OK).json({ refreshToken, token, adminData, message });
        } catch (error) {
            handleError(res, error, 'AdminLogin');
        }
    }

    adminLogout = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            res.clearCookie('jwtTokenAdmin', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict'
            })
            res.status(HTTP_statusCode.OK).json({ message: 'Admin logout Successfully...' })
        } catch (error) {
            handleError(res, error, 'AdminLogout');
        }
    }
     createRefreshToken = async (req: Request, res: Response): Promise<void> => {
        try {

            const jwtTokenAdmin = req.cookies.jwtTokenAdmin;

            if (!jwtTokenAdmin) {
                throw new CustomError(Messages.NO_REFRESHTOKEN, HTTP_statusCode.Unauthorized);
            }

            try {
                const newAccessToken = await this.adminService.createRefreshToken(jwtTokenAdmin);
                res.status(HTTP_statusCode.OK).json({ token: newAccessToken });
            } catch (error) {
                if (error instanceof jwt.TokenExpiredError) {
                    res.clearCookie('jwtTokenAdmin');
                    throw new CustomError(Messages.REFRESHTOKEN_EXP, HTTP_statusCode.Unauthorized);
                }
                throw error;
            }

        } catch (error) {
            handleError(res, error, 'CreateRefreshToken')
        }
    }


   
}

export default AdminController