import { Request, Response } from 'express';
import Messages from '../../enums/errorMessages';
import HTTP_statusCode from '../../enums/httpStatusCode';
import { IUserService } from '../../interfaces/serviceInterfaces/user.Service.interface';
import { handleError } from '../../util/handleError';
import { AuthenticatedRequest } from '../../types/userType';
import { IVendorService } from '../../interfaces/serviceInterfaces/vendor.service.interface';
import { UserMapper } from '../../mapper/user.mapper';
class UserProfileController {
  private userService: IUserService;
  private vendorService: IVendorService;

  constructor(userService: IUserService, vendorService: IVendorService) {
    this.userService = userService;
    this.vendorService = vendorService;
  }

  getUserProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

  updateProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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
      res.status(HTTP_statusCode.OK).json({ user });
    } catch (error) {
      handleError(res, error, 'updateProfile');
    }
  };
}

export default UserProfileController;