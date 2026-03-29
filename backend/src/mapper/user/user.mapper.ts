import { UserDocument } from '../../models/userModel';
import { LoginUserDTO } from '../../dto/user/auth/response/login.user.dto';
import { UserListItemDTO } from '../../dto/user/auth/response/user.list.item.dto';
import { ProfileUserDTO } from '../../dto/user/profile/profile.user.dto';

export class UserMapper {
  static toLoginDTO(user: UserDocument): LoginUserDTO {
    return new LoginUserDTO({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      imageUrl: user.imageUrl,
      isActive: user.isActive,
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

  static toProfileDTO(user: UserDocument): ProfileUserDTO {
  return new ProfileUserDTO({
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    imageUrl: user.imageUrl,
    contactinfo: user.contactinfo,
    createdAt: user.createdAt?.toISOString(),
    updatedAt: user.updatedAt?.toISOString(),
  });
}
}
