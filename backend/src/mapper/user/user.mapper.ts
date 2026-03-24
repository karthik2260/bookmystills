import { UserDocument } from '../../models/userModel';
import { LoginUserDTO } from '../../dto/user/auth/response/login.user.dto';




export class UserMapper {
  static toLoginDTO(user: UserDocument): LoginUserDTO {
    return new LoginUserDTO({
      id:       user._id.toString(),
      name:     user.name,
      email:    user.email,
      imageUrl: user.imageUrl,
    });
  }
}