import { UserDTO } from '../dto/userDTO';
import { GoogleSignupResponseDTO, UserProfileResponseDTO, UserResponseDTO } from '../dto/userRequest.dto';
import { UserDocument } from '../models/userModel';

export const UserMapper = {
  toDTO(user: UserDocument): UserDTO {
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      contactinfo: user.contactinfo,
      imageUrl: user.imageUrl,
      isActive: user.isActive,
    };
  },

  toGoogleSignupDTO(user: UserDocument): GoogleSignupResponseDTO {
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      imageUrl: user.imageUrl,
      isActive: user.isActive,
    };
  },


 toResponseDTO(user: UserDocument): UserResponseDTO {
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      picture: user.imageUrl,
    };
  },



  toProfileDTO(user: UserDocument): UserProfileResponseDTO {
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      imageUrl: user.imageUrl,
    };
  },

};
