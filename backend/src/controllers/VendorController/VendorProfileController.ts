import { Request, Response } from 'express';
import { handleError } from '../../util/handleError';
import { AuthenticatedRequestt } from '../../types/userType';
import HTTP_statusCode from '../../enums/httpStatusCode';
import Messages from '../../enums/errorMessages';
import { IVendorService } from '../../interfaces/serviceInterfaces/vendor.service.interface';
import { AuthenticatedRequest } from '../../types/vendorTypes';
class VendorProfileController {
  private vendorService: IVendorService;

  constructor(vendorService: IVendorService) {
    this.vendorService = vendorService;
  }

  getVendorProfile = async (req: AuthenticatedRequestt, res: Response): Promise<void> => {
    try {
      const vendorId = req.user?._id;
      if (!vendorId) {
        res.status(HTTP_statusCode.BadRequest).json({ message: Messages.VENDOR_ID_MISSING });
        return;
      }

      const result = await this.vendorService.getVendorProfileService(vendorId.toString());
      res.status(HTTP_statusCode.OK).json(result);
    } catch (error) {
      handleError(res, error, 'getVendor');
    }
  };

  updateProfile = async (req: AuthenticatedRequestt, res: Response): Promise<void> => {
    try {
      const { name, contactinfo, companyName, city, about } = req.body;
      const vendorId = req.user?._id;

      if (!vendorId) {
        res.status(HTTP_statusCode.BadRequest).json({ message: Messages.VENDOR_ID_MISSING });
        return;
      }
      if (
        (!name && !contactinfo && !companyName && !city && !about && !req.file) ||
        (name === '' &&
          contactinfo === '' &&
          companyName === '' &&
          city === '' &&
          about === '' &&
          !req.file)
      ) {
        res.status(HTTP_statusCode.BadRequest).json({
          message:
            'At least one field (name, contactinfo, companyName, city, about, or image) is required',
        });
        return;
      }

      const vendor = await this.vendorService.updateProfileService(
        name,
        contactinfo,
        companyName,
        city,
        about,
        req.file || null,
        vendorId,
      );
      res.status(201).json(vendor);
    } catch (error) {
      handleError(res, error, 'updateProfile');
    }
  };

  getVendorWithAll = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        try {
            const vendorId = req.user?._id
            if (!vendorId) {
                res.status(HTTP_statusCode.BadRequest).json({ message: Messages.VENDOR_ID_MISSING });
                return;
            }

            const result = await this.vendorService.getAllDetails(vendorId.toString())

            res.status(HTTP_statusCode.OK).json({ vendor: result })

        } catch (error) {
            handleError(res, error, 'getVendorWithAll')
        }
    }


  
}

export default VendorProfileController;