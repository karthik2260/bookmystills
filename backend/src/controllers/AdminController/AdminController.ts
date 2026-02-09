import { Request, Response } from 'express';
import dotenv from 'dotenv';
import { handleError } from '../../util/handleError';
import { IAdminService } from '../../interfaces/serviceInterfaces/admin.Service.interface';
import { IUserService } from '../../interfaces/serviceInterfaces/user.Service.interface';
import { IVendorService } from '../../interfaces/serviceInterfaces/vendor.service.interface';
import HTTP_statusCode from '../../enums/httpStatusCode';
import Messages from '../../enums/errorMessages';
import { VerifyVendorRequestDTO } from '../../dto/adminDTO';
import { AuthRequest } from '../../types/authRequest';
dotenv.config();


class AdminController {
  private adminService: IAdminService;
  private userService: IUserService;
  private vendorService: IVendorService;

  constructor(
    adminService: IAdminService,
    userService: IUserService,
    vendorService: IVendorService,
  ) {
    this.adminService = adminService;
    this.userService = userService;
    this.vendorService = vendorService;
  }

  getAllVendors = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const adminId = req.user?._id;
      if (!adminId) {
        res.status(HTTP_statusCode.BadRequest).json({ message: Messages.ADMIN_ID_MISSING });
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 6;
      const search = (req.query.search as string) || '';
      const status = req.query.status as string;
      const result = await this.vendorService.getVendors(page, limit, search, status);

      res.status(HTTP_statusCode.OK).json({
        vendors: result.vendors,
        totalPages: result.totalPages,
        currentPage: page,
        totalVendors: result.total,
      });
    } catch (error) {
      handleError(res, error, 'getAllVendors');
    }
  };

  VerifyVendor = async (req: Request, res: Response): Promise<void> => {
    try {
      const dto: VerifyVendorRequestDTO = {
        vendorId: req.params.vendorId,
        status: req.body.status,
        rejectionReason: req.body.rejectionReason,
      };

      if (!dto.vendorId) {
        res.status(400).json({ message: 'Invalid vendorId' });
        return;
      }

      const result = await this.vendorService.verifyVendor(
        dto.vendorId,
        dto.status,
        dto.rejectionReason,
      );

      if (result.success) {
        res.status(200).json({ message: result.message });
      } else {
        res.status(400).json({ message: result.message });
      }
    } catch (error) {
      handleError(res, error, 'verifyVendor');
    }
  };
}

export default AdminController;