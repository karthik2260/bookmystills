import { BlockStatus } from '../../../enums/commonEnums';
import { UserListServiceResult } from '../../../dto/user/auth/response/user.list.service.result';

export interface IUserManagementService {
  getUsers(
    page: number,
    limit: number,
    search: string,
    status?: string,
  ): Promise<UserListServiceResult>;

  SUserBlockUnblock(userId: string): Promise<BlockStatus>;
}
