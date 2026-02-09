import jwt from 'jsonwebtoken';
import { CustomError } from '../error/customError';
import { AdminLoginResponse } from '../interfaces/commonInterfaces';
import { IAdminService } from '../interfaces/serviceInterfaces/admin.Service.interface';
import { IAdminRepository } from '../interfaces/repositoryInterfaces/admin.Repository.interface';
import { createAccessToken, isTokenExpiringSoon } from '../config/jwt.config';
import HTTP_statusCode from '../enums/httpStatusCode';
import { AuthRole } from '../enums/commonEnums';

class AdminService implements IAdminService {
  private adminRepository: IAdminRepository;

  constructor(adminRepository: IAdminRepository) {
    this.adminRepository = adminRepository;
  }

  login = async (email: string, password: string): Promise<AdminLoginResponse> => {
    try {
      const existingAdmin = await this.adminRepository.findByEmail(email);

      if (!existingAdmin) {
        throw new CustomError('Admin not exist!..', HTTP_statusCode.NotFound);
      }
      if (password !== existingAdmin.password) {
        throw new CustomError('Incorrect Password', HTTP_statusCode.Unauthorized);
      }

      const token = createAccessToken(existingAdmin._id.toString(),AuthRole.ADMIN);
      jwt.sign({ _id: existingAdmin._id ,role:AuthRole.ADMIN}, process.env.JWT_SECRET_KEY!, { expiresIn: '2h' });

      let { refreshToken } = existingAdmin;
      if (!refreshToken || isTokenExpiringSoon(refreshToken)) {
        refreshToken = jwt.sign({ _id: existingAdmin._id }, process.env.JWT_REFRESH_SECRET_KEY!, {
          expiresIn: '7d',
        });
        existingAdmin.refreshToken = refreshToken;
        await existingAdmin.save();
      }

      return {
        token,
        refreshToken,
        adminData: existingAdmin,
        message: 'Succesfully logged in',
      };
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to login', HTTP_statusCode.InternalServerError);
    }
  };

  createRefreshToken = async (jwtTokenAdmin: string): Promise<string> => {
    try {
      const decodedToken = jwt.verify(jwtTokenAdmin, process.env.JWT_REFRESH_SECRET_KEY!) as {
        _id: string;
      };

      const admin = await this.adminRepository.getById(decodedToken._id);

      if (!admin || admin.refreshToken !== jwtTokenAdmin) {
        throw new CustomError('Invalid refresh Token', HTTP_statusCode.Unauthorized);
      }

      const accessToken = createAccessToken(admin._id.toString(),AuthRole.ADMIN);

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

export default AdminService;
