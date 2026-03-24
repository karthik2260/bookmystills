import { UserDocument } from '../../../models/userModel';



export interface IUserProfileService {
  getUserProfileService(userId: string): Promise<UserDocument>;
  updateProfileService(
    name?: string,
    contactinfo?: string,
    userId?: any,
    files?: Express.Multer.File | null,
  ): Promise<UserDocument>;
}