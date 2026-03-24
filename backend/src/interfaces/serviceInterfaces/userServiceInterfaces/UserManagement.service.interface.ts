

import { UserDocument } from '../../../models/userModel';
import { BlockStatus } from '../../../enums/commonEnums';


export interface IUserManagementService {
  getUsers(page: number, limit: number, search: string, status?: string): Promise<{ users: UserDocument[]; total: number; totalPages: number }>;
  SUserBlockUnblock(userId: string): Promise<BlockStatus>;
}

// this is for Usermanagement service interfae 