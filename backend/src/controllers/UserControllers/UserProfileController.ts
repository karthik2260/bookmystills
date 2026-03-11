import { Request, Response } from 'express';
import Messages from '../../enums/errorMessages';
import HTTP_statusCode from '../../enums/httpStatusCode';
import { IUserService } from '../../interfaces/serviceInterfaces/user.Service.interface';
import { handleError } from '../../util/handleError';
import { AuthenticatedRequestt } from '../../types/userType';
import { IVendorService } from '../../interfaces/serviceInterfaces/vendor.service.interface';
import { UserMapper } from '../../mapper/user.mapper';
import { AuthenticatedRequest } from '../../types/vendorTypes';
class UserProfileController {
  private userService: IUserService;
  private vendorService: IVendorService;
  private vendorManagementService:IVendorService

  constructor(userService: IUserService, vendorService: IVendorService) {
    this.userService = userService;
    this.vendorService = vendorService;
    this.vendorManagementService = this.vendorService
  }

  getUserProfile = async (req: AuthenticatedRequestt, res: Response): Promise<void> => {
    try {
      console.log('Inside getUserProfile');
      console.log('User ID:', req.user?._id);
      console.log('User role:', req.user?.role);
      
      const userId = req.user?._id;

      if (!userId) {
        res.status(HTTP_statusCode.BadRequest).json({ message: Messages.USER_ID_MISSING });
        return;
      }

      const result = await this.userService.getUserProfileService(userId.toString());
      const userDTO = UserMapper.toProfileDTO(result);
      res.status(HTTP_statusCode.OK).json(userDTO);
    } catch (error) {
      handleError(res, error, 'getUser');
    }
  };

  updateProfile = async (req: AuthenticatedRequestt, res: Response): Promise<void> => {
    try {
      const { name, contactinfo } = req.body;
      const userId = req.user?._id;

      if (!userId) {
        res.status(HTTP_statusCode.BadRequest).json({ message: Messages.USER_ID_MISSING });
        return;
      }

      if (
        (!name && !contactinfo && !req.file) ||
        (name === '' && contactinfo === '' && !req.file)
      ) {
        res.status(HTTP_statusCode.BadRequest).json({
          message: 'At least one field (name, contactinfo, or image) is required',
        });
        return;
      }
      
      const user = await this.userService.updateProfileService(
        name,
        contactinfo,
        userId,
        req.file || null,
      );

      if (!user) {
  throw new Error("User not found after update");
}

      const userProfileDTO = UserMapper.toProfileDTO(user)
      res.status(HTTP_statusCode.OK).json({ userProfileDTO });
    } catch (error) {
      handleError(res, error, 'updateProfile');
    }
  };


     getAllVendors= async(req:Request , res:Response) : Promise<void> => {
        try {
            const page = parseInt(req.query.page as string) || 1
            const limit = parseInt(req.query.limit as string) || 6
            const search = req.query.search as string || '' ;
            const status = req.query.status as string;
            const result = await this.vendorService.getVendors(page, limit, search,status)

            res.status(HTTP_statusCode.OK).json({
                vendors: result.vendors,
                totalPages : result.totalPages,
                currentPage : page,
                totalVendors : result.total
            })

        } catch (error) {
            handleError(res,error,'getAllVendors')
        }
    }

    
    
}

export default UserProfileController;