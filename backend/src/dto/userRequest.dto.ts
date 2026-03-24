import { UserDTO } from './userDTO';









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
  id: string;
  name: string;
  email: string;
  imageUrl?: string;
  contactinfo?: string;
  isActive: boolean;
  isGoogleUser?: boolean;
  createdAt: string;
  updatedAt: string;
}



