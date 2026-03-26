import { LoginUserDTO } from './login.user.dto';

export interface GoogleAuthServiceResult {
  token: string;
  refreshToken: string;
  user: LoginUserDTO;
  message: string;
  isNewUser: boolean;
}
