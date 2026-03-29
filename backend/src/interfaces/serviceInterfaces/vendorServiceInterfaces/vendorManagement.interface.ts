// File: interfaces/serviceInterfaces/vendorManagement.service.interface.ts

import { AcceptanceStatus, BlockStatus } from '../../../enums/commonEnums';
import { FindAllVendorsResult, VendorDetailsWithAll } from '../../commonInterfaces';

export interface IVendorManagementService {
  /**
   * Get paginated list of vendors with optional search and status filter
   */
  getVendors(
    page: number,
    limit: number,
    search: string,
    status?: string,
  ): Promise<FindAllVendorsResult>;

  /**
   * Verify a vendor and send email notification
   */
  verifyVendor(
    vendorId: string,
    status: AcceptanceStatus,
    reason?: string,
  ): Promise<{ success: boolean; message: string }>;

  /**
   * Get full details of a vendor including posts and images
   */
  getAllDetails(vendorId: string): Promise<VendorDetailsWithAll>;

  /**
   * Block or unblock a vendor
   */
  SVendorBlockUnblock(vendorId: string): Promise<BlockStatus>;
}
