import { UserDocument } from '../../models/userModel';
import { LoginUserDTO } from '../../dto/user/auth/response/login.user.dto';
import { UserListItemDTO } from '../../dto/user/auth/response/user.list.item.dto';

export class UserMapper {
  static toLoginDTO(user: UserDocument): LoginUserDTO {
    return new LoginUserDTO({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      imageUrl: user.imageUrl,
      isActive: user.isActive,
      isGoogleUser: user.isGoogleUser,
      contactinfo: user.contactinfo,

      createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : user.createdAt,
      updatedAt: user.updatedAt instanceof Date ? user.updatedAt.toISOString() : user.updatedAt,
    });
  }

  static toUserListItemDTO(user: UserDocument): UserListItemDTO {
    return new UserListItemDTO({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      contactinfo: user.contactinfo ?? undefined,
      imageUrl: user.imageUrl ?? undefined,
      isActive: user.isActive,
      isGoogleUser: user.isGoogleUser,
      createdAt: user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-GB') : '',
    });
  }
}
