import {   AdminLoginResponseDTO, AdminUserListDTO } from "../dto/adminDTO";
import { AdminDocument } from "../models/adminModel";
import { UserDocument } from "../models/userModel";

export const AdminMapper = {
    toAdminLoginResponse(admin:AdminDocument):AdminLoginResponseDTO{
           return {
              
      _id: admin._id.toString(),
      email: admin.email,
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt,


    }
    },

      toAdminUserList(user: UserDocument): AdminUserListDTO {
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      contactinfo: user.contactinfo,
      imageUrl: user.imageUrl,
      isGoogleUser: !!user.googleId,
      isActive: user.isActive,
      createdAt: user.createdAt
    };
  }



    
}







