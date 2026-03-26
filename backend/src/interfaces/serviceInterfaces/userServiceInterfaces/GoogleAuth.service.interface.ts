import { GoogleAuthServiceResult } from '../../../dto/user/auth/response/google.auth.service.result';
import { GoogleUserData } from '../../commonInterfaces';
export interface IGoogleAuthService {
  authenticateGoogleLogin(userData: GoogleUserData): Promise<GoogleAuthServiceResult>;
}

// this is hte interface for googleauthentication only
