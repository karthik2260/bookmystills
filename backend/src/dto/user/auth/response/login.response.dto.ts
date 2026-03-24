import { LoginUserDTO } from './login.user.dto';

export class LoginResponseDTO {
  message: string;
  token: string;
  user: LoginUserDTO;

  constructor(data: {
    message: string;
    token: string;
    user: LoginUserDTO;
  }) {
    this.message = data.message;
    this.token   = data.token;
    this.user    = data.user;
  }
}