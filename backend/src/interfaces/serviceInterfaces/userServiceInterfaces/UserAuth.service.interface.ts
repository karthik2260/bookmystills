import { LoginRequestDTO } from '../../../dto/user/auth/request/login.request.dto';
import { SignupRequestDTO } from '../../../dto/user/auth/request/signup.request.dto';
import { LoginResponseDTO } from '../../../dto/user/auth/response/login.response.dto';
import { LoginServiceResult } from '../../../dto/user/auth/response/login.service.result';

export interface IUserAuthService {
  signup(signupDto: SignupRequestDTO): Promise<void>;
  login(loginDto: LoginRequestDTO): Promise<LoginServiceResult>;
  resendNewOtp(email: string): Promise<string>;
  create_RefreshToken(refreshToken: string): Promise<string>;
}
