import { UserListItemDTO } from './user.list.item.dto';

export interface UserListServiceResult {
  users: UserListItemDTO[];
  total: number;
  totalPages: number;
}
