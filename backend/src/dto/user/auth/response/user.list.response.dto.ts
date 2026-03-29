import { UserListItemDTO } from './user.list.item.dto';

export class UserListResponseDTO {
  users: UserListItemDTO[];
  totalPages: number;
  currentPage: number;
  totalUsers: number;

  constructor(data: {
    users: UserListItemDTO[];
    totalPages: number;
    currentPage: number;
    totalUsers: number;
  }) {
    this.users = data.users;
    this.totalPages = data.totalPages;
    this.currentPage = data.currentPage;
    this.totalUsers = data.totalUsers;
  }
}
