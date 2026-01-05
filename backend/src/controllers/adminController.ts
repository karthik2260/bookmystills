import { Request,Response } from "express";
import dotenv from 'dotenv'
import { handleError } from "../util/handleError";
import { AuthRequest } from "../types/adminTypes";
import { IAdminService } from "../interfaces/serviceInterfaces/admin.Service.interface";
import { CustomError } from "../error/customError";
import { IUserService } from "../interfaces/serviceInterfaces/user.Service.interface";
import { IVendorService } from "../interfaces/serviceInterfaces/vendor.service.interface";
import { AcceptanceStatus, BlockStatus } from "../enums/commonEnums";
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



    getAllVendors = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const adminId = req.admin?._id
            if (!adminId) {
                res.status(HTTP_statusCode.BadRequest).json({ message: Messages.ADMIN_ID_MISSING});
                return;
            }

            const page = parseInt(req.query.page as string) || 1
            const limit = parseInt(req.query.limit as string) || 6
            const search = req.query.search as string || '';
            const status = req.query.status as string;
            const result = await this.vendorService.getVendors(page, limit, search, status)

            res.status(HTTP_statusCode.OK).json({
                vendors: result.vendors,
                totalPages: result.totalPages,
                currentPage: page,
                totalVendors: result.total
            })

        } catch (error) {
            handleError(res, error, 'getAllVendors')
        }
    }

VerifyVendor = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("🔥 verifyVendor controller HIT");
    console.log("📦 req.params:", req.params);
    console.log("📦 req.body:", req.body);

    const { vendorId } = req.params;
    const { status } = req.body as { status: AcceptanceStatus };

    if (!vendorId) {
      console.log("❌ vendorId missing");
      res.status(400).json({ message: "Invalid vendorId" });
      return;
    }

    const result = await this.vendorService.verifyVendor(vendorId, status);
    console.log("✅ service result:", result);

    if (result.success) {
      res.status(200).json({ message: result.message });
    } else {
      res.status(400).json({ message: result.message });
    }
  } catch (error) {
    console.error("💥 verifyVendor ERROR:", error);
    handleError(res, error, "verifyVendor");
  }
};




   

   
}

export default AdminController