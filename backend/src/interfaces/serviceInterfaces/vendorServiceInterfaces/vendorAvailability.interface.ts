// File: interfaces/serviceInterfaces/vendorAvailability.service.interface.ts

import { VendorDocument } from '../../../models/vendorModel';
export interface IVendorAvailabilityService {
  addDates(
    dates: string[],
    vendorId: string,
  ): Promise<{
    success: boolean;
    message: string;
    addedDates: string[];
    alreadyBookedDates: string[];
  }>;

  showDates(vendorId: string): Promise<VendorDocument | null>;

  removeDates(
    dates: string[],
    vendorId: string,
  ): Promise<{
    success: boolean;
    removedDates: string[];
  }>;
}
