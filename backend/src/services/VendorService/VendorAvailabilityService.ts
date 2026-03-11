import { IVendorRepository } from '../../interfaces/repositoryInterfaces/vendor.Repository.interface';
import { CustomError } from '../../error/customError';
import HTTP_statusCode from '../../enums/httpStatusCode';
import { VendorDocument } from '../../models/vendorModel';


export class VendorAvailabilityService {
  private vendorRepository: IVendorRepository;

  constructor(vendorRepository: IVendorRepository) {
    this.vendorRepository = vendorRepository;
  }

  addDates = async (dates: string[], vendorId: string): Promise<{
    success: boolean;
    message: string;
    addedDates: string[];
    alreadyBookedDates: string[];
  }> => {
    try {
      const isValidDates = dates.every(date => {
        const dateRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
        return dateRegex.test(date);
      });

      if (!isValidDates)
        throw new CustomError('Invalid date format. Use DD/MM/YYYY', HTTP_statusCode.InternalServerError);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const hasInvalidDate = dates.some(date => {
        const [day, month, year] = date.split('/');
        const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        return dateObj < today;
      });

      if (hasInvalidDate)
        throw new CustomError('Cannot add dates from the past', HTTP_statusCode.InternalServerError);

      const { newDates, alreadyBooked } = await this.vendorRepository.addDates(dates, vendorId);

      if (newDates.length === 0 && alreadyBooked.length > 0) {
        return {
          success: false,
          message: 'All selected dates are already marked as unavailable',
          addedDates: [],
          alreadyBookedDates: alreadyBooked,
        };
      }

      return {
        success: true,
        message: 'Dates updated successfully',
        addedDates: newDates,
        alreadyBookedDates: alreadyBooked,
      };
    } catch (error) {
      console.error('Error in addDates:', error);
      throw new CustomError('Failed to addDates', HTTP_statusCode.InternalServerError);
    }
  };

  showDates = async (vendorId: string): Promise<VendorDocument | null> => {
    try {
      return await this.vendorRepository.getById(vendorId);
    } catch (error) {
      console.error('Error in showUnavailable dates:', error);
      throw new CustomError('Failed to get dates from database', HTTP_statusCode.InternalServerError);
    }
  };

  removeDates = async (dates: string[], vendorId: string): Promise<{
    success: boolean;
    removedDates: string[];
  }> => {
    try {
      const isValidDates = dates.every(date => {
        const dateRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
        return dateRegex.test(date);
      });

      if (!isValidDates)
        throw new CustomError('Invalid date format. Use DD/MM/YYYY', HTTP_statusCode.InternalServerError);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const hasInvalidDate = dates.some(date => {
        const [day, month, year] = date.split('/');
        const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        return dateObj < today;
      });

      if (hasInvalidDate)
        throw new CustomError('Cannot modify dates from the past', HTTP_statusCode.InternalServerError);

      const result = await this.vendorRepository.removeDates(dates, vendorId);

      return { success: true, removedDates: result.removedDates };
    } catch (error) {
      console.error('Error in removeDates:', error);
      throw error;
    }
  };
}