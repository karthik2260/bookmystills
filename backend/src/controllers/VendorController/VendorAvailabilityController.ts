import { Response } from 'express';
import { handleError } from '../../util/handleError';
import HTTP_statusCode from '../../enums/httpStatusCode';
import Messages from '../../enums/errorMessages';
import { IVendorService } from '../../interfaces/serviceInterfaces/vendor.service.interface';
import { AuthenticatedRequest } from '../../types/vendorTypes';

class VendorAvailabilityController {
  private vendorService: IVendorService;

  constructor(vendorService: IVendorService) {
    this.vendorService = vendorService;
  }

  showUnavailableDates = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const vendorId = req.user?._id;
      if (!vendorId) {
        res.status(HTTP_statusCode.Unauthorized).json({ success: false, message: Messages.VENDOR_ID_MISSING });
        return;
      }

      const result = await this.vendorService.showDates(vendorId.toString());

      res.status(HTTP_statusCode.OK).json({
        success: true,
        message: 'Data fetched successfully',
        result,
      });
    } catch (error) {
      handleError(res, error, 'showUnavailableDates');
    }
  };

  addUnavailableDates = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const vendorId = req.user?._id;
      const { dates } = req.body;

      if (!vendorId) {
        res.status(HTTP_statusCode.Unauthorized).json({ success: false, message: Messages.VENDOR_ID_MISSING });
        return;
      }

      const result = await this.vendorService.addDates(dates, vendorId.toString());

      if (result.success) {
        res.status(HTTP_statusCode.OK).json({
          success: true,
          message: result.message,
          addedDates: result.addedDates,
          alreadyBookedDates: result.alreadyBookedDates,
        });
        return;
      }

      res.status(HTTP_statusCode.OK).json({
        success: false,
        message: result.message,
        addedDates: [],
        alreadyBookedDates: result.alreadyBookedDates,
      });
    } catch (error) {
      handleError(res, error, 'addUnavailableDates');
    }
  };

  removeUnavailableDates = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const vendorId = req.user?._id;
      const { dates } = req.body;

      if (!vendorId) {
        res.status(HTTP_statusCode.Unauthorized).json({ success: false, message: Messages.VENDOR_ID_MISSING });
        return;
      }

      const result = await this.vendorService.removeDates(dates, vendorId.toString());

      res.status(HTTP_statusCode.OK).json({
        success: true,
        message: 'Dates updated successfully',
        updatedDates: result.removedDates,
      });
    } catch (error) {
      handleError(res, error, 'removeUnavailableDates');
    }
  };
}

export default VendorAvailabilityController;