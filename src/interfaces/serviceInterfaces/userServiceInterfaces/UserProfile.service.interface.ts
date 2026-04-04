import { ProfileUserDTO } from '../../../dto/user/profile/profile.user.dto';

export interface IUserProfileService {
  getUserProfileService(userId: string): Promise<ProfileUserDTO>;
  updateProfileService(
    name?: string,
    contactinfo?: string,
    userId?: string,
    files?: Express.Multer.File | null,
  ): Promise<ProfileUserDTO>;
}
