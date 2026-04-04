import { LoginResponseDTO } from './login.response.dto';

export interface LoginServiceResult extends LoginResponseDTO {
  refreshToken: string;
}
