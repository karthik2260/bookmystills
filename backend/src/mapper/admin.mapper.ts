import {   AdminLoginResponseDTO } from "../dto/adminDTO";
import { AdminDocument } from "../models/adminModel";

export const AdminMapper = {
    toAdminLoginResponse(admin:AdminDocument):AdminLoginResponseDTO{
           return {
              
      _id: admin._id.toString(),
      email: admin.email,
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt,


    }
    }
}
