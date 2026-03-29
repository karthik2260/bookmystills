export class LoginUserDTO {
  id: string;
  name: string;
  email: string;
  imageUrl?: string | undefined;
  contactinfo?: string;
  isActive: boolean;
  isGoogleUser: boolean;
  createdAt: string;
  updatedAt: string;

  constructor(data: {
    id: string;
    name: string;
    email: string;
    imageUrl?: string;
    isActive: boolean;
    isGoogleUser: boolean;
    createdAt: string;
    updatedAt: string;
    contactinfo?: string;
  }) {
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
    this.imageUrl = data.imageUrl;
    this.isActive = data.isActive;
    this.isGoogleUser = data.isGoogleUser;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.contactinfo = data.contactinfo;
  }
}
