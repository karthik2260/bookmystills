import { UserDTO } from './userDTO';

export interface SignupRequestDTO {
  name: string;
  email: string;
  password: string;
  contactinfo: string;
}

export interface LoginRequestDTO {
  email: string;
  password: string;
}

export interface SignupResponseDTO {
  id: string;
  name: string;
  email: string;
  contactinfo?: string;
  imageUrl: string;
}

export interface ForgotPasswordRequestDTO {
  email: string;
}

export interface ChangePasswordRequestDTO {
  token: string;
  password: string;
}

export interface ChangePasswordRequestDTOO {
  currentPassword: string;
  newPassword: string;
}

export interface GoogleSignupRequestDTO {
  credential: string;
}

export interface GoogleSignupRequestDTOO {
  email: string;
  name: string;
  googleId: string;
}

export interface GoogleSignupResponseDTO {
  id: string;
  name: string;
  email: string;
  imageUrl?: string;
  isActive: boolean;
}

export interface GoogleLoginResponseDTO {
  user: UserDTO;
  isNewUser: boolean;
  token: string;
  refreshToken: string;
  message: string;
}


export interface UserResponseDTO {
  id: string;
  name: string;
  email: string;
  picture?: string;
}


export interface UserProfileResponseDTO {
  id:string;
  name:string;
  email:string;
  imageUrl?:string
}


