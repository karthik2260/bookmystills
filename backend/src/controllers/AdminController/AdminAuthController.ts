import { Request, Response } from 'express';
import dotenv from 'dotenv';
import { handleError } from '../../util/handleError';
import { IAdminService } from '../../interfaces/serviceInterfaces/admin.Service.interface';
import jwt from 'jsonwebtoken';
import { CustomError } from '../../error/customError';
import HTTP_statusCode from '../../enums/httpStatusCode';
import Messages from '../../enums/errorMessages';
import { AdminLoginRequestDTO } from '../../dto/adminDTO';
import { AuthRequest } from '../../types/authRequest';
dotenv.config();

class AdminAuthController {
  private adminService: IAdminService;

  constructor(adminService: IAdminService) {
    this.adminService = adminService;
  }
 adminLogin = async (req: Request<{},{},AdminLoginRequestDTO>, res: Response): Promise<void> => {
    try {
const adminloginreq : AdminLoginRequestDTO = req.body;
      const { email, password } = adminloginreq
      if (!email || !password) {
        res
          .status(HTTP_statusCode.BadRequest)
          .json({ message: 'Email and Password are required!' });
        return;
      }

      const { token, refreshToken, adminData, message } = await this.adminService.login(
        email,
        password,
      );

      res.cookie('jwtTokenAdmin', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      res.status(HTTP_statusCode.OK).json({ refreshToken, token, adminData, message });
    } catch (error) {
      handleError(res, error, 'AdminLogin');
    }

    
  };

  adminLogout = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      res.clearCookie('jwtTokenAdmin', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });
      res.status(HTTP_statusCode.OK).json({ message: 'Admin logout Successfully...' });
    } catch (error) {
      handleError(res, error, 'AdminLogout');
    }
  };

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
      handleError(res, error, 'CreateRefreshToken');
    }
  };
}

export default AdminAuthController;