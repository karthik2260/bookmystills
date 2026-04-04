// File: interfaces/serviceInterfaces/vendorAvailability.service.interface.ts

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

  showDates(vendorId: string): Promise<string[]>;

  removeDates(
    dates: string[],
    vendorId: string,
  ): Promise<{
    success: boolean;
    removedDates: string[];
  }>;
}
