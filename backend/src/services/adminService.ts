import jwt from 'jsonwebtoken';
import { CustomError } from '../error/customError';
import { IAdminService } from '../interfaces/serviceInterfaces/admin.Service.interface';
import { IAdminRepository } from '../interfaces/repositoryInterfaces/admin.Repository.interface';
import { createAccessToken, isTokenExpiringSoon } from '../config/jwt.config';
import HTTP_statusCode from '../enums/httpStatusCode';
import { AuthRole } from '../enums/commonEnums';
import { AdminMapper } from '../mapper/admin/admin.mapper';
import { AdminLoginResponseDTO } from '../dto/admin/auth/response/admin.response.dto';
import { ENV } from '../config/env';
import logger from '../config/logger';

class AdminService implements IAdminService {
  private adminRepository: IAdminRepository;

  constructor(adminRepository: IAdminRepository) {
    this.adminRepository = adminRepository;
  }

  login = async (email: string, password: string): Promise<AdminLoginResponseDTO> => {
    try {
      const existingAdmin = await this.adminRepository.findByEmail(email);

      if (!existingAdmin) {
        throw new CustomError('Admin not exist!..', HTTP_statusCode.NotFound);
      }

      if (password !== existingAdmin.password) {
        throw new CustomError('Incorrect Password', HTTP_statusCode.Unauthorized);
      }

      const token = createAccessToken(existingAdmin._id.toString(), AuthRole.ADMIN);

      let { refreshToken } = existingAdmin;

      if (!refreshToken || isTokenExpiringSoon(refreshToken)) {
        refreshToken = jwt.sign({ _id: existingAdmin._id }, ENV.JWT_REFRESH_SECRET_KEY!, {
          expiresIn: '7d',
        });

        existingAdmin.refreshToken = refreshToken;
        await existingAdmin.save();
      }

      const adminDTO = AdminMapper.toLoginDTO(existingAdmin);

      return {
        token,
        refreshToken,
        admin: adminDTO,
        message: 'Successfully logged in',
      };
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new CustomError('Failed to login', HTTP_statusCode.InternalServerError);
    }
  };
  createRefreshToken = async (jwtTokenAdmin: string): Promise<string> => {
    try {
      const decodedToken = jwt.verify(jwtTokenAdmin, ENV.JWT_REFRESH_SECRET_KEY!) as {
        _id: string;
      };

      const admin = await this.adminRepository.getById(decodedToken._id);

      if (!admin || admin.refreshToken !== jwtTokenAdmin) {
        throw new CustomError('Invalid refresh Token', HTTP_statusCode.Unauthorized);
      }

      const accessToken = createAccessToken(admin._id.toString(), AuthRole.ADMIN);

      return accessToken;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new CustomError('Refresh token expired. Please login again.', 401);
      }

      if (error instanceof jwt.JsonWebTokenError) {
        throw new CustomError('Invalid refresh token.', 401);
      }

      if (error instanceof CustomError) {
        throw error;
      }

      throw new CustomError('Failed to create refresh token', 500);
    }
  };

  getDashboardStats = async (): Promise<{
    totalVendors: { count: number };
    totalUsers: { count: number };
  }> => {
    try {
      const stats = await this.adminRepository.getDashboardStats();

      return {
        totalVendors: {
          count: stats.totalVendors,
        },
        totalUsers: {
          count: stats.totalUsers,
        },
      };
    } catch (error) {
      logger.error('Error fetching dashboard stats:', error);
      throw new Error('Unable to fetch dashboard statistics');
    }
  };
}

export default AdminService;
